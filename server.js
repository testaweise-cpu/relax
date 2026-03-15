import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors());
app.use(express.json());

// In production, serve the built Vite frontend
if (isProduction) {
    app.use(express.static(path.join(__dirname, 'dist'), {
        setHeaders: (res, customPath) => {
            if (customPath.endsWith('.html')) {
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
            } else if (customPath.includes('/assets/')) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }
        }
    }));
}

// Load configuration from environment securely
const NOBLE_SYNC_TOKEN = process.env.NOBLE_SYNC_TOKEN;
const NOBLE_SYNC_BASE_URL = process.env.NOBLE_SYNC_BASE_URL || 'https://noble-atlas.de/wp-json/noble-bordell-sync/v1';
const NOBLE_SYNC_BORDELL_ID = process.env.NOBLE_SYNC_BORDELL_ID || '5607';

if (!NOBLE_SYNC_TOKEN) {
    console.warn('WARNING: NOBLE_SYNC_TOKEN is not set in environment variables!');
}

// Temporary debug endpoint — remove after confirming Railway env vars
app.get('/api/debug-env', (req, res) => {
    res.json({
        token_set: !!NOBLE_SYNC_TOKEN,
        token_prefix: NOBLE_SYNC_TOKEN ? NOBLE_SYNC_TOKEN.substring(0, 8) + '...' : 'NOT SET',
        base_url: NOBLE_SYNC_BASE_URL,
        bordell_id: NOBLE_SYNC_BORDELL_ID,
        node_env: process.env.NODE_ENV,
    });
});

// Debug: test upstream Noble Atlas call directly from this server
app.get('/api/debug-upstream', async (req, res) => {
    try {
        const url = `${NOBLE_SYNC_BASE_URL}/bordells/${NOBLE_SYNC_BORDELL_ID}/sedcards`;
        const headers = {
            'Authorization': `Bearer ${NOBLE_SYNC_TOKEN}`,
            'Accept': 'application/json',
            'Origin': 'https://relax-production.up.railway.app',
            'Referer': 'https://relax-production.up.railway.app/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        };
        const upstream = await fetch(url, { headers });
        const body = await upstream.text();
        const resHeaders = {};
        upstream.headers.forEach((v, k) => resHeaders[k] = v);

        res.json({
            url,
            headers_sent: headers,
            upstream_status: upstream.status,
            upstream_ok: upstream.ok,
            response_headers: resHeaders,
            body: body
        });
    } catch (e) {
        res.json({ error: e.message });
    }
});

// Debug: test AJAX fallback
app.get('/api/debug-ajax', async (req, res) => {
    try {
        const baseUrl = NOBLE_SYNC_BASE_URL.split('/wp-json')[0];
        const url = `${baseUrl}/wp-admin/admin-ajax.php?action=noble_bordell_sync_get_sedcards&bordell_id=${NOBLE_SYNC_BORDELL_ID}&token=${NOBLE_SYNC_TOKEN}`;
        const upstream = await fetch(url, {
            headers: {
                'Origin': 'https://relax-production.up.railway.app',
                'Referer': 'https://relax-production.up.railway.app/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const body = await upstream.text();
        res.json({ url, status: upstream.status, body: body.substring(0, 500) });
    } catch (e) {
        res.json({ error: e.message });
    }
});

// Simple in-memory cache
let modelsCache = {
    data: null,
    lastFetched: null,
    TTL: 5 * 60 * 1000 // 5 minutes in milliseconds
};

/**
 * Fetch all models for the configured Bordell
 * GET /api/models?page=1&per_page=12&search=...
 */
app.get('/api/models', async (req, res) => {
    try {
        const { page = 1, per_page = 15, search = '' } = req.query;

        // URL exactly as specified: https://noble-atlas.de/wp-json/noble-bordell-sync/v1/bordells/5607/sedcards
        let url = `${NOBLE_SYNC_BASE_URL}/bordells/${NOBLE_SYNC_BORDELL_ID}/sedcards`;

        // Add params if they are standard for the API
        const params = new URLSearchParams();
        if (page > 1) params.append('page', page);
        if (per_page != 15) params.append('per_page', per_page);
        if (search) params.append('search', search);

        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;

        console.log(`[NobleSync] Requesting: ${url}`);
        console.log(`[NobleSync] Token Prefix: ${NOBLE_SYNC_TOKEN ? NOBLE_SYNC_TOKEN.substring(0, 10) : 'MISSING'}`);

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${NOBLE_SYNC_TOKEN}`,
                'Accept': 'application/json',
                'Origin': 'https://relax-production.up.railway.app',
                'Referer': 'https://relax-production.up.railway.app/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[NobleSync] Error ${response.status}: ${errorText.substring(0, 200)}`);
            return res.status(response.status).json({ error: 'Failed to fetch models from external API.' });
        }

        const data = await response.json();

        if (data.success && data.data) {
            res.json({
                items: data.data.items || [],
                pagination: data.data.pagination || {},
                bordell: data.data.bordell || {}
            });
        } else {
            res.json({ items: [], pagination: {}, bordell: {} });
        }

    } catch (error) {
        console.error('[NobleSync] Internal Server Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * Fetch a single model by identifier (slug or ID)
 * GET /api/models/:identifier
 */
app.get('/api/models/:identifier', async (req, res) => {
    const { identifier } = req.params;

    try {
        const url = `${NOBLE_SYNC_BASE_URL}/sedcards/${identifier}/detail?bordell_id=${NOBLE_SYNC_BORDELL_ID}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${NOBLE_SYNC_TOKEN}`,
                'Accept': 'application/json',
                'Origin': 'https://relax-production.up.railway.app',
                'Referer': 'https://relax-production.up.railway.app/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            console.error(`Upstream API Error (Detail): ${response.status} ${response.statusText}`);
            return res.status(response.status).json({ error: 'Failed to fetch model details.' });
        }

        const data = await response.json();

        if (data.success && data.data) {
            // Return raw data as requested
            res.json(data.data);
        } else {
            res.status(404).json({ error: 'Model not found.' });
        }

    } catch (error) {
        console.error('Server error fetching single model:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Catch-all: serve React app for any non-API route (SPA support)
if (isProduction) {
    app.get('/{*path}', (req, res) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Secure API Proxy Server running on port ${PORT}`);
});

