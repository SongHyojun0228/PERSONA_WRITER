import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, useDroppable, type DragEndEvent, type DragStartEvent, type DragOverEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useProjectContext } from '../context/ProjectContext';
import { supabase } from '../lib/supabaseClient';
import { PlusIcon, PencilIcon, TrashIcon } from './Icons';

interface PlotCard {
  id: string;
  title: string;
  content?: string;
  column_name: 'to-do' | 'in-progress' | 'done';
  sort_order: number;
}

interface Column {
  id: string;
  title: string;
  cards: PlotCard[];
}

const SortableCard = ({ card, onEdit, onDelete }: { card: PlotCard; onEdit: (card: PlotCard) => void; onDelete: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

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
      className="bg-white dark:bg-forest-sub p-4 rounded-lg shadow-md mb-3 cursor-move hover:shadow-lg transition-shadow group"
    >
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-ink dark:text-pale-lavender flex-1">{card.title}</h4>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card);
            }}
            className="p-1 rounded hover:bg-blue-500/20 text-blue-500"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card.id);
            }}
            className="p-1 rounded hover:bg-red-500/20 text-red-500"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      {card.content && (
        <p className="text-sm text-ink/70 dark:text-pale-lavender/70 mt-2 line-clamp-3">{card.content}</p>
      )}
    </div>
  );
};

const PlotColumn = ({
  column,
  onAddCard,
  onEditCard,
  onDeleteCard,
  isDraggingOver
}: {
  column: Column;
  onAddCard: (columnId: string) => void;
  onEditCard: (card: PlotCard) => void;
  onDeleteCard: (id: string) => void;
  isDraggingOver: boolean;
}) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-paper/50 dark:bg-midnight/50 p-4 rounded-lg min-h-[400px] flex flex-col transition-all duration-200 ${
        isDraggingOver
          ? 'ring-2 ring-primary-accent dark:ring-dark-accent bg-primary-accent/10 dark:bg-dark-accent/10 scale-[1.02]'
          : ''
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-ink dark:text-pale-lavender">{column.title}</h3>
        <button
          onClick={() => onAddCard(column.id)}
          className="p-1 rounded-full hover:bg-primary-accent/20 text-primary-accent dark:text-dark-accent"
          title="카드 추가"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>
      <SortableContext items={column.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1">
          {column.cards.map(card => (
            <SortableCard key={card.id} card={card} onEdit={onEditCard} onDelete={onDeleteCard} />
          ))}
          {/* Drop placeholder */}
          {isDraggingOver && column.cards.length === 0 && (
            <div className="border-2 border-dashed border-primary-accent dark:border-dark-accent rounded-lg p-8 text-center text-primary-accent dark:text-dark-accent opacity-50">
              여기에 놓기
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export const PlotBoard = () => {
  const { project } = useProjectContext();
  const [cards, setCards] = useState<PlotCard[]>([]);
  const [activeCard, setActiveCard] = useState<PlotCard | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<PlotCard | null>(null);
  const [newCardColumn, setNewCardColumn] = useState<string>('to-do');
  const [cardTitle, setCardTitle] = useState('');
  const [cardContent, setCardContent] = useState('');
  const [overColumn, setOverColumn] = useState<string | null>(null);

  const columns: Column[] = [
    { id: 'to-do', title: '📋 할 일', cards: cards.filter(c => c.column_name === 'to-do') },
    { id: 'in-progress', title: '🚧 진행 중', cards: cards.filter(c => c.column_name === 'in-progress') },
    { id: 'done', title: '✅ 완료', cards: cards.filter(c => c.column_name === 'done') },
  ];

  useEffect(() => {
    if (project?.id) {
      fetchCards();
    }
  }, [project?.id]);

  const fetchCards = async () => {
    if (!project?.id) return;

    const { data, error } = await supabase
      .from('plot_cards')
      .select('*')
      .eq('project_id', project.id)
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setCards(data);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const card = cards.find(c => c.id === event.active.id);
    setActiveCard(card || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;

    if (!over) {
      setOverColumn(null);
      return;
    }

    const overId = over.id as string;

    // Check if over a column
    const overCol = columns.find(col => col.id === overId);
    if (overCol) {
      setOverColumn(overCol.id);
      return;
    }

    // Check if over a card, find its column
    const overCard = cards.find(c => c.id === overId);
    if (overCard) {
      setOverColumn(overCard.column_name);
    } else {
      setOverColumn(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    setOverColumn(null);

    if (!over) return;

    const activeCard = cards.find(c => c.id === active.id);
    if (!activeCard) return;

    // Check if dropped on a column or another card
    const overColumn = columns.find(col => col.id === over.id);
    const overCard = cards.find(c => c.id === over.id);

    let newColumnName = activeCard.column_name;
    if (overColumn) {
      newColumnName = overColumn.id as PlotCard['column_name'];
    } else if (overCard) {
      newColumnName = overCard.column_name;
    }

    // Update card column
    if (newColumnName !== activeCard.column_name) {
      const { error } = await supabase
        .from('plot_cards')
        .update({ column_name: newColumnName, updated_at: new Date().toISOString() })
        .eq('id', activeCard.id);

      if (!error) {
        fetchCards();
      }
    }
  };

  const handleAddCard = (columnId: string) => {
    setNewCardColumn(columnId);
    setCardTitle('');
    setCardContent('');
    setEditingCard(null);
    setIsAddModalOpen(true);
  };

  const handleEditCard = (card: PlotCard) => {
    setEditingCard(card);
    setCardTitle(card.title);
    setCardContent(card.content || '');
    setNewCardColumn(card.column_name);
    setIsAddModalOpen(true);
  };

  const handleSaveCard = async () => {
    if (!project?.id || !cardTitle.trim()) return;

    const cardData = {
      project_id: project.id,
      title: cardTitle,
      content: cardContent || null,
      column_name: newCardColumn,
      sort_order: cards.filter(c => c.column_name === newCardColumn).length,
    };

    if (editingCard) {
      // Update
      const { error } = await supabase
        .from('plot_cards')
        .update({ ...cardData, updated_at: new Date().toISOString() })
        .eq('id', editingCard.id);

      if (!error) {
        fetchCards();
        setIsAddModalOpen(false);
      }
    } else {
      // Insert
      const { error } = await supabase
        .from('plot_cards')
        .insert(cardData);

      if (!error) {
        fetchCards();
        setIsAddModalOpen(false);
      }
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!window.confirm('이 카드를 삭제하시겠습니까?')) return;

    const { error } = await supabase
      .from('plot_cards')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchCards();
    }
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink dark:text-pale-lavender">📊 플롯 보드</h2>
        <p className="text-sm text-ink/60 dark:text-pale-lavender/60 mt-1">
          카드를 드래그해서 이동하세요. 각 열에서 + 버튼을 눌러 새 카드를 추가할 수 있습니다.
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-3 gap-4 min-w-[900px]">
            {columns.map(column => (
              <PlotColumn
                key={column.id}
                column={column}
                onAddCard={handleAddCard}
                onEditCard={handleEditCard}
                onDeleteCard={handleDeleteCard}
                isDraggingOver={overColumn === column.id}
              />
            ))}
          </div>
          <DragOverlay>
            {activeCard && (
              <div className="bg-white dark:bg-forest-sub p-4 rounded-lg shadow-xl cursor-grabbing">
                <h4 className="font-semibold text-ink dark:text-pale-lavender">{activeCard.title}</h4>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Add/Edit Card Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-midnight/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-paper dark:bg-forest-sub rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-ink dark:text-pale-lavender">
              {editingCard ? '카드 수정' : '새 카드 추가'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-ink dark:text-pale-lavender">제목</label>
                <input
                  type="text"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white dark:bg-midnight text-ink dark:text-pale-lavender"
                  placeholder="카드 제목을 입력하세요"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-ink dark:text-pale-lavender">설명 (선택)</label>
                <textarea
                  value={cardContent}
                  onChange={(e) => setCardContent(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white dark:bg-midnight text-ink dark:text-pale-lavender h-24 resize-none"
                  placeholder="상세 설명을 입력하세요"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveCard}
                  className="px-4 py-2 bg-primary-accent text-white rounded-lg hover:bg-primary-accent/90"
                >
                  {editingCard ? '수정' : '추가'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
