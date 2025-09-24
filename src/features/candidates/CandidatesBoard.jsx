import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useVirtualizer } from '@tanstack/react-virtual'; // Import the new library
import { useGetCandidatesQuery, useUpdateCandidateStageMutation } from '../api/apiSlice';
import { STAGE_LABELS, STAGE_ORDER } from '../../db';
import { Search, GripVertical } from 'lucide-react';
import '../../App.css';

// --- Draggable Candidate Card (No changes) ---
const CandidateCard = React.memo(({ candidate }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: candidate.id,
    });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    return (
        <Link to={`/candidates/${candidate.id}`} className="candidate-card-link">
            <div ref={setNodeRef} style={style} className="candidate-card">
                <div className="drag-handle" {...attributes} {...listeners} onClick={(e) => e.preventDefault()}>
                    <GripVertical className="icon" />
                </div>
                <div className="card-content">
                    <p className="card-name">{candidate.name}</p>
                    <p className="card-email">{candidate.email}</p>
                </div>
            </div>
        </Link>
    );
});

// --- Virtualized & Droppable Column (Rewritten for TanStack Virtual) ---
const KanbanColumn = ({ id, title, candidates }) => {
    const parentRef = useRef(null);

    const rowVirtualizer = useVirtualizer({
        count: candidates.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 85, // Height of one card + margin
    });

    return (
        <div className="kanban-column">
            <h3 className="column-title">{title} ({candidates.length})</h3>
            <div ref={parentRef} className="column-content virtualized-list">
                <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                    <SortableContext items={candidates.map(c => c.id)}>
                        {rowVirtualizer.getVirtualItems().map(virtualItem => (
                            <div
                                key={virtualItem.key}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: `${virtualItem.size}px`,
                                    transform: `translateY(${virtualItem.start}px)`,
                                    padding: '5px 0',
                                }}
                            >
                                <CandidateCard candidate={candidates[virtualItem.index]} />
                            </div>
                        ))}
                    </SortableContext>
                </div>
            </div>
        </div>
    );
};

// --- Main Candidates Board (No other changes needed) ---
const CandidatesBoard = () => {
    const [search, setSearch] = useState('');
    const { data: candidatesData, isLoading, isError } = useGetCandidatesQuery({ search });
    const [updateCandidateStage] = useUpdateCandidateStageMutation();
    const [activeCandidate, setActiveCandidate] = useState(null);

    const columns = useMemo(() => {
        const initialColumns = STAGE_ORDER.reduce((acc, stage) => ({ ...acc, [stage]: [] }), {});
        if (!candidatesData?.candidates) return initialColumns;
        return candidatesData.candidates.reduce((acc, candidate) => {
            if (acc[candidate.stage]) {
                acc[candidate.stage].push(candidate);
            }
            return acc;
        }, initialColumns);
    }, [candidatesData]);

    const sensors = useSensors(useSensor(PointerSensor));

    const findContainer = (id) => {
        if (id in columns) return id;
        return STAGE_ORDER.find(key => columns[key].some(item => item.id === id));
    };

    const handleDragStart = (event) => {
        const { active } = event;
        const candidate = candidatesData.candidates.find(c => c.id === active.id);
        setActiveCandidate(candidate);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveCandidate(null);
        if (!over) return;
        const activeContainer = findContainer(active.id);
        const overContainer = findContainer(over.id);

        if (activeContainer && overContainer && activeContainer !== overContainer) {
            updateCandidateStage({
                candidateId: active.id,
                newStage: overContainer,
            });
        }
    };

    if (isLoading) return <div className="loading-state">Loading candidates...</div>;
    if (isError) return <div className="error-state">Failed to load candidates.</div>;

    return (
        <div className="kanban-board-container">
            <div className="board-header">
                <h2>Candidates Pipeline</h2>
                <div className="filters">
                    <div className="search-input">
                        <Search className="icon search-icon" />
                        <input
                            type="search"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="kanban-grid">
                    {STAGE_ORDER.map(stageId => (
                        <KanbanColumn
                            key={stageId}
                            id={stageId}
                            title={STAGE_LABELS[stageId]}
                            candidates={columns[stageId] || []}
                        />
                    ))}
                </div>
                <DragOverlay>
                    {activeCandidate ? (
                        <div className="candidate-card candidate-card-overlay">
                             <div className="drag-handle">
                                <GripVertical className="icon" />
                            </div>
                            <div className="card-content">
                                <p className="card-name">{activeCandidate.name}</p>
                                <p className="card-email">{activeCandidate.email}</p>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default CandidatesBoard;

