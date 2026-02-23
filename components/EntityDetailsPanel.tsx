'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Edit2, Save, Trash2, GitMerge, FileText, Link as LinkIcon } from 'lucide-react';

interface Entity {
  id: string;
  name: string;
  type: string;
  confidence: number;
  context: string;
  document?: {
    id: string;
    filename: string;
  };
  relationsFrom?: Array<{
    id: string;
    relationshipType: string;
    strength: number;
    context: string | null;
    toEntity: {
      id: string;
      name: string;
      type: string;
    };
  }>;
  relationsTo?: Array<{
    id: string;
    relationshipType: string;
    strength: number;
    context: string | null;
    fromEntity: {
      id: string;
      name: string;
      type: string;
    };
  }>;
}

interface EntityDetailsPanelProps {
  entity: Entity;
  allEntities: Entity[];
  onClose: () => void;
  onUpdate: () => void;
  onEntityClick: (entityId: string) => void;
}

const entityTypeColors: Record<string, string> = {
  PERSON: '#3b82f6',
  ORGANIZATION: '#8b5cf6',
  LOCATION: '#10b981',
  DATE: '#f59e0b',
  FEATURE: '#ec4899',
  CONCEPT: '#6366f1',
};

export default function EntityDetailsPanel({
  entity,
  allEntities,
  onClose,
  onUpdate,
  onEntityClick,
}: EntityDetailsPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(entity.name);
  const [editType, setEditType] = useState(entity.type);
  const [isMerging, setIsMerging] = useState(false);
  const [selectedMergeTarget, setSelectedMergeTarget] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/entities/${entity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, type: editType }),
      });

      if (res.ok) {
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update entity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete entity "${entity.name}"?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/entities/${entity.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onClose();
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to delete entity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = async () => {
    if (!selectedMergeTarget) return;
    if (!confirm(`Merge "${entity.name}" into the selected entity?`)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/entities/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: entity.id,
          targetId: selectedMergeTarget,
        }),
      });

      if (res.ok) {
        onClose();
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to merge entities:', error);
    } finally {
      setLoading(false);
    }
  };

  const allRelations = [
    ...(entity.relationsFrom || []).map((r) => ({
      type: 'outgoing' as const,
      relationshipType: r.relationshipType,
      strength: r.strength,
      context: r.context,
      entity: r.toEntity,
    })),
    ...(entity.relationsTo || []).map((r) => ({
      type: 'incoming' as const,
      relationshipType: r.relationshipType,
      strength: r.strength,
      context: r.context,
      entity: r.fromEntity,
    })),
  ];

  const entityTypes = ['PERSON', 'ORGANIZATION', 'LOCATION', 'DATE', 'FEATURE', 'CONCEPT'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-slate-900 border-purple-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-purple-500/20">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-white/5 border-purple-500/30 text-white text-xl font-bold"
                    placeholder="Entity name"
                  />
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full bg-white/5 border border-purple-500/30 text-white rounded-md px-3 py-2"
                  >
                    {entityTypes.map((type) => (
                      <option key={type} value={type} className="bg-slate-900">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <CardTitle className="text-white text-2xl">{entity.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      style={{ backgroundColor: entityTypeColors[entity.type] }}
                      className="text-white"
                    >
                      {entity.type}
                    </Badge>
                    <span className="text-sm text-purple-300">
                      Confidence: {(entity.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-purple-200 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={loading || !editName.trim()}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(entity.name);
                    setEditType(entity.type);
                  }}
                  variant="outline"
                  className="bg-white/5 border-purple-500/30 text-white hover:bg-white/10"
                  size="sm"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="bg-white/5 border-purple-500/30 text-white hover:bg-white/10"
                  size="sm"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={() => setIsMerging(!isMerging)}
                  variant="outline"
                  className="bg-white/5 border-purple-500/30 text-white hover:bg-white/10"
                  size="sm"
                >
                  <GitMerge className="w-4 h-4 mr-2" />
                  Merge
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={loading}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>

          {/* Merge UI */}
          {isMerging && (
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 space-y-3">
              <p className="text-sm text-purple-200">
                Select an entity to merge "{entity.name}" into:
              </p>
              <select
                value={selectedMergeTarget}
                onChange={(e) => setSelectedMergeTarget(e.target.value)}
                className="w-full bg-white/5 border border-purple-500/30 text-white rounded-md px-3 py-2"
              >
                <option value="" className="bg-slate-900">
                  -- Select target entity --
                </option>
                {allEntities
                  .filter((e) => e.id !== entity.id)
                  .map((e) => (
                    <option key={e.id} value={e.id} className="bg-slate-900">
                      {e.name} ({e.type})
                    </option>
                  ))}
              </select>
              <div className="flex gap-2">
                <Button
                  onClick={handleMerge}
                  disabled={loading || !selectedMergeTarget}
                  className="bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  Confirm Merge
                </Button>
                <Button
                  onClick={() => {
                    setIsMerging(false);
                    setSelectedMergeTarget('');
                  }}
                  variant="outline"
                  className="bg-white/5 border-purple-500/30 text-white hover:bg-white/10"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Source Context */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-400" />
              Source Snippet
            </h3>
            <div className="p-4 rounded-lg bg-white/5 border border-purple-500/20">
              <p className="text-sm text-purple-200 italic mb-2">
                From: {entity.document?.filename || 'Unknown document'}
              </p>
              <p className="text-white text-sm leading-relaxed">"{entity.context}"</p>
            </div>
          </div>

          {/* Linked Entities */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <LinkIcon className="w-5 h-5 mr-2 text-purple-400" />
              Linked Entities ({allRelations.length})
            </h3>
            {allRelations.length === 0 ? (
              <p className="text-purple-300 text-sm">No relationships found</p>
            ) : (
              <div className="space-y-3">
                {allRelations.map((rel, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-white/5 border border-purple-500/20 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => onEntityClick(rel.entity.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {rel.type === 'outgoing' ? (
                          <span className="text-purple-400">→</span>
                        ) : (
                          <span className="text-purple-400">←</span>
                        )}
                        <span className="font-semibold text-white">{rel.entity.name}</span>
                        <Badge
                          style={{ backgroundColor: entityTypeColors[rel.entity.type] }}
                          className="text-white text-xs"
                        >
                          {rel.entity.type}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-purple-300 border-purple-500/30">
                        {rel.relationshipType}
                      </Badge>
                    </div>
                    {rel.context && (
                      <p className="text-sm text-purple-200 italic pl-6">
                        Context: "{rel.context}"
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 pl-6">
                      <div className="flex-1 h-1 bg-purple-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500"
                          style={{ width: `${rel.strength * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-purple-300">
                        {(rel.strength * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
