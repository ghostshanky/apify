import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Key, Plus, Trash2, Copy, Check, Eye, EyeOff } from 'lucide-react';

interface ApiKey {
  id: string;
  key_name: string;
  api_key: string;
  key_prefix: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

export default function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading API keys:', error);
      return;
    }

    setApiKeys(data || []);
  };

  const generateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'wag_';
    for (let i = 0; i < 48; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) return;

    const apiKey = generateApiKey();
    const keyPrefix = apiKey.substring(0, 12);

    const { error } = await supabase.from('api_keys').insert({
      user_id: user!.id,
      key_name: newKeyName,
      api_key: apiKey,
      key_prefix: keyPrefix,
      is_active: true,
    });

    if (error) {
      console.error('Error creating API key:', error);
      return;
    }

    setNewlyCreatedKey(apiKey);
    setNewKeyName('');
    loadApiKeys();
  };

  const deleteApiKey = async (id: string) => {
    const { error } = await supabase.from('api_keys').delete().eq('id', id);

    if (error) {
      console.error('Error deleting API key:', error);
      return;
    }

    loadApiKeys();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">API Keys</h2>
        <button
          onClick={() => setShowNewKeyModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          New API Key
        </button>
      </div>

      {apiKeys.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-12 text-center">
          <Key className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No API Keys</h3>
          <p className="text-slate-600 mb-4">Create your first API key to start making requests</p>
          <button
            onClick={() => setShowNewKeyModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Create API Key
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{key.key_name}</h3>
                  <p className="text-sm text-slate-500">
                    Created {new Date(key.created_at).toLocaleDateString()}
                  </p>
                  {key.last_used_at && (
                    <p className="text-sm text-slate-500">
                      Last used {new Date(key.last_used_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteApiKey(key.id)}
                  className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <code className="flex-1 bg-slate-100 px-4 py-3 rounded-lg font-mono text-sm text-slate-700">
                  {visibleKeys.has(key.id) ? key.api_key : `${key.key_prefix}${'•'.repeat(40)}`}
                </code>
                <button
                  onClick={() => toggleKeyVisibility(key.id)}
                  className="p-3 hover:bg-slate-100 rounded-lg transition"
                >
                  {visibleKeys.has(key.id) ? (
                    <EyeOff className="w-5 h-5 text-slate-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-600" />
                  )}
                </button>
                <button
                  onClick={() => copyToClipboard(key.api_key, key.id)}
                  className="p-3 hover:bg-slate-100 rounded-lg transition"
                >
                  {copied === key.id ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-slate-600" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            {newlyCreatedKey ? (
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">API Key Created!</h3>
                <p className="text-slate-600 mb-4">
                  Save this key securely. You won't be able to see it again.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <code className="text-sm break-all text-green-900">{newlyCreatedKey}</code>
                </div>
                <button
                  onClick={() => {
                    copyToClipboard(newlyCreatedKey, 'new');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg mb-2 flex items-center justify-center gap-2 transition"
                >
                  {copied === 'new' ? (
                    <>
                      <Check className="w-5 h-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy to Clipboard
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setNewlyCreatedKey(null);
                    setShowNewKeyModal(false);
                  }}
                  className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 rounded-lg transition"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Create New API Key</h3>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Key Name
                  </label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="e.g., Production, Testing, Development"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={createApiKey}
                    disabled={!newKeyName.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Key
                  </button>
                  <button
                    onClick={() => {
                      setShowNewKeyModal(false);
                      setNewKeyName('');
                    }}
                    className="flex-1 border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
