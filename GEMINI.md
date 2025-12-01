# Stitch - Web Novel World Building Tool

## Project Overview
**Stitch** is a static web application designed to help novelists build and manage their story worlds. It provides tools for tracking characters, events, timelines, relationships, and synopses.

> [!NOTE]
> **Project Status**: This codebase is a **functional wireframe** created to demonstrate the project's operating logic and user flow to stakeholders before full-scale development.

## Technical Architecture
- **Type**: Static Web Application (SPA-like behavior via multi-page navigation).
- **Stack**:
    -   **HTML5**: Semantic structure.
    -   **CSS**: Tailwind CSS (via CDN) for styling.
    -   **JavaScript**: Vanilla JS (ES6+) for logic.
-   **No Build Step**: The project runs directly in the browser without a build process (no `npm`, `webpack`, etc.).

## Data Management
The application uses a hybrid data approach to allow functionality without a backend:
1.  **Static Data**: Base data is loaded from JSON files in the `data/` directory (e.g., `characters.json`, `events.json`).
2.  **Persistence**: User modifications (Create, Update, Delete) are stored in the browser's `localStorage`.
3.  **Merging**: The `DataLoader` and specific Store classes (`CharacterStore`, `RelationshipStore`) merge static JSON data with `localStorage` data at runtime.

## Directory Structure
-   `root`: HTML files for each major feature (Dashboard, Character List, Timeline, etc.).
-   `js/`: Core logic.
    -   `data-loader.js`: Central data fetching and caching logic. Handles `localStorage` merging.
    -   `utils.js`: Helper functions for UI, formatting, and data manipulation.
    -   `router.js`: Simple routing logic (if applicable).
-   `data/`: JSON files serving as the initial database.

## Key Features
-   **Dashboard**: Overview of project statistics and recent items.
-   **Character Management**: Detailed character profiles and lists.
-   **Relationship Map**: Visualizing connections between characters.
-   **Timeline & Events**: Chronological ordering of story events.
-   **Synopsis**: Plot outlining and management.
-   **Foreshadowing**: Tracking plot hints and their resolution status.

## Development Guidelines
-   **Styling**: Use Tailwind CSS utility classes. Avoid custom CSS unless necessary for animations or specific overrides.
-   **Icons**: Use Material Symbols Outlined via Google Fonts.
-   **Data Access**: Always use `dataLoader` or specific Store instances to access data to ensure `localStorage` changes are included.
