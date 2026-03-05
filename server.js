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
    app.use(express.static(path.join(__dirname, 'dist')));
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
        const upstream = await fetch(url, {
            headers: { 'Authorization': `Bearer ${NOBLE_SYNC_TOKEN}`, 'Accept': 'application/json' }
        });
        const body = await upstream.text();
        res.json({ upstream_status: upstream.status, upstream_ok: upstream.ok, body_preview: body.substring(0, 200) });
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
 * GET /api/models
 */
app.get('/api/models', async (req, res) => {
    try {
        // Check cache first
        if (modelsCache.data && modelsCache.lastFetched && (Date.now() - modelsCache.lastFetched < modelsCache.TTL)) {
            console.log('Serving /api/models from cache');
            return res.json(modelsCache.data);
        }

        const url = `${NOBLE_SYNC_BASE_URL}/bordells/${NOBLE_SYNC_BORDELL_ID}/sedcards`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${NOBLE_SYNC_TOKEN}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Upstream API Error (List): ${response.status} ${response.statusText}`);

            // Fallback to stale cache if available when upstream fails
            if (modelsCache.data) {
                console.log('Upstream failed, serving STALE cache for /api/models');
                return res.json(modelsCache.data);
            }

            return res.status(response.status).json({ error: 'Failed to fetch models from external API.' });
        }

        const data = await response.json();

        if (data.success && data.data && data.data.items) {
            // Update Cache
            modelsCache.data = data.data.items;
            modelsCache.lastFetched = Date.now();
            res.json(data.data.items);
        } else {
            res.json([]);
        }

    } catch (error) {
        console.error('Server error fetching models:', error.message);
        if (modelsCache.data) return res.json(modelsCache.data); // Fallback to stale cache
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * Fetch a single model by identifier (e.g. ID or slug)
 * GET /api/models/:identifier
 * 
 * Note: If the external API doesn't support a direct single-fetch by slug/id, 
 * we fetch the list and filter it, or use the direct endpoint if it exists.
 * Assuming fallback to list filter if specific endpoint isn't documented.
 */
app.get('/api/models/:identifier', async (req, res) => {
    const { identifier } = req.params;

    try {
        // Check cache for individual item to avoid hitting API
        if (modelsCache.data) {
            const model = modelsCache.data.find(m =>
                m.id.toString() === identifier ||
                m.slug.toLowerCase() === identifier.toLowerCase()
            );
            if (model) {
                console.log(`Serving /api/models/${identifier} from cache`);
                return res.json(model);
            }
        }

        const url = `${NOBLE_SYNC_BASE_URL}/bordells/${NOBLE_SYNC_BORDELL_ID}/sedcards`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${NOBLE_SYNC_TOKEN}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Upstream API Error (Single): ${response.status} ${response.statusText}`);
            return res.status(response.status).json({ error: 'Failed to fetch model details.' });
        }

        const data = await response.json();

        if (data.success && data.data && data.data.items) {
            const items = data.data.items;
            const model = items.find(m =>
                m.id.toString() === identifier ||
                m.slug.toLowerCase() === identifier.toLowerCase()
            );

            if (model) {
                res.json(model);
            } else {
                res.status(404).json({ error: 'Model not found.' });
            }
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
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Secure API Proxy Server running on port ${PORT}`);
});

