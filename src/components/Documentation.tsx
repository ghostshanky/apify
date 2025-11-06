import { Book, Code2, Key, Send, CheckCircle } from 'lucide-react';

export default function Documentation() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Documentation</h2>

      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Book className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Getting Started</h3>
          </div>
          <p className="text-slate-700 leading-relaxed mb-4">
            WebAPI Gateway allows you to interact with any website through a simple REST API. Turn
            any web resource into an API endpoint with full control over headers, methods, and
            request bodies.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> This service acts as a proxy to make web requests on your
              behalf, allowing you to bypass CORS restrictions and access websites programmatically.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <Key className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Authentication</h3>
          </div>
          <p className="text-slate-700 mb-4">
            All API requests require an API key. Include your API key in the request headers:
          </p>
          <pre className="bg-slate-900 text-green-400 px-4 py-3 rounded-lg text-sm overflow-x-auto">
            {`X-API-Key: your_api_key_here`}
          </pre>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Send className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">API Endpoint</h3>
          </div>
          <p className="text-slate-700 mb-4">Base URL:</p>
          <pre className="bg-slate-900 text-green-400 px-4 py-3 rounded-lg text-sm overflow-x-auto mb-4">
            {`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/web-scraper`}
          </pre>
          <p className="text-slate-700 mb-2">Method: POST</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Code2 className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Request Format</h3>
          </div>
          <p className="text-slate-700 mb-4">Send a POST request with the following JSON body:</p>
          <pre className="bg-slate-900 text-green-400 px-4 py-3 rounded-lg text-sm overflow-x-auto">
            {JSON.stringify(
              {
                url: 'https://example.com/api/endpoint',
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: 'Optional request body for POST/PUT/PATCH',
              },
              null,
              2
            )}
          </pre>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-teal-100 p-2 rounded-lg">
              <CheckCircle className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Response Format</h3>
          </div>
          <p className="text-slate-700 mb-4">Successful responses include:</p>
          <pre className="bg-slate-900 text-green-400 px-4 py-3 rounded-lg text-sm overflow-x-auto">
            {JSON.stringify(
              {
                success: true,
                statusCode: 200,
                statusText: 'OK',
                headers: {
                  'content-type': 'application/json',
                },
                data: {
                  message: 'Response data from the target website',
                },
                duration: 342,
                timestamp: '2024-01-15T10:30:00.000Z',
              },
              null,
              2
            )}
          </pre>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Example: cURL</h3>
          <pre className="bg-slate-900 text-green-400 px-4 py-3 rounded-lg text-sm overflow-x-auto">
            {`curl -X POST \\
  ${import.meta.env.VITE_SUPABASE_URL}/functions/v1/web-scraper \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key_here" \\
  -d '{
    "url": "https://jsonplaceholder.typicode.com/posts/1",
    "method": "GET"
  }'`}
          </pre>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Example: JavaScript</h3>
          <pre className="bg-slate-900 text-green-400 px-4 py-3 rounded-lg text-sm overflow-x-auto">
            {`const response = await fetch(
  '${import.meta.env.VITE_SUPABASE_URL}/functions/v1/web-scraper',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your_api_key_here'
    },
    body: JSON.stringify({
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      method: 'GET'
    })
  }
);

const data = await response.json();
console.log(data);`}
          </pre>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Example: Python</h3>
          <pre className="bg-slate-900 text-green-400 px-4 py-3 rounded-lg text-sm overflow-x-auto">
            {`import requests

url = '${import.meta.env.VITE_SUPABASE_URL}/functions/v1/web-scraper'
headers = {
    'Content-Type': 'application/json',
    'X-API-Key': 'your_api_key_here'
}
payload = {
    'url': 'https://jsonplaceholder.typicode.com/posts/1',
    'method': 'GET'
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print(data)`}
          </pre>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Supported HTTP Methods</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'].map((method) => (
              <div key={method} className="bg-slate-100 px-4 py-2 rounded-lg text-center font-mono">
                {method}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Use Cases</h3>
          <ul className="space-y-3 text-slate-700">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Bypass CORS restrictions in browser-based applications</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Scrape and extract data from websites programmatically</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Monitor website changes and availability</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Test APIs and webhooks from different locations</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Build integrations with services that lack official APIs</span>
            </li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Important Notes</h3>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-3">
              <span className="text-yellow-600 font-bold">•</span>
              <span>
                Respect website terms of service and robots.txt when accessing websites
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-600 font-bold">•</span>
              <span>Some websites may block automated requests or rate limit your access</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-600 font-bold">•</span>
              <span>Keep your API keys secure and never expose them in client-side code</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-600 font-bold">•</span>
              <span>Request timeouts are set to 30 seconds by default</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
