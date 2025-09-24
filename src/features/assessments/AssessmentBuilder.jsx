import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetAssessmentQuery, useUpdateAssessmentMutation, useGetJobsQuery } from '../api/apiSlice';
import { Plus, Trash2, Save, FileText, CheckSquare, List, Type, Hash, X, Settings } from 'lucide-react';
import '../../App.css';

const QUESTION_TYPES = {
    'short-text': { label: 'Short Text', icon: <Type className="icon" /> },
    'long-text': { label: 'Long Text', icon: <FileText className="icon" /> },
    'single-choice': { label: 'Single Choice', icon: <List className="icon" /> },
    'multi-choice': { label: 'Multiple Choice', icon: <CheckSquare className="icon" /> },
    'numeric': { label: 'Numeric', icon: <Hash className="icon" /> },
};

// --- Sub-components ---
const ChoiceOptionsEditor = ({ question, sIndex, qIndex, handleStructureChange }) => {
    const handleOptionChange = (optIndex, value) => {
        const newOptions = [...question.options];
        newOptions[optIndex] = value;
        handleStructureChange(sIndex, qIndex, 'options', newOptions);
    };
    const addOption = () => {
        const newOptions = [...(question.options || []), `Option ${question.options.length + 1}`];
        handleStructureChange(sIndex, qIndex, 'options', newOptions);
    };
    const deleteOption = (optIndex) => {
        const newOptions = question.options.filter((_, i) => i !== optIndex);
        handleStructureChange(sIndex, qIndex, 'options', newOptions);
    };
    return (
        <div className="question-options-editor">
            {question.options?.map((opt, optIndex) => (
                <div key={optIndex} className="option-editor-row">
                    <input type="text" value={opt} onChange={(e) => handleOptionChange(optIndex, e.target.value)} className="option-input"/>
                    <button onClick={() => deleteOption(optIndex)} className="delete-btn small-btn"><X className="icon" /></button>
                </div>
            ))}
            <button onClick={addOption} className="btn-secondary add-option-btn"><Plus className="icon" /> Add Option</button>
        </div>
    );
};

const QuestionSettings = ({ question, sIndex, qIndex, allPreviousQuestions, handleStructureChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const handleValidationChange = (field, value) => {
        const newValidation = { ...(question.validation || { required: false }), [field]: value };
        handleStructureChange(sIndex, qIndex, 'validation', newValidation);
    };
    const handleConditionalChange = (field, value) => {
        const newConditional = { ...(question.conditional || { questionId: '', requiredAnswer: '' }), [field]: value };
        if (field === 'questionId' && !value) { newConditional.requiredAnswer = ''; }
        handleStructureChange(sIndex, qIndex, 'conditional', newConditional);
    };
    return (
        <div className="question-settings">
            <button onClick={() => setIsOpen(!isOpen)} className="settings-toggle-btn"><Settings className="icon" /> Settings</button>
            {isOpen && ( <div className="settings-content">
                <div className="setting-row"><input type="checkbox" id={`required-${question.id}`} checked={question.validation?.required || false} onChange={(e) => handleValidationChange('required', e.target.checked)}/><label htmlFor={`required-${question.id}`}>Required</label></div>
                {question.type === 'numeric' && ( <div className="setting-row numeric-range"><label>Range:</label><input type="number" placeholder="Min" value={question.validation?.min ?? ''} onChange={(e) => handleValidationChange('min', e.target.valueAsNumber)} /><span>-</span><input type="number" placeholder="Max" value={question.validation?.max ?? ''} onChange={(e) => handleValidationChange('max', e.target.valueAsNumber)} /></div> )}
                <div className="setting-row conditional-logic"><label>Show this question if:</label><select value={question.conditional?.questionId || ''} onChange={(e) => handleConditionalChange('questionId', e.target.value)}><option value="">Always</option>{allPreviousQuestions.map(q => ( <option key={q.id} value={q.id}>{q.label}</option> ))}</select>
                {question.conditional?.questionId && ( <><span>answer is</span><input type="text" placeholder="e.g., Yes" value={question.conditional?.requiredAnswer || ''} onChange={(e) => handleConditionalChange('requiredAnswer', e.target.value)}/></>)}</div>
            </div>)}
        </div>
    );
};

const PREVIEW_COMPONENTS = {
    'short-text': ({ label, validation }) => ( <div className="preview-question"><label>{label} {validation?.required && '*'}</label><input type="text" /></div> ),
    'long-text': ({ label, validation }) => ( <div className="preview-question"><label>{label} {validation?.required && '*'}</label><textarea rows="3"></textarea></div> ),
    'single-choice': ({ id, label, validation, options = [] }) => ( <div className="preview-question"><label>{label} {validation?.required && '*'}</label>{options.map((opt, i) => <div key={i} className="preview-option"><input type="radio" name={id} /><label>{opt}</label></div>)}</div> ),
    'multi-choice': ({ label, validation, options = [] }) => ( <div className="preview-question"><label>{label} {validation?.required && '*'}</label>{options.map((opt, i) => <div key={i} className="preview-option"><input type="checkbox" /><label>{opt}</label></div>)}</div> ),
    'numeric': ({ label, validation }) => ( <div className="preview-question"><label>{label} {validation?.required && '*'}</label><input type="number" min={validation?.min} max={validation?.max} /></div> ),
};

const FormPreview = ({ structure, allQuestions }) => {
    if (!structure) return <div className="empty-state">Select a job to see the preview.</div>;
    return (
        <div className="form-preview">
            <h2 className="preview-title">{structure.title || 'Assessment Preview'}</h2>
            {structure.sections?.map(section => (
                <div key={section.id} className="preview-section">
                    <h3 className="preview-section-title">{section.title}</h3>
                    {section.questions?.map(q => {
                        if (q.conditional?.questionId) {
                             const dependsOn = allQuestions.find(item => item.id === q.conditional.questionId);
                             if (dependsOn) { return <div key={q.id} className="preview-conditional-info"><em>Question "{q.label}" will show if "{dependsOn.label}" is answered with "{q.conditional.requiredAnswer}".</em></div>; }
                        }
                        const QuestionComponent = PREVIEW_COMPONENTS[q.type];
                        return QuestionComponent ? <QuestionComponent key={q.id} {...q} /> : null;
                    })}
                </div>
            ))}
        </div>
    );
};


// --- Main Builder Component ---
const AssessmentBuilder = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { data: jobsData, isLoading: isLoadingJobs } = useGetJobsQuery({ pageSize: 999 });
    const { data: assessment, isLoading: isLoadingAssessment } = useGetAssessmentQuery(jobId, { skip: !jobId });
    const [updateAssessment, { isLoading: isSaving }] = useUpdateAssessmentMutation();
    const [structure, setStructure] = useState(null);

    // This useEffect hook is now corrected to prevent state synchronization issues.
    useEffect(() => {
        // Only try to set the structure if a job is selected.
        if (jobId) {
            if (assessment?.structure) {
                // Sanitize incoming data to ensure it has the new properties
                const sanitized = { 
                    ...assessment.structure, 
                    sections: (assessment.structure.sections || []).map(s => ({ 
                        ...s, 
                        questions: (s.questions || []).map(q => ({ 
                            ...q, 
                            validation: q.validation || { required: false }, 
                            conditional: q.conditional || null 
                        }))
                    })) 
                };
                setStructure(sanitized);
            } else if (!isLoadingAssessment) {
                // If there's no assessment for this job, create a new blank one
                setStructure({ title: 'New Assessment', sections: [] });
            }
        } else {
            // If no job is selected, always clear the structure. This is the key fix.
            setStructure(null);
        }
    }, [assessment, jobId, isLoadingAssessment]);
    
    const handleStructureChange = (sIndex, qIndex, field, value) => {
        const newStructure = JSON.parse(JSON.stringify(structure));
        newStructure.sections[sIndex].questions[qIndex][field] = value;
        setStructure(newStructure);
    };
    
    const handleAddSection = () => setStructure(s => ({ ...s, sections: [...(s.sections || []), { id: `s-${Date.now()}`, title: 'New Section', questions: [] }] }));
    const handleDeleteSection = (sIndex) => setStructure(s => ({...s, sections: s.sections.filter((_, i) => i !== sIndex)}));
    const handleAddQuestion = (sIndex, type) => {
        const newQuestion = { id: `q-${Date.now()}`, type, label: 'New Question', validation: { required: false }, conditional: null, ...( (type === 'single-choice' || type === 'multi-choice') && { options: ['Option 1'] } )};
        setStructure(s => {
            const newStructure = JSON.parse(JSON.stringify(s));
            newStructure.sections[sIndex].questions.push(newQuestion);
            return newStructure;
        });
    };
    const handleDeleteQuestion = (sIndex, qIndex) => setStructure(s => {
        const newStructure = JSON.parse(JSON.stringify(s));
        newStructure.sections[sIndex].questions.splice(qIndex, 1);
        return newStructure;
    });

    const handleJobChange = (e) => navigate(`/assessments/${e.target.value}`);
    
    const handleSave = async () => {
        try {
            await updateAssessment({ jobId, structure }).unwrap();
            navigate('/assessments');
        } catch (err) { console.error("Failed to save assessment", err); }
    };
    
    const handleClear = () => setStructure({ title: 'New Assessment', sections: [] });
    
    const allQuestions = useMemo(() => structure?.sections?.flatMap(s => s.questions) || [], [structure]);

    return (
        <div className="assessment-builder-grid">
            <div className="builder-panel">
                <div className="builder-header">
                    <h1 className="builder-title">Assessment Builder</h1>
                    <div className="builder-header-buttons">
                        <button onClick={handleClear} disabled={!jobId || isSaving} className="btn-danger"><Trash2 className="icon" /> Clear Form</button>
                        <button onClick={handleSave} disabled={isSaving || !jobId} className="btn-primary"><Save className="icon" />{isSaving ? 'Saving...' : 'Save'}</button>
                    </div>
                </div>

                <div className="job-selector-container">
                    <label htmlFor="job-select">Select a Job</label>
                    <select id="job-select" value={jobId || ''} onChange={handleJobChange} disabled={isLoadingJobs || !jobsData?.jobs?.length}>
                        <option value="" disabled>{isLoadingJobs ? 'Loading jobs...' : (jobsData?.jobs?.length ? '-- Select a Job --' : 'No jobs found.')}</option>
                        {Array.isArray(jobsData?.jobs) && jobsData.jobs.map(job => (<option key={job.id} value={job.id}>{job.title}</option>))}
                    </select>
                </div>

                {jobId ? ( isLoadingAssessment ? <div className="loading-state">Loading...</div> : ( structure && (
                            <>
                                <input type="text" value={structure.title || ''} onChange={(e) => setStructure(s => ({ ...s, title: e.target.value }))} className="assessment-title-input" />
                                {structure.sections?.map((section, sIndex) => (
                                    <div key={section.id} className="builder-section">
                                        <div className="section-header">
                                            <input type="text" value={section.title} onChange={(e) => {
                                                const newStructure = JSON.parse(JSON.stringify(structure));
                                                newStructure.sections[sIndex].title = e.target.value;
                                                setStructure(newStructure);
                                            }} className="section-title-input" />
                                            <button onClick={() => handleDeleteSection(sIndex)} className="delete-btn"><Trash2 className="icon" /></button>
                                        </div>
                                        {section.questions?.map((q, qIndex) => {
                                            const prevQs = allQuestions.slice(0, allQuestions.findIndex(item => item.id === q.id));
                                            return (
                                                <div key={q.id} className="question-editor">
                                                    <div className="question-header">
                                                        <input value={q.label} onChange={(e) => handleStructureChange(sIndex, qIndex, 'label', e.target.value)} className="question-label-input" />
                                                        <button onClick={() => handleDeleteQuestion(sIndex, qIndex)} className="delete-btn small-btn"><X className="icon"/></button>
                                                    </div>
                                                    <div className="question-type-label">{QUESTION_TYPES[q.type].label}</div>
                                                    {(q.type === 'single-choice' || q.type === 'multi-choice') && ( <ChoiceOptionsEditor question={q} sIndex={sIndex} qIndex={qIndex} handleStructureChange={handleStructureChange} /> )}
                                                    <QuestionSettings question={q} sIndex={sIndex} qIndex={qIndex} allPreviousQuestions={prevQs} handleStructureChange={handleStructureChange} />
                                                </div>
                                            )
                                        })}
                                        <div className="add-question-toolbar">
                                            {Object.entries(QUESTION_TYPES).map(([type, { label, icon }]) => ( <button key={type} onClick={() => handleAddQuestion(sIndex, type)} className="add-question-btn">{icon} {label}</button>))}
                                        </div>
                                    </div>
                                ))}
                                <button onClick={handleAddSection} className="btn-secondary add-section-btn"><Plus className="icon" /> Add Section</button>
                            </>
                        ))) : ( !isLoadingJobs && <div className="empty-state"><p>Please select a job to begin.</p></div> )}
            </div>
            <div className="preview-panel">
               <FormPreview structure={structure} allQuestions={allQuestions} />
            </div>
        </div>
    );
};

export default AssessmentBuilder;

