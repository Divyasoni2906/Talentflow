# TalentFlow - A Mini Hiring Platform

TalentFlow is a modern, front-end-only React application designed to simulate a real-world hiring platform for HR teams. It provides a complete suite of tools to manage job postings, track candidates through the hiring pipeline, and build custom assessments—all without a traditional backend server.

**Live Demo Link:** `https://talent-flow-hr.netlify.app`

---

## Core Features

The application is built around three primary workflows for an HR team:

### 1. 📋 Jobs Board
- **Create, Edit, & Archive Jobs:** Manage the complete lifecycle of job postings through an intuitive modal interface.
- **Drag-and-Drop Reordering:** Easily prioritize jobs by dragging them into the desired order, with optimistic UI updates for a seamless experience.
- **Server-Like Pagination & Filtering:** Efficiently navigate through numerous job postings with pagination and filter by job title or status (Active/Archived).
- **Role-Based UI:** The interface intelligently adapts, showing administrative controls for "HR" users and a clean, "Apply" focused view for "Candidate" users.

### 2. 👥 Candidates Pipeline
- **Kanban Board:** Visualize and manage the entire candidate pipeline from "Applied" to "Hired" with a drag-and-drop Kanban board.
- **Move Candidates Between Stages:** Effortlessly advance or reject candidates by dragging their card to a new stage.
- **Client-Side Search:** Instantly find any candidate by name or email with a real-time search filter.

### 3. 📝 Assessment Builder
- **Dynamic Form Creation:** Build custom, job-specific assessments with multiple sections and question types (Short Text, Long Text, Single/Multiple Choice, Numeric).
- **Live Preview Pane:** See a real-time preview of the candidate's form as you build it.
- **Full CRUD Functionality:** Add, edit, and delete sections and questions with ease.
- **Advanced Validation & Logic:**
  - Mark questions as **required**.
  - Set **min/max ranges** for numeric answers.
  - Implement **conditional logic** to show questions based on previous answers.

---

## 🛠️ Technical Stack & Architectural Decisions

This project leverages a modern, robust tech stack chosen to meet the specific "front-end-only" requirement while simulating a real-world application architecture.

| Technology | Purpose & Rationale |
| :--- | :--- |
| **React** | The core UI library for building a component-based, interactive user interface. |
| **Vite** | A next-generation frontend build tool that provides an extremely fast development experience with Hot Module Replacement (HMR). |
| **Redux Toolkit Query** | For modern data fetching, caching, and state management. Chosen for its efficiency in handling server state, automatic re-fetching, and optimistic updates, which simplifies complex UI logic like drag-and-drop reordering. |
| **Mock Service Worker (MSW)** | To simulate a complete REST API without a backend. MSW intercepts actual network requests on the browser, making the front-end code identical to how it would be in a production application with a real server. |
| **Dexie.js (IndexedDB)** | For robust local persistence. All data created (jobs, candidates, etc.) is written to the browser's IndexedDB, ensuring that the application state is fully restored on refresh, as required. |
| **React Router** | For client-side routing, enabling navigation between the different sections of the application as a true Single Page Application (SPA). |
| **Dnd Kit** | A modern, accessible, and performant library for all drag-and-drop functionality, used for both the Jobs board reordering and the Candidates Kanban board. |
| **Lucide React** | For a clean, lightweight, and consistent set of icons used throughout the application. |

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone [Your Repository URL]
    cd talentflow-project
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application will now be running on `http://localhost:5173`. The Mock Service Worker will be active, and you can start using the app.

---

