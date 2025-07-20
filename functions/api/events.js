
// /functions/api/events.js

// Common headers for enabling Cross-Origin Resource Sharing (CORS).
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type', // Specifically allow Content-Type header
};

/**
 * Handles OPTIONS requests for CORS preflight. This is crucial for browser-based
 * clients to be able to send POST requests with a JSON body.
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
 * Handles POST requests to ingest a batch of user analytics events.
 */
export async function onRequestPost(context) {
  try {
    // Check if the content type is JSON
    if (context.request.headers.get('Content-Type') !== 'application/json') {
      return new Response(
        JSON.stringify({ error: 'Request must have Content-Type: application/json' }), {
          status: 415, // Unsupported Media Type
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }
    
    const events = await context.request.json();

    // Validate that the received data is a non-empty array
    if (!Array.isArray(events) || events.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Request body must be a non-empty JSON array.' }), {
          status: 400, // Bad Request
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // "Store" the data by logging it to the function's execution logs.
    // In a production setup, this would be replaced with a database insert (e.g., Cloudflare D1).
    console.log('Received customer_info batch:', JSON.stringify(events, null, 2));

    // Respond with 200 OK to signal success to the client.
    return new Response(JSON.stringify({ success: true, received_events: events.length }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Analytics ingestion error:', error);
    
    // Handle JSON parsing errors specifically
    if (error instanceof SyntaxError) {
        return new Response(
            JSON.stringify({ error: 'Invalid JSON in request body.' }), {
              status: 400, // Bad Request
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
    }

    // Generic server error for other issues
    const errorBody = JSON.stringify({ error: 'Failed to process analytics data.' });
    return new Response(errorBody, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}
