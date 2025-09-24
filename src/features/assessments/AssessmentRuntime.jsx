import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetAssessmentQuery, useSubmitAssessmentMutation } from '../api/apiSlice';
import '../../App.css';

const AssessmentRuntime = () => {
    const { jobId } = useParams();
    const { data: assessment, isLoading, isError } = useGetAssessmentQuery(jobId);
    const [submitAssessment, { isLoading: isSubmitting, isSuccess, isError: isSubmitError }] = useSubmitAssessmentMutation();
    const [answers, setAnswers] = useState({});

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        submitAssessment({ jobId, submission: answers });
    };

    if (isLoading) return <div className="loading-state">Loading Assessment...</div>;
    if (isError) return <div className="error-state">Could not load this assessment.</div>;

    if (isSuccess) {
        return (
            <div className="assessment-runtime-container">
                <div className="submission-success">
                    <h2>Thank You!</h2>
                    <p>Your assessment has been submitted successfully.</p>
                    <Link to="/jobs" className="btn-primary">Back to Jobs</Link>
                </div>
            </div>
        );
    }
    
    // Check for conditional logic
    const isVisible = (question) => {
        if (!question.conditional?.questionId) return true;
        const requiredAnswer = question.conditional.requiredAnswer;
        const actualAnswer = answers[question.conditional.questionId];
        return actualAnswer === requiredAnswer;
    };


    return (
        <div className="assessment-runtime-container">
            <form onSubmit={handleSubmit}>
                <h1>{assessment.structure.title}</h1>
                <p>Please complete all required fields (*).</p>
                {isSubmitError && <div className="error-banner">There was an error submitting your assessment.</div>}

                {assessment.structure.sections?.map(section => (
                    <div key={section.id} className="runtime-section">
                        <h2>{section.title}</h2>
                        {section.questions?.filter(isVisible).map(q => {
                            // Render logic for different question types would go here
                            return (
                                <div key={q.id} className="runtime-question">
                                    <label>
                                        {q.label} {q.validation?.required && '*'}
                                    </label>
                                    <input 
                                        type="text" 
                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                        required={q.validation?.required}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ))}
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                </button>
            </form>
        </div>
    );
};

export default AssessmentRuntime;