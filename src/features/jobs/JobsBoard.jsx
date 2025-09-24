import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useGetJobsQuery, useAddJobMutation, useUpdateJobMutation, useReorderJobsMutation } from '../api/apiSlice';
import { Plus, Edit, Archive, Inbox, GripVertical, X, Search, FileText } from 'lucide-react';
import { useUser } from '../../App';
import '../../App.css';

// --- Job Modal (for Create/Edit) ---
const JobModal = ({ isOpen, onClose, initialData }) => {
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState('');
    const [status, setStatus] = useState('active');
    const [error, setError] = useState('');
    const [addJob, { isLoading: isAdding }] = useAddJobMutation();
    const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();
    const isEditMode = Boolean(initialData);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setTitle(initialData.title);
                setTags(initialData.tags.join(', '));
                setStatus(initialData.status);
            } else {
                setTitle(''); setTags(''); setStatus('active');
            }
            setError('');
        }
    }, [isOpen, initialData, isEditMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) { setError('Job title is required.'); return; }
        const jobData = { /* ... */ };
        try {
            if (isEditMode) { await updateJob({ id: initialData.id, ...jobData }).unwrap(); }
            else { await addJob(jobData).unwrap(); }
            onClose();
        } catch (err) {
            if (err.status === 409) {
                setError(err.data.error); // Show unique slug error
            } else {
                setError('A server error occurred. Please try again.');
            }
        }
    };

    if (!isOpen) return null;
    return (
        <div className="modal-backdrop" onClick={onClose}><div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{isEditMode ? 'Edit Job' : 'Create Job'}</h2><button onClick={onClose} className="delete-btn"><X className="icon"/></button></div>
            <form onSubmit={handleSubmit}><div className="modal-body">
                {error && <div className="error-banner">{error}</div>}
                <div className="form-group"><label>Job Title</label><input type="text" value={title} onChange={e=>setTitle(e.target.value)}/></div>
                <div className="form-group"><label>Tags</label><input type="text" value={tags} onChange={e=>setTags(e.target.value)}/></div>
                <div className="form-group"><label>Status</label><select value={status} onChange={e=>setStatus(e.target.value)}><option value="active">Active</option><option value="archived">Archived</option></select></div>
            </div><div className="modal-footer">
                <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={isAdding || isUpdating}>{isAdding || isUpdating ? 'Saving...' : 'Save'}</button>
            </div></form>
        </div></div>
    );
};

// --- Draggable Job Item ---
const JobItem = ({ job, onEdit }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: job.id });
    const [updateJob] = useUpdateJobMutation();
    const { role } = useUser();
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    const handleToggleArchive = () => updateJob({ id: job.id, status: job.status === 'active' ? 'archived' : 'active' });

    return (
        <div ref={setNodeRef} style={style} className="job-item-container">
            {role === 'hr' && ( <div {...attributes} {...listeners} className="drag-handle"><GripVertical className="icon"/></div> )}
            <div className="job-item-content">
                <h3 className="job-title">{job.title}</h3>
                <div className="job-tags">{job.tags.map(tag => <span key={tag} className="job-tag">{tag}</span>)}</div>
            </div>
            <div className="job-item-actions">
                {/* Candidates only see an "Active" status for clarity */}
                {role === 'hr' && ( <span className={`job-status status-${job.status}`}>{job.status}</span> )}
                {role === 'hr' ? (
                    <>
                        <button onClick={() => onEdit(job)} className="action-btn" title="Edit"><Edit className="icon"/></button>
                        <button onClick={handleToggleArchive} className="action-btn" title={job.status==='active'?'Archive':'Unarchive'}>{job.status==='active'?<Archive className="icon"/>:<Inbox className="icon"/>}</button>
                    </>
                ) : (
                    <Link to={`/take-assessment/${job.id}`} className="btn-primary">Take Assessment</Link>
                )}
            </div>
        </div>
    );
};

// --- Main Jobs Board Component ---
const JobsBoard = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [activeId, setActiveId] = useState(null);
    const [jobs, setJobs] = useState([]);
    const { role } = useUser();

    // This is the key fix: The API will now only request 'active' jobs for candidates.
    const finalStatusForQuery = role === 'candidate' ? 'active' : status;
    const queryArgs = { page, search, status: finalStatusForQuery };
    
    const { data, isLoading, isError, isFetching } = useGetJobsQuery(queryArgs);
    const [reorderJobs] = useReorderJobsMutation();

    useEffect(() => { if (data?.jobs) setJobs(data.jobs); }, [data]);

    const sensors = useSensors(useSensor(PointerSensor));
    const handleDragStart = (event) => setActiveId(event.active.id);
    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);
        if (over && active.id !== over.id) {
            setJobs((currentJobs) => arrayMove(currentJobs, currentJobs.findIndex(j => j.id === active.id), currentJobs.findIndex(j => j.id === over.id)));
            reorderJobs({ fromId: active.id, toId: over.id });
        }
    };
    const openEditModal = (job) => { setEditingJob(job); setIsModalOpen(true); };
    const openCreateModal = () => { setEditingJob(null); setIsModalOpen(true); };
    const totalPages = data ? Math.ceil(data.total / 10) : 0;
    const activeJob = activeId ? jobs.find(job => job.id === activeId) : null;

    return (
        <div className="jobs-board">
            <div className="board-header">
                <h2>{role === 'hr' ? 'Job Postings' : 'Available Positions'}</h2>
                {role === 'hr' && ( <button onClick={openCreateModal} className="btn-primary"><Plus className="icon"/> Create Job</button> )}
            </div>
            <div className="filters">
                 <div className="search-input"><Search className="icon search-icon"/><input type="search" placeholder="Search..." value={search} onChange={e => {setSearch(e.target.value); setPage(1);}}/></div>
                 {role === 'hr' && (
                    <select className="status-filter" value={status} onChange={e => {setStatus(e.target.value); setPage(1);}}>
                        <option value="all">All Statuses</option><option value="active">Active</option><option value="archived">Archived</option>
                    </select>
                 )}
                {isFetching && !isLoading && <div className="fetching-indicator">...</div>}
            </div>
            {isError && <div className="error-banner">Failed to load jobs.</div>}
            <div className="jobs-list-container">
                {isLoading ? <div className="loading-state">Loading...</div> : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} disabled={role !== 'hr'}>
                        <SortableContext items={jobs.map(j => j.id)} disabled={role !== 'hr'}>
                            <div className="jobs-list">
                                {jobs.map(job => <JobItem key={job.id} job={job} onEdit={openEditModal} />)}
                            </div>
                        </SortableContext>
                        <DragOverlay>
                            {activeJob ? <JobItem job={activeJob} onEdit={() => {}} /> : null}
                        </DragOverlay>
                    </DndContext>
                )}
            </div>
            {totalPages > 1 && (
                 <div className="pagination">
                    <button onClick={() => setPage(p => p-1)} disabled={page === 1}>Prev</button>
                    <span>Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(p => p+1)} disabled={page === totalPages}>Next</button>
                </div>
            )}
            {role === 'hr' && <JobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={editingJob} />}
        </div>
    );
};

export default JobsBoard;

