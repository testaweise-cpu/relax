# Noble Atlas Server Integration

This project uses a server-side proxy to securely communicate with the Noble Atlas Sync API without exposing authentication tokens to the browser.

## Architecture

1.  **Backend (Express)**: `server.js` starts a local Node.js Express server on port 3001. It reads credentials from your `.env` file and proxies requests to `https://noble-atlas.de/wp-json/noble-bordell-sync/v1/bordells/...`
2.  **Frontend (Vite/React)**: The React app fetches data exclusively via internal endpoints (`/api/models` and `/api/models/:identifier`).
3.  **Proxy (Vite Config)**: During development, Vite is configured (in `vite.config.js`) to automatically proxy any request starting with `/api` to the backend running on `localhost:3001`.

## Starting the Application

We have updated the `package.json` to include `concurrently`, which allows you to start both the frontend and backend with a single command:

```bash
npm start
```

This runs both `npm run dev` (Vite) and `npm run server` (Express) simultaneously.

## Environment Variables (.env)

You MUST create a `.env` file in the root directory. Look at `.env.example` for the keys:

```env
# Noble Atlas Sync Authentication
# Get this from your external provider
NOBLE_SYNC_TOKEN=YOUR_SECRET_TOKEN

# Noble Atlas Data
NOBLE_SYNC_BASE_URL=https://noble-atlas.de/wp-json/noble-bordell-sync/v1
NOBLE_SYNC_BORDELL_ID=5607

# Local Server Configuration
PORT=3001
```

## Security & Error Handling

*   **No Tokens in Frontend**: The React application never sees or receives the `NOBLE_SYNC_TOKEN`.
*   **Upstream Errors Hidden**: If the Noble Atlas API goes down or returns an error, the backend logs the real reason but only sends a generic safe error (e.g., `"Failed to fetch models from external API"`) back to the frontend.
*   **Direct Local Links**: The frontend links between the Model directory (`/damen`) and Model detail page (`/damen/:identifier`) entirely within the local react-router context. External links to the Noble Atlas permalink are only provided once the user is already on the local detail page.
