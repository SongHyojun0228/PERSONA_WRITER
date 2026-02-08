import { useState, useEffect } from 'react';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useProjectContext } from '../context/ProjectContext';
import { supabase } from '../lib/supabaseClient';
import { PlusIcon, PencilIcon, TrashIcon } from './Icons';

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  event_date?: string;
  sort_order: number;
}

const SortableEvent = ({
  event,
  onEdit,
  onDelete,
}: {
  event: TimelineEvent;
  onEdit: (event: TimelineEvent) => void;
  onDelete: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative pl-8 pb-8 group cursor-move">
      {/* Timeline dot and line */}
      <div className="absolute left-0 top-0 flex flex-col items-center">
        <div className="w-4 h-4 rounded-full bg-primary-accent dark:bg-dark-accent border-4 border-paper dark:border-forest-primary" />
        <div className="w-0.5 h-full bg-primary-accent/30 dark:bg-dark-accent/30" />
      </div>

      {/* Event card */}
      <div className="bg-white dark:bg-forest-sub rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            {event.event_date && (
              <span className="text-xs font-semibold text-primary-accent dark:text-dark-accent bg-primary-accent/10 dark:bg-dark-accent/20 px-2 py-1 rounded">
                {event.event_date}
              </span>
            )}
            <h4 className="font-bold text-lg text-ink dark:text-pale-lavender mt-2">{event.title}</h4>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(event);
              }}
              className="p-1 rounded hover:bg-blue-500/20 text-blue-500"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(event.id);
              }}
              className="p-1 rounded hover:bg-red-500/20 text-red-500"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        {event.description && (
          <p className="text-sm text-ink/70 dark:text-pale-lavender/70 whitespace-pre-wrap">{event.description}</p>
        )}
      </div>
    </div>
  );
};

export const Timeline = () => {
  const { project } = useProjectContext();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');

  useEffect(() => {
    if (project?.id) {
      fetchEvents();
    }
  }, [project?.id]);

  const fetchEvents = async () => {
    if (!project?.id) return;

    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('project_id', project.id)
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setEvents(data);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = events.findIndex((e) => e.id === active.id);
    const newIndex = events.findIndex((e) => e.id === over.id);

    const reorderedEvents = arrayMove(events, oldIndex, newIndex).map((e, index) => ({
      ...e,
      sort_order: index,
    }));

    setEvents(reorderedEvents);

    // Update sort_order in database
    const updates = reorderedEvents.map((e) =>
      supabase
        .from('timeline_events')
        .update({ sort_order: e.sort_order, updated_at: new Date().toISOString() })
        .eq('id', e.id)
    );

    await Promise.all(updates);
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setEventTitle('');
    setEventDescription('');
    setEventDate('');
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: TimelineEvent) => {
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventDescription(event.description || '');
    setEventDate(event.event_date || '');
    setIsModalOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!project?.id || !eventTitle.trim()) return;

    const eventData = {
      project_id: project.id,
      title: eventTitle,
      description: eventDescription || null,
      event_date: eventDate || null,
      sort_order: editingEvent ? editingEvent.sort_order : events.length,
    };

    if (editingEvent) {
      // Update
      const { error } = await supabase
        .from('timeline_events')
        .update({ ...eventData, updated_at: new Date().toISOString() })
        .eq('id', editingEvent.id);

      if (!error) {
        fetchEvents();
        setIsModalOpen(false);
      }
    } else {
      // Insert
      const { error } = await supabase.from('timeline_events').insert(eventData);

      if (!error) {
        fetchEvents();
        setIsModalOpen(false);
      }
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('이 이벤트를 삭제하시겠습니까?')) return;

    const { error } = await supabase.from('timeline_events').delete().eq('id', id);

    if (!error) {
      fetchEvents();
    }
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-ink dark:text-pale-lavender">📅 타임라인</h2>
          <p className="text-sm text-ink/60 dark:text-pale-lavender/60 mt-1">
            스토리의 사건을 시간순으로 정리하세요. 드래그해서 순서를 변경할 수 있습니다.
          </p>
        </div>
        <button
          onClick={handleAddEvent}
          className="flex items-center px-4 py-2 bg-primary-accent text-white rounded-lg hover:bg-primary-accent/90 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          이벤트 추가
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-ink/60 dark:text-pale-lavender/60 mb-4">
              아직 이벤트가 없습니다.
              <br />
              첫 번째 이벤트를 추가해보세요!
            </p>
            <button
              onClick={handleAddEvent}
              className="flex items-center px-4 py-2 bg-primary-accent text-white rounded-lg hover:bg-primary-accent/90"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              이벤트 추가
            </button>
          </div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={events.map((e) => e.id)} strategy={verticalListSortingStrategy}>
              <div className="max-w-3xl">
                {events.map((event) => (
                  <SortableEvent key={event.id} event={event} onEdit={handleEditEvent} onDelete={handleDeleteEvent} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add/Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-midnight/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-paper dark:bg-forest-sub rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-ink dark:text-pale-lavender">
              {editingEvent ? '이벤트 수정' : '새 이벤트 추가'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-ink dark:text-pale-lavender">날짜/시간 (선택)</label>
                <input
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white dark:bg-midnight text-ink dark:text-pale-lavender"
                  placeholder="예: 1월 5일, 새벽 3시, 여름"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-ink dark:text-pale-lavender">제목</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white dark:bg-midnight text-ink dark:text-pale-lavender"
                  placeholder="이벤트 제목을 입력하세요"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-ink dark:text-pale-lavender">설명 (선택)</label>
                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white dark:bg-midnight text-ink dark:text-pale-lavender h-32 resize-none"
                  placeholder="상세 설명을 입력하세요"
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
                  onClick={handleSaveEvent}
                  className="px-4 py-2 bg-primary-accent text-white rounded-lg hover:bg-primary-accent/90"
                >
                  {editingEvent ? '수정' : '추가'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
