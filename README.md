# TalentFlow - A Mini Hiring Platform

TalentFlow is a modern, front-end-only React application designed to simulate a real-world hiring platform for HR teams. It provides a complete suite of tools to manage job postings, track candidates through the hiring pipeline, and build custom assessments—all without a traditional backend server.

**Live Demo Link:** `[Link to your deployed application]`

## ✅ Core Features Implemented

The application successfully implements all core features from the project description, divided into three primary workflows.

### 1. 📋 Jobs Board

* **Full CRUD for Jobs:** Create, edit, and archive job postings through an intuitive modal interface.
* **Drag-and-Drop Reordering:** Easily prioritize jobs by dragging them into the desired order, with smooth optimistic UI updates and backend error rollback.
* **Server-Like Pagination & Filtering:** Efficiently navigate through job postings with pagination and filter by job title or status.
* **Validation & Error Simulation:** The mock API correctly validates for unique job titles on creation and simulates a 10% server error rate on all write actions to test UI resilience.

### 2. 👥 Candidates Pipeline

* **Kanban Board:** Visualize and manage the entire candidate pipeline from "Applied" to "Hired" with a fully functional drag-and-drop Kanban board.
* **Virtualized List:** The candidate columns are built with **TanStack Virtual** to ensure high performance, effortlessly rendering lists of 1,000+ candidates without lag.
* **Candidate Profile & Timeline:** Click on any candidate to navigate to a dedicated profile page (`/candidates/:id`) that displays their details and a simulated timeline of their stage changes.
* **Real-time Search:** Instantly find any candidate across all stages by name or email.

### 3. 📝 Assessments Platform

* **Dynamic Assessment Builder:** Build custom, job-specific assessments with multiple sections and various question types (Short Text, Long Text, Single/Multiple Choice, Numeric).
* **Live Preview Pane:** A real-time preview of the candidate's form is rendered as you build it.
* **Advanced Validation & Logic:**
    * Mark questions as **required**.
    * Set **min/max ranges** for numeric answers.
    * Implement **conditional logic** to show questions based on previous answers.
* **Assessment "Runtime" for Candidates:** A dedicated interface allows users in the "Candidate" role to view, fill out, and submit assessments.

### 🎭 Simulated Role-Based UI

* **HR vs. Candidate Toggle:** A switch in the header allows you to toggle between "HR" and "Candidate" roles.
* **Conditional Rendering:** The UI intelligently adapts based on the selected role. HR users see administrative controls (edit, archive, create), while candidates see a public-facing view with options to "Take Assessment."

## 🛠️ Technical Stack & Architectural Decisions

This project leverages a modern, robust tech stack chosen to meet the specific "front-end-only" requirement while simulating a real-world application architecture.

| Technology              | Purpose & Rationale                                                                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React** | The core UI library for building a component-based, interactive user interface.                                                                                  |
| **Vite** | A next-generation frontend build tool that provides an extremely fast development experience.                                                                    |
| **Redux Toolkit Query** | For modern data fetching, caching, and state management. Chosen for its efficiency in handling server state, automatic re-fetching, and optimistic updates.        |
| **Mock Service Worker (MSW)** | To simulate a complete REST API without a backend. MSW intercepts actual network requests, making the front-end code identical to how it would be with a real server. |
| **Dexie.js (IndexedDB)**| For robust local persistence. All data is written to the browser's IndexedDB, ensuring the application state is fully restored on refresh.                       |
| **React Router** | For client-side routing, enabling navigation between the different sections as a true Single Page Application (SPA).                                            |
| **Dnd Kit** | A modern, accessible, and performant library for all drag-and-drop functionality.                                                                                |
| **TanStack Virtual** | Used to efficiently render the long list of candidates in the Kanban board, ensuring a smooth user experience with large datasets.                             |
| **Lucide React** | For a clean, lightweight, and consistent set of icons.                                                                                                           |

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js (v16 or later)
* npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```
    git clone [Your Repository URL]
    cd talentflow-project
    ```

2.  **Install NPM packages:**
    ```
    npm install
    ```

3.  **Run the development server:**
    ```
    npm run dev
    ```
