import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  LogOut,
  Key,
  History,
  PlayCircle,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';
import ApiKeyManager from './ApiKeyManager';
import RequestHistory from './RequestHistory';
import ApiPlayground from './ApiPlayground';
import Documentation from './Documentation';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('playground');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const tabs = [
    { id: 'playground', label: 'Playground', icon: PlayCircle },
    { id: 'keys', label: 'API Keys', icon: Key },
    { id: 'history', label: 'History', icon: History },
    { id: 'docs', label: 'Documentation', icon: BookOpen },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
                <img src="https://ik.imagekit.io/Shanky/apify_logo.png" className="w-10 h-10"  />
              <div>
                <h1 className="text-xl font-bold text-slate-900">WebAPI Gateway</h1>
                <p className="text-xs text-slate-600 hidden sm:block">
                  Transform websites into APIs
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-slate-600">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-700" />
              ) : (
                <Menu className="w-6 h-6 text-slate-700" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-4 space-y-2">
              <div className="pb-3 mb-3 border-b border-slate-200">
                <p className="text-sm text-slate-600">{user?.email}</p>
              </div>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="hidden md:flex gap-2 mb-8 bg-white p-2 rounded-xl border border-slate-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition font-medium ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <main>
          {activeTab === 'playground' && <ApiPlayground />}
          {activeTab === 'keys' && <ApiKeyManager />}
          {activeTab === 'history' && <RequestHistory />}
          {activeTab === 'docs' && <Documentation />}
        </main>
      </div>
    </div>
  );
}

// <img src="https://ik.imagekit.io/Shanky/apify_logo.png" width="50" height="50"></img>