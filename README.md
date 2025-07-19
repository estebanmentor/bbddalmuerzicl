# Almuerzo.cl - Restaurant Data API Setup

This document explains how the server-side API endpoint `/api/restaurants` is configured and works within this Cloudflare Pages project.

## 1. How the "Server-Side" Works

This project uses **Cloudflare Functions**, a serverless platform. This means there is no traditional server to manage or configure. Your "server" is defined entirely by the code and file structure within this repository.

Cloudflare automatically detects the `functions` directory and deploys any `.js` file inside it as a live API endpoint.

## 2. Required File Structure

For the API to work, the files must be arranged exactly like this:

```
/
├── functions/
│   └── api/
│       ├── restaurants.js   (This is the server-side logic)
│       └── restaurants.json (This is the data)
└── README.md
```

- The path to the function file (`functions/api/restaurants.js`) directly creates the URL path for the API (`/api/restaurants`).
- The data file is placed next to the function file so it can be easily imported.

## 3. The Server Code (Copy & Paste)

This is the complete code for `functions/api/restaurants.js`. It handles API requests.

```javascript
// functions/api/restaurants.js

// Import the static JSON data directly from the same directory.
// This is a robust pattern for Cloudflare Pages Functions.
import restaurantData from './restaurants.json';

/**
 * Handles GET requests to /api/restaurants
 */
export async function onRequestGet(context) {
  // Return the imported restaurant data as a JSON response.
  // The `null, 2` argument formats the JSON nicely with indentation, making it easy to read in a browser.
  return new Response(JSON.stringify(restaurantData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Allows any website to call this API (public access)
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

/**
 * Handles OPTIONS requests (for CORS preflight)
 * This is necessary for browsers from other domains to allow cross-origin GET requests.
 */
export async function onRequestOptions(context) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400', // Cache preflight response for 24 hours
    }
  });
}
```

## 4. How to Access the API

Once your project is deployed to a URL like `https://your-project.pages.dev`, the API is instantly available. You can access it from any browser or API tool by making a **GET** request to:

**`https://your-project.pages.dev/api/restaurants`**

The API is public and does not require any credentials.
