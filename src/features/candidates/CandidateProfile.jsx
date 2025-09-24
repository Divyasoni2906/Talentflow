import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetCandidateByIdQuery, useGetCandidateTimelineQuery } from '../api/apiSlice';
import { User, Briefcase, Calendar, MessageSquare } from 'lucide-react';
import '../../App.css';

const CandidateProfile = () => {
    const { id } = useParams();
    const { data: candidate, isLoading: isLoadingCandidate, isError: isCandidateError } = useGetCandidateByIdQuery(id);
    const { data: timeline, isLoading: isLoadingTimeline, isError: isTimelineError } = useGetCandidateTimelineQuery(id);

    if (isLoadingCandidate) return <div className="loading-state">Loading candidate profile...</div>;
    if (isCandidateError) return <div className="error-state">Could not load candidate.</div>;

    return (
        <div className="candidate-profile-container">
            <div className="profile-header">
                <div className="profile-avatar"><User size={48} /></div>
                <div className="profile-info">
                    <h1>{candidate.name}</h1>
                    <p>{candidate.email}</p>
                    <div className="profile-meta">
                        <span><Briefcase className="icon" /> Applied for: {candidate.jobTitle}</span>
                        <span>Current Stage: <span className={`job-status status-${candidate.stage}`}>{candidate.stage}</span></span>
                    </div>
                </div>
            </div>

            <div className="profile-timeline">
                <h2>Candidate Timeline</h2>
                {isLoadingTimeline && <p>Loading timeline...</p>}
                {isTimelineError && <p>Could not load timeline.</p>}
                {timeline?.map(event => (
                    <div key={event.id} className="timeline-event">
                        <div className="timeline-icon"><Calendar className="icon" /></div>
                        <div className="timeline-content">
                            <p className="timeline-date">{new Date(event.date).toLocaleDateString()}</p>
                            <p className="timeline-title">{event.event}</p>
                            <p className="timeline-notes"><MessageSquare className="icon" />{event.notes}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CandidateProfile;