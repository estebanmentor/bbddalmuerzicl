// functions/api/restaurants.js

// Import the static JSON data directly from the same directory.
// This is a more robust pattern for Cloudflare Pages Functions.
import restaurantData from './restaurants.json';

/**
 * Handles GET requests to /api/restaurants
 */
export async function onRequestGet(context) {
  // Return the imported restaurant data as a JSON response.
  return new Response(JSON.stringify(restaurantData), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Allow cross-origin requests
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

/**
 * Handles OPTIONS requests (for CORS preflight)
 * This is necessary for browsers to allow cross-origin requests.
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
