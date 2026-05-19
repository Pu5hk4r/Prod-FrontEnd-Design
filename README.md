# React UI Components Library Showcase

Welcome to the React UI Components Library! This project is a curated collection of premium, modern React components built with vanilla CSS, inline styles, and powerful libraries like Recharts. It serves as an interactive playground to test, view, and implement complex UI patterns.

## 🚀 Getting Started

First, ensure you have [Node.js](https://nodejs.org/) installed on your machine.

1. **Install Dependencies**
   Run the following command in the root directory to install all required packages:
   ```bash
   npm install
   ```

2. **Run the Development Server**
   Start the Vite development server:
   ```bash
   npm run dev
   ```

3. **View the Project**
   Open `http://localhost:5173` (or the port provided by Vite) in your browser. You will see a sleek sidebar navigation allowing you to switch between all the components dynamically.

## 📁 Project Structure & Components

All the core UI designs are located in the `src/components/` directory. Each file is a standalone, fully-functional module demonstrating specific React patterns and modern UI design.

### 1. `dashboard.jsx` (DataOps Observatory)
A highly complex, real-time data monitoring dashboard built with `recharts`.
- Features live ticker bars, KPI metric cards with trends, and dynamic charts.
- Includes three distinct tabs: **Data Engineering** (throughput & latency), **Analytics** (funnels & traffic sources), and **ML Monitoring** (model performance & feature drift).

### 2. `debounce_search.jsx`
A masterclass implementation of debounced search inputs.
- Contains custom hooks: `useDebounce`, `useDebouncedCallback`, and a full `useSearchWithDebounce`.
- Demonstrates handling async API requests, aborting stale requests (AbortController), preventing race conditions, and managing local search history.

### 3. `modal_dialog.jsx`
A robust modal and dialog window system.
- Showcases custom, accessible modal overlays with smooth entry/exit animations.
- Implements focus trapping, click-outside-to-close behavior, and keyboard accessibility (Escape to close).

### 4. `toast_notifications.jsx`
A beautiful, non-blocking toast notification system.
- Demonstrates how to manage global toast state (likely via Context or custom reducers).
- Features auto-dismiss timers, progress bars, interactive closing, and different severity levels (success, error, warning, info).

### 5. `scroll_templates.jsx`
Advanced scroll-based interactions and templates.
- Contains implementations for scroll-spy navigation, infinite scrolling lists, or animated scroll reveals.
- Great for building modern landing pages that react as the user scrolls down the page.

### 6. `react-docs.jsx`
A massive, comprehensive showcase of advanced React ecosystem integrations.
- Integrates routing (`react-router-dom`), complex form handling (`react-hook-form`), drag-and-drop file uploads (`react-dropzone`), and PDF rendering (`react-pdf`).
- Serves as a "cookbook" for integrating these popular third-party libraries into a cohesive application.

## 🛠️ Tech Stack
- **Framework:** React 18 & Vite
- **Styling:** Vanilla CSS & Inline styles (Custom Design System without Tailwind)
- **Icons:** `lucide-react`
- **Charts:** `recharts`
- **Routing:** `react-router-dom`

## 💡 Notes on Architecture
This project is deliberately built to showcase "Glassmorphism," smooth micro-animations, and dynamic data handling without relying on heavy CSS frameworks. The components use an internal color system (defined via variables) to maintain a cohesive, dark-themed, and highly premium aesthetic.
