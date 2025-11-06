import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Clock, ExternalLink, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ApiRequest {
  id: string;
  target_url: string;
  method: string;
  status_code: number | null;
  duration_ms: number | null;
  created_at: string;
  response_data: any;
  request_data: any;
}

export default function RequestHistory() {
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();

    const subscription = supabase
      .channel('api_requests_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'api_requests',
        },
        () => {
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadRequests = async () => {
    const { data, error } = await supabase
      .from('api_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading requests:', error);
      return;
    }

    setRequests(data || []);
    setLoading(false);
  };

  const getStatusColor = (status: number | null) => {
    if (!status) return 'bg-slate-100 text-slate-600';
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-700';
    if (status >= 300 && status < 400) return 'bg-blue-100 text-blue-700';
    if (status >= 400 && status < 500) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getStatusIcon = (status: number | null) => {
    if (!status) return <AlertCircle className="w-4 h-4" />;
    if (status >= 200 && status < 300) return <CheckCircle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Request History</h2>

      {requests.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-12 text-center">
          <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Requests Yet</h3>
          <p className="text-slate-600">Your API requests will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                      {request.method}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${getStatusColor(
                        request.status_code
                      )}`}
                    >
                      {getStatusIcon(request.status_code)}
                      {request.status_code || 'N/A'}
                    </span>
                    {request.duration_ms && (
                      <span className="text-xs text-slate-500">{request.duration_ms}ms</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate text-sm">{request.target_url}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(request.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRequest && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Request Details</h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">URL</h4>
                <code className="block bg-slate-100 px-4 py-3 rounded-lg text-sm break-all">
                  {selectedRequest.target_url}
                </code>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Method</h4>
                  <span className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold inline-block">
                    {selectedRequest.method}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Status</h4>
                  <span
                    className={`px-3 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2 ${getStatusColor(
                      selectedRequest.status_code
                    )}`}
                  >
                    {getStatusIcon(selectedRequest.status_code)}
                    {selectedRequest.status_code || 'N/A'}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Duration</h4>
                  <span className="text-slate-700">{selectedRequest.duration_ms || 'N/A'}ms</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Request Data</h4>
                <pre className="bg-slate-100 px-4 py-3 rounded-lg text-sm overflow-x-auto">
                  {JSON.stringify(selectedRequest.request_data, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Response Data</h4>
                <pre className="bg-slate-100 px-4 py-3 rounded-lg text-sm overflow-x-auto max-h-96">
                  {JSON.stringify(selectedRequest.response_data, null, 2)}
                </pre>
              </div>
            </div>

            <button
              onClick={() => setSelectedRequest(null)}
              className="mt-6 w-full bg-slate-600 hover:bg-slate-700 text-white py-3 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
