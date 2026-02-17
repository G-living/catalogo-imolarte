// workers/signature-generator.js
// Cloudflare Worker - Wompi Signature Generator
// Generates SHA-256 integrity signature for Wompi payments

export default {
  async fetch(request, env) {
    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // CORS headers for browser requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Parse request body
      const { amountInCents, reference, currency = 'COP' } = await request.json();

      // Validate required fields
      if (!amountInCents || !reference) {
        return new Response(
          JSON.stringify({ 
            error: 'Missing required fields: amountInCents and reference' 
          }), 
          { 
            status: 400,
            headers: corsHeaders
          }
        );
      }

      // Validate amount is a positive number
      if (typeof amountInCents !== 'number' || amountInCents <= 0) {
        return new Response(
          JSON.stringify({ 
            error: 'amountInCents must be a positive number' 
          }), 
          { 
            status: 400,
            headers: corsHeaders
          }
        );
      }

      // Get integrity key from environment secrets
      const integrityKey = env.WOMPI_INTEGRITY_KEY;
      
      if (!integrityKey) {
        console.error('WOMPI_INTEGRITY_KEY not configured');
        return new Response(
          JSON.stringify({ 
            error: 'Server configuration error' 
          }), 
          { 
            status: 500,
            headers: corsHeaders
          }
        );
      }

      // Generate signature: SHA-256(reference + amountInCents + currency + integrityKey)
      const concat = `${reference}${amountInCents}${currency}${integrityKey}`;
      
      const encoder = new TextEncoder();
      const data = encoder.encode(concat);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Return signature
      return new Response(
        JSON.stringify({ 
          integritySignature: signature,
          reference: reference,
          amountInCents: amountInCents,
          currency: currency
        }), 
        { 
          status: 200,
          headers: corsHeaders
        }
      );

    } catch (err) {
      console.error('Signature generation error:', err);
      return new Response(
        JSON.stringify({ 
          error: 'Signature generation failed',
          message: err.message 
        }), 
        { 
          status: 500,
          headers: corsHeaders
        }
      );
    }
  }
};
