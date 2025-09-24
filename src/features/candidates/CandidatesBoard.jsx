import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FixedSizeList as List } from 'react-window'; // Import for virtualization
import { useGetCandidatesQuery, useUpdateCandidateStageMutation } from '../api/apiSlice';
import { STAGE_LABELS, STAGE_ORDER } from '../../db';
import { Search, GripVertical } from 'lucide-react';
import '../../App.css';

// --- Draggable Candidate Card ---
// It's important to wrap this in React.memo for performance with virtualization
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
                <div 
                    className="drag-handle" 
                    {...attributes} 
                    {...listeners}
                    // Stop click propagation to prevent navigation when dragging
                    onClick={(e) => e.preventDefault()}
                >
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

// --- Virtualized & Droppable Column ---
const KanbanColumn = ({ id, title, candidates }) => {
    // The Row component that react-window will render for each item
    const Row = ({ index, style }) => (
        <div style={style}>
            <CandidateCard candidate={candidates[index]} />
        </div>
    );

    return (
        <div className="kanban-column">
            <h3 className="column-title">{title} ({candidates.length})</h3>
            <div className="column-content">
                {/* SortableContext needs the full list of IDs, even if they aren't rendered */}
                <SortableContext items={candidates.map(c => c.id)}>
                    <List
                        height={600} // This height should be adjusted based on your layout
                        itemCount={candidates.length}
                        itemSize={85} // The height of one card + margin
                        width="100%"
                        className="virtualized-list"
                    >
                        {Row}
                    </List>
                </SortableContext>
            </div>
        </div>
    );
};

// --- Main Candidates Board ---
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

