'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, FolderOpen, Network, FileText } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count: {
    documents: number;
    entities: number;
    relationships: number;
  };
}

export default function HomePage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch('/api/workspaces');
      const data = await res.json();
      setWorkspaces(data);
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newWorkspaceName,
          description: newWorkspaceDesc
        })
      });

      if (res.ok) {
        setNewWorkspaceName('');
        setNewWorkspaceDesc('');
        fetchWorkspaces();
      }
    } catch (error) {
      console.error('Failed to create workspace:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Network className="w-16 h-16 text-purple-400" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Knowledge Graph Builder
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Extract entities and relationships from your documents using AI.
            Build interactive knowledge graphs with ease.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto mb-8 bg-white/10 backdrop-blur-lg border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Create New Workspace</CardTitle>
            <CardDescription className="text-purple-200">
              Start by creating a workspace for your documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createWorkspace} className="space-y-4">
              <Input
                placeholder="Workspace name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="bg-white/5 border-purple-500/30 text-white placeholder:text-purple-300"
                required
              />
              <Input
                placeholder="Description (optional)"
                value={newWorkspaceDesc}
                onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                className="bg-white/5 border-purple-500/30 text-white placeholder:text-purple-300"
              />
              <Button
                type="submit"
                disabled={creating || !newWorkspaceName.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {creating ? 'Creating...' : 'Create Workspace'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <FolderOpen className="w-6 h-6 mr-2" />
            Recent Workspaces (Last 5)
          </h2>

          {loading ? (
            <div className="text-center text-purple-200 py-12">Loading...</div>
          ) : workspaces.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20">
              <CardContent className="py-12 text-center">
                <FileText className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-200 text-lg">
                  No workspaces yet. Create one to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.map((workspace) => (
                <Link key={workspace.id} href={`/workspace/${workspace.id}`}>
                  <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20 hover:bg-white/20 transition-all cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="text-white">{workspace.name}</CardTitle>
                      {workspace.description && (
                        <CardDescription className="text-purple-200">
                          {workspace.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-purple-200">
                        <div className="flex justify-between">
                          <span>Documents:</span>
                          <span className="font-semibold">{workspace._count.documents}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Entities:</span>
                          <span className="font-semibold">{workspace._count.entities}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Relationships:</span>
                          <span className="font-semibold">{workspace._count.relationships}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto mt-12 text-center">
          <Link href="/status">
            <Button variant="outline" className="bg-white/5 border-purple-500/30 text-white hover:bg-white/10">
              View System Status
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
