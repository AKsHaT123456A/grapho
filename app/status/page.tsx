'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';

interface HealthStatus {
  backend: boolean;
  database: boolean;
  llm: boolean;
  timestamp: string;
}

export default function StatusPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealth({
        backend: false,
        database: false,
        llm: false,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const StatusIndicator = ({ status, label }: { status: boolean; label: string }) => (
    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-purple-500/20">
      <span className="text-lg font-medium text-white">{label}</span>
      <div className="flex items-center gap-2">
        {status ? (
          <>
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <span className="text-green-400 font-semibold">Healthy</span>
          </>
        ) : (
          <>
            <XCircle className="w-6 h-6 text-red-400" />
            <span className="text-red-400 font-semibold">Unhealthy</span>
          </>
        )}
      </div>
    </div>
  );

  const allHealthy = health?.backend && health?.database && health?.llm;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-purple-200 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-2xl">System Status</CardTitle>
                  <CardDescription className="text-purple-200">
                    Monitor the health of backend services
                  </CardDescription>
                </div>
                <Button
                  onClick={checkHealth}
                  disabled={loading}
                  variant="outline"
                  className="bg-white/5 border-purple-500/30 text-white hover:bg-white/10"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && !health ? (
                <div className="text-center py-8 text-purple-200">
                  Checking system health...
                </div>
              ) : health ? (
                <>
                  <div className="mb-6 p-6 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                    <div className="flex items-center justify-center gap-3">
                      {allHealthy ? (
                        <>
                          <CheckCircle2 className="w-8 h-8 text-green-400" />
                          <span className="text-2xl font-bold text-white">All Systems Operational</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-8 h-8 text-red-400" />
                          <span className="text-2xl font-bold text-white">System Issues Detected</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <StatusIndicator status={health.backend} label="Backend API" />
                    <StatusIndicator status={health.database} label="Database Connection" />
                    <StatusIndicator status={health.llm} label="Gemini AI Connection" />
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-white/5 border border-purple-500/20">
                    <p className="text-sm text-purple-200">
                      Last checked: {new Date(health.timestamp).toLocaleString()}
                    </p>
                  </div>

                  {!health.llm && (
                    <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                      <p className="text-sm text-red-200">
                        <strong>Note:</strong> Make sure to set your GEMINI_API_KEY in the .env file.
                        Get your API key from{' '}
                        <a
                          href="https://makersuite.google.com/app/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-white"
                        >
                          Google AI Studio
                        </a>
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-red-400">
                  Failed to check system health
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
