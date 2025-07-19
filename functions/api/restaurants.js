// /functions/api/restaurants.js

import data from '../data/restaurants.json';

// Common headers for enabling Cross-Origin Resource Sharing (CORS).
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*', // Allow any headers, simplifies preflight
};

/**
 * Handles OPTIONS requests for CORS preflight. Browsers send these requests
 * to check permissions before making the actual request (e.g., GET).
 * This handler is essential for the frontend application to be able to call the API.
 */
export function onRequestOptions(context) {
  return new Response(null, {
    status: 204, // No Content
    headers: {
      ...corsHeaders,
      'Access-Control-Max-Age': '86400', // Cache preflight response for 24 hours
    },
  });
};

/**
 * Handles GET requests to fetch the restaurant data.
 * It returns the content of the local `restaurants.json` file.
 */
export function onRequestGet(context) {
  try {
    const body = JSON.stringify(data, null, 2);
    return new Response(body, {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Data serving error:', error);
    const errorBody = JSON.stringify({ error: 'Failed to prepare restaurant data.' });
    return new Response(errorBody, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
};