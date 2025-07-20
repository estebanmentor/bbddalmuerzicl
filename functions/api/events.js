
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
 * Stores each batch as a unique JSON file in a Cloudflare R2 bucket.
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

    // This is the R2 bucket you bind in your Cloudflare dashboard.
    const bucket = context.env.ANALYTICS_BUCKET;

    // Create a unique filename for this batch using a timestamp.
    const filename = `events-${new Date().toISOString()}.json`;

    // Upload the JSON data as a new file to the R2 bucket.
    await bucket.put(filename, JSON.stringify(events, null, 2));

    // Respond with 200 OK to signal success to the client.
    return new Response(JSON.stringify({ success: true, file_created: filename, received_events: events.length }), {
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

    // Generic server error for other issues, including R2 failures
    const errorBody = JSON.stringify({ error: 'Failed to process and store analytics data.' });
    return new Response(errorBody, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}
