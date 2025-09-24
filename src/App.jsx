import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import JobsBoard from './features/jobs/JobsBoard';
import CandidatesBoard from './features/candidates/CandidatesBoard';
import CandidateProfile from './features/candidates/CandidateProfile'; // New
import AssessmentBuilder from './features/assessments/AssessmentBuilder';
import AssessmentRuntime from './features/assessments/AssessmentRuntime'; // New
import './App.css';

function App() {
  const getNavLinkClass = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`;

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <nav>
            <div className="nav-left"><h1>TalentFlow</h1></div>
            <div className="nav-links">
              <NavLink to="/jobs" className={getNavLinkClass}>Jobs</NavLink>
              <NavLink to="/candidates" className={getNavLinkClass}>Candidates</NavLink>
              <NavLink to="/assessments" className={getNavLinkClass}>Assessments</NavLink>
            </div>
          </nav>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate replace to="/jobs" />} />
            <Route path="/jobs" element={<JobsBoard />} />
            <Route path="/candidates" element={<CandidatesBoard />} />
            <Route path="/candidates/:id" element={<CandidateProfile />} /> {/* New */}
            <Route path="/assessments" element={<AssessmentBuilder />} />
            <Route path="/assessments/:jobId" element={<AssessmentBuilder />} />
            <Route path="/take-assessment/:jobId" element={<AssessmentRuntime />} /> {/* New */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;