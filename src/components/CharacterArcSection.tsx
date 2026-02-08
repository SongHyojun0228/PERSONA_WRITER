import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PlusIcon, PencilIcon, TrashIcon } from './Icons';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CharacterArc {
  id: string;
  milestone: string;
  description?: string;
  emotional_state?: string;
  sort_order: number;
}

const SortableArcItem = ({
  arc,
  onEdit,
  onDelete,
}: {
  arc: CharacterArc;
  onEdit: (arc: CharacterArc) => void;
  onDelete: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: arc.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-forest-sub p-3 rounded-lg shadow-sm mb-2 cursor-move hover:shadow-md transition-shadow group"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h5 className="font-semibold text-ink dark:text-pale-lavender">{arc.milestone}</h5>
          {arc.emotional_state && (
            <span className="text-xs bg-primary-accent/10 dark:bg-dark-accent/20 text-primary-accent dark:text-dark-accent px-2 py-1 rounded mt-1 inline-block">
              {arc.emotional_state}
            </span>
          )}
          {arc.description && <p className="text-sm text-ink/70 dark:text-pale-lavender/70 mt-1">{arc.description}</p>}
        </div>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(arc);
            }}
            className="p-1 rounded hover:bg-blue-500/20 text-blue-500"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(arc.id);
            }}
            className="p-1 rounded hover:bg-red-500/20 text-red-500"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const CharacterArcSection = ({ characterId }: { characterId: string }) => {
  const [arcs, setArcs] = useState<CharacterArc[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArc, setEditingArc] = useState<CharacterArc | null>(null);
  const [milestone, setMilestone] = useState('');
  const [description, setDescription] = useState('');
  const [emotionalState, setEmotionalState] = useState('');

  useEffect(() => {
    if (characterId) {
      fetchArcs();
    }
  }, [characterId]);

  const fetchArcs = async () => {
    const { data, error } = await supabase
      .from('character_arcs')
      .select('*')
      .eq('character_id', characterId)
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setArcs(data);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = arcs.findIndex((a) => a.id === active.id);
    const newIndex = arcs.findIndex((a) => a.id === over.id);

    const reorderedArcs = arrayMove(arcs, oldIndex, newIndex).map((a, index) => ({
      ...a,
      sort_order: index,
    }));

    setArcs(reorderedArcs);

    // Update sort_order in database
    const updates = reorderedArcs.map((a) =>
      supabase
        .from('character_arcs')
        .update({ sort_order: a.sort_order, updated_at: new Date().toISOString() })
        .eq('id', a.id)
    );

    await Promise.all(updates);
  };

  const handleAdd = () => {
    setEditingArc(null);
    setMilestone('');
    setDescription('');
    setEmotionalState('');
    setIsModalOpen(true);
  };

  const handleEdit = (arc: CharacterArc) => {
    setEditingArc(arc);
    setMilestone(arc.milestone);
    setDescription(arc.description || '');
    setEmotionalState(arc.emotional_state || '');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!milestone.trim()) return;

    const arcData = {
      character_id: characterId,
      milestone,
      description: description || null,
      emotional_state: emotionalState || null,
      sort_order: editingArc ? editingArc.sort_order : arcs.length,
    };

    if (editingArc) {
      const { error } = await supabase
        .from('character_arcs')
        .update({ ...arcData, updated_at: new Date().toISOString() })
        .eq('id', editingArc.id);

      if (!error) {
        fetchArcs();
        setIsModalOpen(false);
      }
    } else {
      const { error } = await supabase.from('character_arcs').insert(arcData);

      if (!error) {
        fetchArcs();
        setIsModalOpen(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 아크를 삭제하시겠습니까?')) return;

    const { error } = await supabase.from('character_arcs').delete().eq('id', id);

    if (!error) {
      fetchArcs();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-bold text-ink dark:text-pale-lavender">캐릭터 아크 (성장/변화)</h4>
        <button
          onClick={handleAdd}
          className="flex items-center px-3 py-1 bg-primary-accent text-white rounded-lg hover:bg-primary-accent/90 text-sm"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          추가
        </button>
      </div>

      {arcs.length === 0 ? (
        <div className="text-center py-8 text-ink/60 dark:text-pale-lavender/60 bg-paper/50 dark:bg-midnight/50 rounded-lg">
          <p className="mb-2">아직 아크가 없습니다.</p>
          <button
            onClick={handleAdd}
            className="text-primary-accent dark:text-dark-accent hover:underline text-sm"
          >
            첫 번째 아크를 추가해보세요
          </button>
        </div>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={arcs.map((a) => a.id)} strategy={verticalListSortingStrategy}>
            <div>
              {arcs.map((arc) => (
                <SortableArcItem key={arc.id} arc={arc} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-midnight/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-paper dark:bg-forest-sub rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-ink dark:text-pale-lavender">
              {editingArc ? '아크 수정' : '새 아크 추가'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-ink dark:text-pale-lavender">
                  변화 지점/마일스톤
                </label>
                <input
                  type="text"
                  value={milestone}
                  onChange={(e) => setMilestone(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white dark:bg-midnight text-ink dark:text-pale-lavender"
                  placeholder="예: 첫 만남, 갈등, 화해, 깨달음"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-ink dark:text-pale-lavender">
                  감정 상태 (선택)
                </label>
                <input
                  type="text"
                  value={emotionalState}
                  onChange={(e) => setEmotionalState(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white dark:bg-midnight text-ink dark:text-pale-lavender"
                  placeholder="예: 두려움, 분노, 기쁨, 슬픔"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-ink dark:text-pale-lavender">
                  설명 (선택)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white dark:bg-midnight text-ink dark:text-pale-lavender h-24 resize-none"
                  placeholder="이 시점에서 캐릭터가 어떻게 변화하는지 설명하세요"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-primary-accent text-white rounded-lg hover:bg-primary-accent/90"
                >
                  {editingArc ? '수정' : '추가'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
