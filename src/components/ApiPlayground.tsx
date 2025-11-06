import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Play, Code, FileJson, Loader2 } from 'lucide-react';

interface ApiKey {
  api_key: string;
  key_name: string;
}

export default function ApiPlayground() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('{}');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    const { data } = await supabase
      .from('api_keys')
      .select('api_key, key_name')
      .eq('is_active', true);

    if (data && data.length > 0) {
      setApiKeys(data);
      setSelectedKey(data[0].api_key);
    }
  };

  const makeRequest = async () => {
    if (!selectedKey) {
      setError('Please select an API key');
      return;
    }

    if (!targetUrl) {
      setError('Please enter a target URL');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const requestData: any = {
        url: targetUrl,
        method,
      };

      if (headers.trim()) {
        try {
          requestData.headers = JSON.parse(headers);
        } catch (e) {
          throw new Error('Invalid headers JSON');
        }
      }

      if (body.trim() && method !== 'GET' && method !== 'HEAD') {
        requestData.body = body;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/web-scraper`;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': selectedKey,
        },
        body: JSON.stringify(requestData),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const exampleRequests = [
    {
      name: 'JSON Placeholder - Get Post',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      method: 'GET',
    },
    {
      name: 'JSON Placeholder - Create Post',
      url: 'https://jsonplaceholder.typicode.com/posts',
      method: 'POST',
      body: JSON.stringify(
        {
          title: 'Test Post',
          body: 'This is a test post',
          userId: 1,
        },
        null,
        2
      ),
    },
    {
      name: 'HTTPBin - Get IP',
      url: 'https://httpbin.org/ip',
      method: 'GET',
    },
  ];

  const loadExample = (example: typeof exampleRequests[0]) => {
    setTargetUrl(example.url);
    setMethod(example.method);
    setBody(example.body || '');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">API Playground</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Request Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">API Key</label>
                <select
                  value={selectedKey}
                  onChange={(e) => setSelectedKey(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  {apiKeys.map((key) => (
                    <option key={key.api_key} value={key.api_key}>
                      {key.key_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Target URL
                </label>
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="https://example.com/api"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Headers (JSON)
                </label>
                <textarea
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-mono text-sm"
                  rows={3}
                  placeholder='{"Content-Type": "application/json"}'
                />
              </div>

              {method !== 'GET' && method !== 'HEAD' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Request Body
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-mono text-sm"
                    rows={6}
                    placeholder="Request body content"
                  />
                </div>
              )}

              <button
                onClick={makeRequest}
                disabled={loading || !selectedKey}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Send Request
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Example Requests</h3>
            <div className="space-y-2">
              {exampleRequests.map((example, index) => (
                <button
                  key={index}
                  onClick={() => loadExample(example)}
                  className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition"
                >
                  <div className="font-medium text-slate-900">{example.name}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    {example.method} {example.url}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileJson className="w-5 h-5" />
              Response
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {response ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-sm text-slate-600">Status:</span>
                    <span
                      className={`ml-2 px-3 py-1 rounded-lg text-sm font-semibold ${
                        response.statusCode >= 200 && response.statusCode < 300
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {response.statusCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Duration:</span>
                    <span className="ml-2 text-slate-900 font-semibold">
                      {response.duration}ms
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Response Data</h4>
                  <pre className="bg-slate-900 text-green-400 px-4 py-3 rounded-lg text-sm overflow-x-auto max-h-[600px]">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <FileJson className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p>Send a request to see the response</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
