import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key',
};

interface ScrapeRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  actions?: Array<{
    type: 'click' | 'input' | 'wait' | 'scroll';
    selector?: string;
    value?: string;
    duration?: number;
  }>;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const apiKey = req.headers.get('X-API-Key');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required. Include X-API-Key header.' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('id, user_id, is_active')
      .eq('api_key', apiKey)
      .maybeSingle();

    if (keyError || !keyData || !keyData.is_active) {
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive API key' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyData.id);

    const requestData: ScrapeRequest = await req.json();
    
    if (!requestData.url) {
      return new Response(
        JSON.stringify({ error: 'URL is required in request body' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const startTime = Date.now();

    const targetUrl = requestData.url;
    const method = requestData.method || 'GET';
    const headers = requestData.headers || {};
    const body = requestData.body;

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...headers,
      },
    };

    if (body && method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = body;
    }

    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type') || '';
    
    let responseData: any;
    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = {
        content: await response.text(),
        contentType,
      };
    }

    const duration = Date.now() - startTime;

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    const result = {
      success: true,
      statusCode: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data: responseData,
      duration,
      timestamp: new Date().toISOString(),
    };

    await supabase.from('api_requests').insert({
      user_id: keyData.user_id,
      api_key_id: keyData.id,
      target_url: targetUrl,
      method,
      request_data: requestData,
      response_data: result,
      status_code: response.status,
      duration_ms: duration,
    });

    await supabase
      .from('user_profiles')
      .update({ total_requests: supabase.raw('total_requests + 1') })
      .eq('id', keyData.user_id);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});