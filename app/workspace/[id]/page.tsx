'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Upload,
  Search,
  Filter,
  Download,
  Trash2,
  Loader2,
} from 'lucide-react';

interface Entity {
  id: string;
  name: string;
  type: string;
  confidence: number;
  context: string;
}

interface Relationship {
  id: string;
  fromEntity: Entity;
  toEntity: Entity;
  relationshipType: string;
  strength: number;
}

interface WorkspaceData {
  id: string;
  name: string;
  description: string | null;
  entities: Entity[];
  relationships: Relationship[];
  documents: any[];
}

const entityTypeColors: Record<string, string> = {
  PERSON: '#3b82f6',
  ORGANIZATION: '#8b5cf6',
  LOCATION: '#10b981',
  DATE: '#f59e0b',
  FEATURE: '#ec4899',
  CONCEPT: '#6366f1',
};

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const fetchWorkspace = useCallback(async () => {
    try {
      const res = await fetch(`/api/workspaces/${params.id}`);
      if (!res.ok) {
        router.push('/');
        return;
      }
      const data = await res.json();
      setWorkspace(data);
      buildGraph(data);
    } catch (error) {
      console.error('Failed to fetch workspace:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  const buildGraph = (data: WorkspaceData) => {
    const entityMap = new Map<string, Entity>();
    data.entities.forEach((e) => entityMap.set(e.id, e));

    const filteredEntities = data.entities.filter((e) => {
      const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'ALL' || e.type === filterType;
      return matchesSearch && matchesFilter;
    });

    const newNodes: Node[] = filteredEntities.map((entity, index) => ({
      id: entity.id,
      data: {
        label: (
          <div className="text-center">
            <div className="font-semibold text-sm">{entity.name}</div>
            <div className="text-xs opacity-75">{entity.type}</div>
          </div>
        ),
      },
      position: {
        x: Math.cos((index / filteredEntities.length) * 2 * Math.PI) * 300 + 400,
        y: Math.sin((index / filteredEntities.length) * 2 * Math.PI) * 300 + 300,
      },
      style: {
        background: entityTypeColors[entity.type] || '#6b7280',
        color: 'white',
        border: '2px solid white',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        width: 150,
      },
    }));

    const filteredEntityIds = new Set(filteredEntities.map((e) => e.id));
    const newEdges: Edge[] = data.relationships
      .filter(
        (rel) =>
          filteredEntityIds.has(rel.fromEntity.id) &&
          filteredEntityIds.has(rel.toEntity.id)
      )
      .map((rel) => ({
        id: rel.id,
        source: rel.fromEntity.id,
        target: rel.toEntity.id,
        label: rel.relationshipType,
        type: 'smoothstep',
        animated: rel.strength > 0.7,
        style: {
          stroke: '#a78bfa',
          strokeWidth: Math.max(1, rel.strength * 3),
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#a78bfa',
        },
        labelStyle: {
          fill: '#e9d5ff',
          fontSize: 10,
          fontWeight: 600,
        },
        labelBgStyle: {
          fill: '#581c87',
          fillOpacity: 0.8,
        },
      }));

    setNodes(newNodes);
    setEdges(newEdges);
  };

  useEffect(() => {
    if (workspace) {
      buildGraph(workspace);
    }
  }, [searchTerm, filterType, workspace]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));

    try {
      const res = await fetch(`/api/workspaces/${params.id}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        await fetchWorkspace();
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const exportGraph = () => {
    if (!workspace) return;
    const data = {
      workspace: {
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
      },
      entities: workspace.entities,
      relationships: workspace.relationships,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workspace.name}-graph.json`;
    a.click();
  };

  const deleteWorkspace = async () => {
    if (!confirm('Are you sure you want to delete this workspace?')) return;

    try {
      await fetch(`/api/workspaces/${params.id}`, { method: 'DELETE' });
      router.push('/');
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const entityTypes = workspace
    ? Array.from(new Set(workspace.entities.map((e) => e.type)))
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!workspace) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                className="text-purple-200 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">{workspace.name}</h1>
              {workspace.description && (
                <p className="text-purple-200">{workspace.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={exportGraph}
              variant="outline"
              className="bg-white/5 border-purple-500/30 text-white hover:bg-white/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <Button
              onClick={deleteWorkspace}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20 h-[700px]">
              <CardHeader>
                <CardTitle className="text-white">Knowledge Graph</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)]">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  fitView
                  className="bg-slate-950/50 rounded-lg"
                >
                  <Background color="#a78bfa" gap={16} />
                  <Controls className="bg-purple-900/50" />
                </ReactFlow>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Upload Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <label className="block">
                  <input
                    type="file"
                    multiple
                    accept=".txt,.pdf"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <Button
                    disabled={uploading}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    asChild
                  >
                    <span>
                      {uploading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      {uploading ? 'Uploading...' : 'Upload Files'}
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-purple-200 mt-2">
                  Supports .txt and .pdf files (max 10)
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Search entities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/5 border-purple-500/30 text-white placeholder:text-purple-300"
                />
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    onClick={() => setFilterType('ALL')}
                    className={`cursor-pointer ${
                      filterType === 'ALL'
                        ? 'bg-purple-600'
                        : 'bg-purple-900/50'
                    }`}
                  >
                    ALL
                  </Badge>
                  {entityTypes.map((type) => (
                    <Badge
                      key={type}
                      onClick={() => setFilterType(type)}
                      style={{
                        backgroundColor:
                          filterType === type
                            ? entityTypeColors[type]
                            : `${entityTypeColors[type]}50`,
                      }}
                      className="cursor-pointer"
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-purple-200">
                <div className="flex justify-between">
                  <span>Documents:</span>
                  <span className="font-semibold">{workspace.documents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Entities:</span>
                  <span className="font-semibold">{workspace.entities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Relationships:</span>
                  <span className="font-semibold">
                    {workspace.relationships.length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
