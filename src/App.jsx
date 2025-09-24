import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import JobsBoard from './features/jobs/JobsBoard';
import CandidatesBoard from './features/candidates/CandidatesBoard';
import CandidateProfile from './features/candidates/CandidateProfile';
import AssessmentBuilder from './features/assessments/AssessmentBuilder';
import AssessmentRuntime from './features/assessments/AssessmentRuntime';
import './App.css';

// Create a context to share the user role throughout the app
const UserContext = createContext();
export const useUser = () => useContext(UserContext);

// A simple protected route component
const ProtectedRoute = ({ children }) => {
    const { role } = useUser();
    if (role !== 'hr') {
        // Redirect to the jobs page if a candidate tries to access an HR-only page
        return <Navigate to="/jobs" replace />;
    }
    return children;
};

function App() {
  const [role, setRole] = useState('hr'); // 'hr' or 'candidate'
  const getNavLinkClass = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`;

  return (
    <Router>
      <UserContext.Provider value={{ role, setRole }}>
        <div className="app-container">
          <header className="app-header">
            <nav>
              <div className="nav-left">
                <h1>TalentFlow</h1>
              </div>
              <div className="nav-links">
                <NavLink to="/jobs" className={getNavLinkClass}>Jobs</NavLink>
                {/* HR-only links */}
                {role === 'hr' && (
                  <>
                    <NavLink to="/candidates" className={getNavLinkClass}>Candidates</NavLink>
                    <NavLink to="/assessments" className={getNavLinkClass}>Assessments</NavLink>
                  </>
                )}
              </div>
              <div className="role-switcher">
                <label className={role === 'candidate' ? 'active' : ''}>Candidate</label>
                <div className="toggle-switch" onClick={() => setRole(r => r === 'hr' ? 'candidate' : 'hr')}>
                  <div className={`toggle-knob ${role}`}></div>
                </div>
                <label className={role === 'hr' ? 'active' : ''}>HR</label>
              </div>
            </nav>
          </header>
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Navigate replace to="/jobs" />} />
              <Route path="/jobs" element={<JobsBoard />} />
              <Route path="/take-assessment/:jobId" element={<AssessmentRuntime />} />
              
              {/* Protected HR Routes */}
              <Route path="/candidates" element={<ProtectedRoute><CandidatesBoard /></ProtectedRoute>} />
              <Route path="/candidates/:id" element={<ProtectedRoute><CandidateProfile /></ProtectedRoute>} />
              <Route path="/assessments" element={<ProtectedRoute><AssessmentBuilder /></ProtectedRoute>} />
              <Route path="/assessments/:jobId" element={<ProtectedRoute><AssessmentBuilder /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </UserContext.Provider>
    </Router>
  );
}

export default App;

