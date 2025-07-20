
// /functions/index.js

// Common headers for enabling Cross-Origin Resource Sharing (CORS).
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

/**
 * Handles OPTIONS requests for CORS preflight. This is crucial for browser-based
 * clients to be able to access the API.
 */
export function onRequestOptions(context) {
  return new Response(null, {
    status: 204, // No Content
    headers: {
      ...corsHeaders,
      'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
    },
  });
}

/**
 * Handles GET requests to the root of the functions directory.
 * Provides a welcome message and lists available endpoints.
 */
export function onRequestGet(context) {
  const data = {
    message: "Welcome to the Almuerzo.cl API root.",
    description: "This is the entry point for the Almuerzo.cl serverless functions.",
    available_endpoints: [
      {
        path: "/api/restaurants",
        method: "GET",
        description: "Retrieves the full list of restaurant data."
      },
      {
        path: "/api/events",
        method: "POST",
        description: "Receives a batch of user analytics events and stores them as a JSON file in Cloudflare R2."
      }
    ]
  };

  const body = JSON.stringify(data, null, 2); // Pretty-print the JSON

  return new Response(body, {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}
