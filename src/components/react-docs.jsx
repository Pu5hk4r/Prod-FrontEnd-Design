import { useState } from "react";

const NAV = [
  { id: "intro", label: "🚀 React Basics" },
  { id: "setup", label: "⚙️ Project Setup" },
  { id: "components", label: "🧩 Components" },
  { id: "state", label: "📦 State & Hooks" },
  { id: "forms", label: "📝 Forms" },
  { id: "login", label: "🔐 Login Page" },
  { id: "dashboard", label: "📊 Dashboard" },
  { id: "images", label: "🖼️ Images" },
  { id: "pdf", label: "📄 PDFs & Files" },
  { id: "chat", label: "💬 Chat UI" },
  { id: "api", label: "🌐 API Calls" },
  { id: "routing", label: "🗺️ Routing" },
  { id: "auth", label: "🛡️ Auth & JWT" },
  { id: "tips", label: "💡 Backend Dev Tips" },
];

const Code = ({ children, lang = "jsx" }) => (
  <pre style={{
    background: "#0d1117", color: "#e6edf3", borderRadius: 10, padding: "18px 22px",
    fontSize: 13, overflowX: "auto", margin: "12px 0", lineHeight: 1.7,
    border: "1px solid #30363d", fontFamily: "'Fira Code', 'Cascadia Code', monospace"
  }}>
    <code>{children}</code>
  </pre>
);

const Badge = ({ children, color = "#1f6feb" }) => (
  <span style={{
    background: color, color: "#fff", borderRadius: 20, padding: "2px 10px",
    fontSize: 11, fontWeight: 700, marginLeft: 8, verticalAlign: "middle"
  }}>{children}</span>
);

const Note = ({ children, type = "info" }) => {
  const colors = { info: "#1f6feb", warn: "#d29922", tip: "#238636", danger: "#da3633" };
  const icons = { info: "ℹ️", warn: "⚠️", tip: "✅", danger: "❌" };
  return (
    <div style={{
      borderLeft: `4px solid ${colors[type]}`, background: colors[type] + "18",
      borderRadius: "0 8px 8px 0", padding: "12px 16px", margin: "14px 0", fontSize: 14
    }}>
      <strong>{icons[type]} </strong>{children}
    </div>
  );
};

const H1 = ({ children }) => (
  <h1 style={{ fontSize: 28, fontWeight: 800, color: "#e6edf3", margin: "0 0 6px", letterSpacing: -0.5 }}>{children}</h1>
);
const H2 = ({ children }) => (
  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#58a6ff", margin: "28px 0 10px", borderBottom: "1px solid #21262d", paddingBottom: 6 }}>{children}</h2>
);
const H3 = ({ children }) => (
  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#79c0ff", margin: "20px 0 8px" }}>{children}</h3>
);
const P = ({ children }) => (
  <p style={{ color: "#c9d1d9", lineHeight: 1.75, margin: "8px 0", fontSize: 14.5 }}>{children}</p>
);

// ===== SECTIONS =====

const sections = {
  intro: () => (
    <div>
      <H1>⚛️ React for Backend Developers</H1>
      <p style={{ color: "#8b949e", marginBottom: 24, fontSize: 15 }}>
        A complete guide — from zero to building real UIs with React
      </p>
      <Note type="tip">If you know Python/Java/Node — React will feel familiar. It's just <strong>JavaScript with a component model</strong>.</Note>

      <H2>What is React?</H2>
      <P>React is a <strong>UI library</strong> (not a full framework). You build the page out of small reusable <strong>components</strong>, like LEGO bricks. Each component is a JavaScript function that returns HTML-like syntax called JSX.</P>

      <H3>Mental Model for Backend Devs</H3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "12px 0" }}>
        {[
          ["Backend Concept", "React Equivalent"],
          ["Function / Method", "Component (function returning JSX)"],
          ["Function arguments", "Props (read-only inputs)"],
          ["Local variable / session", "State (useState hook)"],
          ["API endpoint response", "useEffect + fetch/axios"],
          ["Template (Jinja/Handlebars)", "JSX (HTML in JS)"],
          ["Module/class", "Component file (.jsx)"],
        ].map(([a, b], i) => (
          <div key={i} style={{
            background: i === 0 ? "#161b22" : "#0d1117",
            border: "1px solid #30363d", borderRadius: 8, padding: "10px 14px",
            fontSize: 13, color: i === 0 ? "#58a6ff" : "#c9d1d9", fontWeight: i === 0 ? 700 : 400
          }}>{i === 0 ? <><span>{a}</span><span style={{ float: "right" }}>{b}</span></> : <><span>{a}</span><span style={{ float: "right", color: "#3fb950" }}>{b}</span></>}</div>
        ))}
      </div>

      <H2>How React Renders</H2>
      <Code>{`// 1. You write a component
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;   // JSX — looks like HTML
}

// 2. React renders it to the DOM
<Greeting name="Arjun" />
// Output: <h1>Hello, Arjun!</h1>

// 3. When state changes → React re-renders ONLY that component (not the whole page)
// This is called the Virtual DOM`}</Code>

      <H2>JSX Rules (Important!)</H2>
      <Code>{`// ✅ Return one parent element
return (
  <div>
    <h1>Title</h1>
    <p>Content</p>
  </div>
);

// ✅ Or use Fragment (no extra div in DOM)
return (
  <>
    <h1>Title</h1>
    <p>Content</p>
  </>
);

// ✅ className instead of class (JS reserved word)
<div className="container">...</div>

// ✅ JavaScript inside {}
<p>2 + 2 = {2 + 2}</p>
<p>User: {user.name.toUpperCase()}</p>

// ✅ Self-close empty tags
<input type="text" />
<img src="logo.png" alt="logo" />

// ❌ WRONG — can't use "class" or unclosed tags
<div class="bad">
<input type="text">   // no closing slash`}</Code>
    </div>
  ),

  setup: () => (
    <div>
      <H1>⚙️ Project Setup</H1>

      <H2>Create a New React App</H2>
      <Note type="tip">Use Vite — it's faster than Create React App (CRA is deprecated)</Note>
      <Code>{`# Option 1: Vite (Recommended — fast, modern)
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev

# Option 2: Next.js (full-stack, SSR, file-based routing)
npx create-next-app@latest my-app
cd my-app
npm run dev

# Option 3: CRA (legacy, avoid for new projects)
npx create-react-app my-app`}</Code>

      <H2>Folder Structure (Vite)</H2>
      <Code>{`my-app/
├── public/           # Static files (favicon, images)
├── src/
│   ├── assets/       # Images, fonts
│   ├── components/   # Reusable UI components
│   │   ├── Button.jsx
│   │   └── Navbar.jsx
│   ├── pages/        # Page-level components
│   │   ├── Login.jsx
│   │   └── Dashboard.jsx
│   ├── hooks/        # Custom hooks
│   ├── services/     # API calls (axios/fetch)
│   │   └── api.js
│   ├── context/      # Global state (React Context)
│   ├── App.jsx       # Root component + routes
│   └── main.jsx      # Entry point (mounts React)
├── index.html
└── package.json`}</Code>

      <H2>Essential Packages to Install</H2>
      <Code>{`# Routing
npm install react-router-dom

# HTTP requests (like axios in Python)
npm install axios

# Forms
npm install react-hook-form

# UI Component Libraries (pick one)
npm install @mui/material @emotion/react @emotion/styled  # Material UI
npm install antd                                           # Ant Design
npm install @shadcn/ui                                     # shadcn/ui

# PDF viewer
npm install react-pdf

# File uploads
npm install react-dropzone

# Charts / Dashboards
npm install recharts

# State management (for large apps)
npm install zustand          # Simple (recommended)
npm install @reduxjs/toolkit # Complex apps`}</Code>

      <H2>main.jsx — Entry Point</H2>
      <Code>{`// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)`}</Code>
    </div>
  ),

  components: () => (
    <div>
      <H1>🧩 Components & Props</H1>

      <H2>Functional Component (Modern)</H2>
      <Code>{`// src/components/UserCard.jsx
function UserCard({ name, email, role, avatar }) {
  return (
    <div className="card">
      <img src={avatar} alt={name} />
      <h2>{name}</h2>
      <p>{email}</p>
      <span className={\`badge badge-\${role}\`}>{role}</span>
    </div>
  );
}

export default UserCard;

// Usage:
import UserCard from './components/UserCard';

<UserCard
  name="Arjun Sharma"
  email="arjun@example.com"
  role="admin"
  avatar="/avatars/arjun.png"
/>`}</Code>

      <H2>Props — Like Function Arguments</H2>
      <Code>{`// Props are READ-ONLY (never modify them)
function Button({ label, onClick, variant = "primary", disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={\`btn btn-\${variant}\`}
    >
      {label}
    </button>
  );
}

// Default props via destructuring defaults (above)
// Or use PropTypes for type checking (optional):
import PropTypes from 'prop-types';
Button.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
};`}</Code>

      <H2>Rendering Lists</H2>
      <Code>{`// Always use .map() with a unique key
function UserList({ users }) {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>           {/* key is REQUIRED */}
          {user.name} — {user.email}
        </li>
      ))}
    </ul>
  );
}

// Conditional rendering
function Status({ isOnline }) {
  return (
    <span>
      {isOnline ? "🟢 Online" : "🔴 Offline"}
    </span>
  );
}

// Show/hide with &&
function Admin({ user }) {
  return (
    <div>
      <p>Welcome, {user.name}</p>
      {user.isAdmin && <button>Admin Panel</button>}
    </div>
  );
}`}</Code>

      <H2>children Prop — Slot / Layout Pattern</H2>
      <Code>{`// Like a "slot" in other frameworks
function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="card-body">{children}</div>
    </div>
  );
}

// Usage — put anything inside
<Card title="User Info">
  <p>Name: Arjun</p>
  <button>Edit</button>
</Card>`}</Code>
    </div>
  ),

  state: () => (
    <div>
      <H1>📦 State & Hooks</H1>
      <Note type="info">Hooks are functions that start with <strong>use</strong>. They let you add React features to functional components.</Note>

      <H2>useState — Local State</H2>
      <Code>{`import { useState } from 'react';

function Counter() {
  // [currentValue, setterFunction] = useState(initialValue)
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);

  // UPDATE: always call the setter (never mutate directly)
  const increment = () => setCount(count + 1);

  // Update object state (spread to preserve other fields)
  const updateEmail = (email) => {
    setUser(prev => ({ ...prev, email }));  // prev = previous state
  };

  // Update array state
  const addItem = (item) => {
    setItems(prev => [...prev, item]);     // add
  };
  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));  // remove
  };

  return <button onClick={increment}>{count}</button>;
}`}</Code>

      <H2>useEffect — Side Effects (API calls, timers)</H2>
      <Code>{`import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Runs after component mounts (like componentDidMount)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await fetch(\`/api/users/\${userId}\`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);  // Re-runs whenever userId changes
  //  ^^^^^^^^^  Dependency array — empty [] = runs once on mount

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>Error: {error}</p>;
  if (!user)   return null;

  return <div>{user.name}</div>;
}

// Cleanup (for timers, event listeners, subscriptions)
useEffect(() => {
  const timer = setInterval(() => console.log('tick'), 1000);
  return () => clearInterval(timer);  // cleanup on unmount
}, []);`}</Code>

      <H2>useContext — Global State (No Prop Drilling)</H2>
      <Code>{`// 1. Create context
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// 2. Provider — wraps your app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Custom hook for easy access
export const useAuth = () => useContext(AuthContext);

// 4. Wrap App in provider (main.jsx or App.jsx)
<AuthProvider>
  <App />
</AuthProvider>

// 5. Use anywhere in the tree (no props needed!)
function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav>
      <span>{user?.name}</span>
      <button onClick={logout}>Logout</button>
    </nav>
  );
}`}</Code>

      <H2>useRef — Access DOM / Persist Values</H2>
      <Code>{`import { useRef } from 'react';

function FileInput() {
  const inputRef = useRef(null);  // like document.getElementById

  const openFilePicker = () => {
    inputRef.current.click();  // programmatically click hidden input
  };

  return (
    <>
      <input type="file" ref={inputRef} style={{ display: 'none' }} />
      <button onClick={openFilePicker}>Upload File</button>
    </>
  );
}`}</Code>

      <H2>useMemo & useCallback — Performance</H2>
      <Code>{`import { useMemo, useCallback } from 'react';

// useMemo — cache expensive computations
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price, 0);
}, [items]);  // Only recomputes when items changes

// useCallback — stable function reference (for child component optimization)
const handleDelete = useCallback((id) => {
  setItems(prev => prev.filter(i => i.id !== id));
}, []);  // Created once, not on every render`}</Code>
    </div>
  ),

  forms: () => (
    <div>
      <H1>📝 Forms in React</H1>

      <H2>Controlled Input (Basic)</H2>
      <Note type="tip">React controls the input value via state. DOM is always in sync with your state.</Note>
      <Code>{`import { useState } from 'react';

function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});

  // One handler for all fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email';
    if (form.message.length < 10) newErrors.message = 'At least 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent page reload
    if (!validate()) return;

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your name"
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div>
        <label>Message</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={4}
        />
        {errors.message && <span className="error">{errors.message}</span>}
      </div>

      <button type="submit">Send Message</button>
    </form>
  );
}`}</Code>

      <H2>React Hook Form (Recommended for Complex Forms)</H2>
      <Code>{`import { useForm } from 'react-hook-form';

function RegisterForm() {
  const {
    register,      // connects input to form
    handleSubmit,  // wraps your submit handler
    formState: { errors, isSubmitting },
    watch,         // watch a field value
    reset          // reset form
  } = useForm();

  const onSubmit = async (data) => {
    // data = { username, email, password } — already validated
    await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    reset();
  };

  const password = watch('password');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('username', {
          required: 'Username is required',
          minLength: { value: 3, message: 'Min 3 characters' }
        })}
        placeholder="Username"
      />
      {errors.username && <p>{errors.username.message}</p>}

      <input
        type="email"
        {...register('email', {
          required: 'Email required',
          pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' }
        })}
        placeholder="Email"
      />
      {errors.email && <p>{errors.email.message}</p>}

      <input
        type="password"
        {...register('password', { required: true, minLength: 8 })}
        placeholder="Password"
      />

      <input
        type="password"
        {...register('confirmPassword', {
          validate: val => val === password || 'Passwords do not match'
        })}
        placeholder="Confirm Password"
      />
      {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}`}</Code>

      <H2>Select, Checkbox, Radio</H2>
      <Code>{`// Select dropdown
const [role, setRole] = useState('user');
<select value={role} onChange={e => setRole(e.target.value)}>
  <option value="user">User</option>
  <option value="admin">Admin</option>
  <option value="editor">Editor</option>
</select>

// Checkbox
const [agreed, setAgreed] = useState(false);
<input
  type="checkbox"
  checked={agreed}
  onChange={e => setAgreed(e.target.checked)}
/>

// Multiple checkboxes
const [permissions, setPermissions] = useState([]);
const toggle = (perm) => {
  setPermissions(prev =>
    prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
  );
};
{['read', 'write', 'delete'].map(perm => (
  <label key={perm}>
    <input
      type="checkbox"
      checked={permissions.includes(perm)}
      onChange={() => toggle(perm)}
    />
    {perm}
  </label>
))}`}</Code>
    </div>
  ),

  login: () => (
    <div>
      <H1>🔐 Login Page — Full Example</H1>
      <Note type="info">Complete login flow: form → API call → store token → redirect</Note>

      <H2>Login Component</H2>
      <Code>{`// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || 'Login failed');
      }

      const { token, user } = await res.json();

      // Store token
      localStorage.setItem('token', token);

      // Update global auth state
      login(user);

      // Redirect to dashboard
      navigate('/dashboard');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome Back</h1>
        <p>Sign in to your account</p>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="form-options">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="/forgot-password">Forgot password?</a>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="register-link">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}

export default Login;`}</Code>

      <H2>Protected Route</H2>
      <Code>{`// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
  const { user } = useAuth();

  // Not logged in? Redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render child routes
  return <Outlet />;
}

// src/App.jsx — use it in your router
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* All routes inside are protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}`}</Code>
    </div>
  ),

  dashboard: () => (
    <div>
      <H1>📊 Dashboard Layout</H1>

      <H2>Sidebar Layout</H2>
      <Code>{`// src/layouts/DashboardLayout.jsx
import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: '📊' },
  { to: '/dashboard/users', label: 'Users', icon: '👥' },
  { to: '/dashboard/reports', label: 'Reports', icon: '📄' },
  { to: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 64 : 240,
        background: '#1a1a2e',
        transition: 'width 0.2s',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '→' : '←'}
        </button>

        <nav>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'nav-item active' : 'nav-item'
              }
            >
              <span>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        <Outlet />   {/* Child page renders here */}
      </main>
    </div>
  );
}

export default DashboardLayout;`}</Code>

      <H2>Stats Cards + Chart</H2>
      <Code>{`// src/pages/Overview.jsx
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function StatCard({ label, value, change, icon }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        <p className={change >= 0 ? 'positive' : 'negative'}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </p>
      </div>
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data.stats);
        setChartData(data.chart);
      });
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h1>Overview</h1>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="Total Users" value={stats.users} change={12.5} icon="👥" />
        <StatCard label="Revenue" value={\`$\${stats.revenue}\`} change={8.2} icon="💰" />
        <StatCard label="Orders" value={stats.orders} change={-3.1} icon="📦" />
        <StatCard label="Active Now" value={stats.active} change={5.4} icon="🟢" />
      </div>

      {/* Chart */}
      <div style={{ marginTop: 32, background: '#fff', borderRadius: 12, padding: 24 }}>
        <h2>Revenue Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
      <table style={{ width: '100%', marginTop: 24 }}>
        <thead>
          <tr>
            <th>User</th><th>Email</th><th>Status</th><th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {stats.recentUsers?.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span className={\`badge \${user.active ? 'green' : 'gray'}\`}>
                  {user.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`}</Code>
    </div>
  ),

  images: () => (
    <div>
      <H1>🖼️ Images in React</H1>

      <H2>Basic Image Display</H2>
      <Code>{`// From public folder (no import needed)
<img src="/images/logo.png" alt="Logo" />

// From src/assets (import required)
import logo from './assets/logo.png';
<img src={logo} alt="Logo" width={200} />

// Remote URL
<img src="https://api.example.com/user/123/avatar" alt="Avatar" />

// With fallback (error handling)
function Avatar({ src, name }) {
  const handleError = (e) => {
    e.target.src = '/images/default-avatar.png';  // fallback
  };

  return (
    <img
      src={src}
      alt={name}
      onError={handleError}
      style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
    />
  );
}`}</Code>

      <H2>Image Upload — Single File</H2>
      <Code>{`import { useState, useRef } from 'react';

function ImageUpload() {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Max 5MB');
      return;
    }

    // Show preview using FileReader
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = inputRef.current.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);          // field name must match backend
    formData.append('userId', '123');        // extra data

    try {
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${localStorage.getItem('token')}\`
          // NOTE: Do NOT set Content-Type — browser sets it with boundary
        },
        body: formData
      });
      const { url } = await res.json();
      console.log('Uploaded:', url);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <button onClick={() => inputRef.current.click()}>
        Choose Image
      </button>

      {preview && (
        <div>
          <img src={preview} alt="Preview" style={{ maxWidth: 300, maxHeight: 300 }} />
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}
    </div>
  );
}`}</Code>

      <H2>Drag & Drop Image Upload</H2>
      <Code>{`import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function DropzoneUpload() {
  const onDrop = useCallback(async (acceptedFiles) => {
    const formData = new FormData();
    acceptedFiles.forEach(file => formData.append('files', file));

    await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.png', '.gif', '.webp'] },
    maxSize: 10 * 1024 * 1024,  // 10MB
    multiple: true
  });

  return (
    <div {...getRootProps()} style={{
      border: \`2px dashed \${isDragActive ? '#3b82f6' : '#ccc'}\`,
      borderRadius: 12, padding: 40, textAlign: 'center', cursor: 'pointer',
      background: isDragActive ? '#eff6ff' : '#fafafa'
    }}>
      <input {...getInputProps()} />
      {isDragActive
        ? <p>Drop images here...</p>
        : <p>Drag & drop images, or click to select</p>
      }
      {acceptedFiles.map(file => (
        <p key={file.name}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
      ))}
    </div>
  );
}`}</Code>
    </div>
  ),

  pdf: () => (
    <div>
      <H1>📄 PDFs & File Handling</H1>

      <H2>PDF Viewer</H2>
      <Code>{`// npm install react-pdf
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// REQUIRED: set worker
pdfjs.GlobalWorkerOptions.workerSrc =
  \`//cdnjs.cloudflare.com/ajax/libs/pdf.js/\${pdfjs.version}/pdf.worker.min.js\`;

function PDFViewer({ url }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  return (
    <div>
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={console.error}
      >
        <Page pageNumber={pageNumber} width={700} />
      </Document>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
        <button
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber(p => p - 1)}
        >
          ← Previous
        </button>
        <span>Page {pageNumber} of {numPages}</span>
        <button
          disabled={pageNumber >= numPages}
          onClick={() => setPageNumber(p => p + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// Usage:
<PDFViewer url="/documents/report.pdf" />
<PDFViewer url="https://api.example.com/files/invoice-123.pdf" />`}</Code>

      <H2>File Upload (Any Type)</H2>
      <Code>{`import { useState } from 'react';

function FileUploader() {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
  };

  const uploadFiles = () => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    // Use XMLHttpRequest for upload progress
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setProgress(pct);
      }
    });

    xhr.addEventListener('load', () => {
      console.log('Done!', JSON.parse(xhr.responseText));
    });

    xhr.open('POST', '/api/upload');
    xhr.setRequestHeader('Authorization', \`Bearer \${localStorage.getItem('token')}\`);
    xhr.send(formData);
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xlsx,.png,.jpg"
        onChange={handleFiles}
      />
      <button onClick={uploadFiles} disabled={files.length === 0}>
        Upload {files.length} file(s)
      </button>

      {progress > 0 && (
        <div>
          <div style={{
            height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden'
          }}>
            <div style={{
              width: \`\${progress}%\`, height: '100%', background: '#3b82f6',
              transition: 'width 0.2s'
            }} />
          </div>
          <p>{progress}%</p>
        </div>
      )}

      {/* File list */}
      {files.map((file, i) => (
        <div key={i}>
          📎 {file.name} — {(file.size / 1024).toFixed(1)} KB
        </div>
      ))}
    </div>
  );
}`}</Code>

      <H2>Download File from API</H2>
      <Code>{`// Download blob from authenticated endpoint
async function downloadFile(fileId, filename) {
  const res = await fetch(\`/api/files/\${fileId}/download\`, {
    headers: {
      'Authorization': \`Bearer \${localStorage.getItem('token')}\`
    }
  });

  if (!res.ok) throw new Error('Download failed');

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  // Trigger browser download
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);  // Free memory
}

// Button usage:
<button onClick={() => downloadFile('abc123', 'report.pdf')}>
  ⬇ Download Report
</button>`}</Code>
    </div>
  ),

  chat: () => (
    <div>
      <H1>💬 Chat UI</H1>

      <H2>Basic Chat with REST Polling</H2>
      <Code>{`import { useState, useEffect, useRef } from 'react';

function ChatWindow({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  // Poll for new messages every 2 seconds
  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch(\`/api/chat/\${roomId}/messages\`);
      const data = await res.json();
      setMessages(data);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [roomId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const optimisticMsg = {
      id: Date.now(),
      content: input,
      sender: 'me',
      timestamp: new Date().toISOString(),
      pending: true
    };

    setMessages(prev => [...prev, optimisticMsg]);  // Show immediately
    setInput('');

    await fetch(\`/api/chat/\${roomId}/messages\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: input })
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            display: 'flex',
            justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start',
            marginBottom: 8
          }}>
            <div style={{
              background: msg.sender === 'me' ? '#3b82f6' : '#f3f4f6',
              color: msg.sender === 'me' ? '#fff' : '#111',
              padding: '10px 14px', borderRadius: 18, maxWidth: '70%',
              opacity: msg.pending ? 0.6 : 1
            }}>
              <p style={{ margin: 0 }}>{msg.content}</p>
              <small style={{ opacity: 0.7 }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </small>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: 16, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send)"
          rows={1}
          style={{ flex: 1, resize: 'none', borderRadius: 20, padding: '10px 16px' }}
        />
        <button onClick={sendMessage} disabled={!input.trim()}>Send</button>
      </div>
    </div>
  );
}`}</Code>

      <H2>Real-time with WebSocket</H2>
      <Code>{`import { useState, useEffect, useRef, useCallback } from 'react';

function useWebSocket(url) {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = (err) => console.error('WS error:', err);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages(prev => [...prev, msg]);
    };

    return () => ws.close();  // Cleanup on unmount
  }, [url]);

  const sendMessage = useCallback((content) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', content }));
    }
  }, []);

  return { messages, connected, sendMessage };
}

// Usage
function LiveChat({ roomId }) {
  const { messages, connected, sendMessage } = useWebSocket(
    \`wss://api.example.com/ws/chat/\${roomId}\`
  );
  const [input, setInput] = useState('');

  return (
    <div>
      <span>{connected ? '🟢 Connected' : '🔴 Disconnected'}</span>
      {messages.map((m, i) => <p key={i}>{m.content}</p>)}
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={() => { sendMessage(input); setInput(''); }}>Send</button>
    </div>
  );
}`}</Code>
    </div>
  ),

  api: () => (
    <div>
      <H1>🌐 API Calls</H1>

      <H2>Axios Setup (Recommended)</H2>
      <Code>{`// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor — auto-attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// src/services/users.js — service layer
import api from './api';

export const userService = {
  getAll: (params) => api.get('/users', { params }),   // GET /api/users?page=1
  getById: (id) => api.get(\`/users/\${id}\`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(\`/users/\${id}\`, data),
  delete: (id) => api.delete(\`/users/\${id}\`),
  uploadAvatar: (id, file) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return api.post(\`/users/\${id}/avatar\`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};`}</Code>

      <H2>Custom useFetch Hook</H2>
      <Code>{`// src/hooks/useFetch.js
import { useState, useEffect } from 'react';
import api from '../services/api';

export function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;  // prevent state update on unmounted component

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(url, options);
        if (!cancelled) setData(res.data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}

// Usage:
function UsersList() {
  const { data: users, loading, error } = useFetch('/users?page=1');

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return users.map(u => <UserRow key={u.id} user={u} />);
}`}</Code>

      <H2>Environment Variables</H2>
      <Code>{`# .env (Vite — prefix MUST be VITE_)
VITE_API_URL=https://api.myapp.com
VITE_WS_URL=wss://api.myapp.com/ws
VITE_STRIPE_KEY=pk_test_xxx

# .env.local — overrides, never commit to git
VITE_API_URL=http://localhost:8000

# Access in code:
const apiUrl = import.meta.env.VITE_API_URL;

# Create React App (prefix MUST be REACT_APP_)
REACT_APP_API_URL=https://api.myapp.com
const apiUrl = process.env.REACT_APP_API_URL;`}</Code>
    </div>
  ),

  routing: () => (
    <div>
      <H1>🗺️ Routing with React Router v6</H1>

      <H2>Full App Router Setup</H2>
      <Code>{`// npm install react-router-dom
// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protected routes with layout */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="users/:id/edit" element={<EditUser />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}`}</Code>

      <H2>Navigation Hooks</H2>
      <Code>{`import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';

// Navigate programmatically
function DeleteButton({ id }) {
  const navigate = useNavigate();

  const handleDelete = async () => {
    await deleteUser(id);
    navigate('/dashboard/users');          // Go to page
    navigate('/dashboard/users', { replace: true }); // Replace history
    navigate(-1);                          // Go back
  };

  return <button onClick={handleDelete}>Delete</button>;
}

// Read URL params — /users/:id
function UserDetail() {
  const { id } = useParams();  // id = '123' from /users/123
  return <div>User ID: {id}</div>;
}

// Read query string — /users?page=2&search=john
function UsersList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';

  const nextPage = () => {
    setSearchParams({ page: page + 1, search });
  };

  return <div>Page: {page}</div>;
}

// Get current location
function Breadcrumb() {
  const location = useLocation();
  // location.pathname = '/dashboard/users/123'
  // location.state = data passed via navigate()
  return <span>{location.pathname}</span>;
}`}</Code>
    </div>
  ),

  auth: () => (
    <div>
      <H1>🛡️ Auth & JWT</H1>

      <H2>JWT Token Management</H2>
      <Code>{`// src/services/auth.js
import api from './api';

export const authService = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    // Store tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.user;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  refresh: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const { data } = await api.post('/auth/refresh', { refreshToken });
    localStorage.setItem('accessToken', data.accessToken);
    return data.accessToken;
  },

  // Decode JWT payload (without verification — just for display)
  decodeToken: (token) => {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  }
};`}</Code>

      <H2>Auto Token Refresh (Interceptor)</H2>
      <Code>{`// Add to src/services/api.js
let isRefreshing = false;
let failedQueue = [];

api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = \`Bearer \${token}\`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await authService.refresh();
        failedQueue.forEach(p => p.resolve(newToken));
        failedQueue = [];
        originalRequest.headers.Authorization = \`Bearer \${newToken}\`;
        return api(originalRequest);
      } catch (refreshError) {
        failedQueue.forEach(p => p.reject(refreshError));
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);`}</Code>

      <H2>Role-Based Access Control</H2>
      <Code>{`// src/components/RoleGuard.jsx
import { useAuth } from '../context/AuthContext';

function RoleGuard({ roles, children, fallback = null }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return fallback;
  }

  return children;
}

// Usage:
<RoleGuard roles={['admin', 'superadmin']}>
  <button>Delete User</button>    {/* Only admins see this */}
</RoleGuard>

<RoleGuard roles={['admin']} fallback={<p>Access Denied</p>}>
  <AdminPanel />
</RoleGuard>

// Hook version
function usePermission() {
  const { user } = useAuth();
  const can = (action) => {
    const permissions = {
      admin: ['read', 'write', 'delete'],
      editor: ['read', 'write'],
      viewer: ['read']
    };
    return permissions[user?.role]?.includes(action) ?? false;
  };
  return { can };
}

// Usage:
const { can } = usePermission();
{can('delete') && <DeleteButton />}`}</Code>
    </div>
  ),

  tips: () => (
    <div>
      <H1>💡 Tips for Backend Developers</H1>

      <H2>Common Gotchas</H2>
      {[
        ["State updates are async", "setCount(count + 1); console.log(count); // still old value! Use useEffect to react to changes"],
        ["Never mutate state directly", "arr.push(item) is WRONG. Use setArr(prev => [...prev, item])"],
        ["Keys must be unique & stable", "Don't use array index as key if list reorders. Use item.id"],
        ["useEffect cleanup", "Return a cleanup fn to prevent memory leaks (cancel requests, clear timers)"],
        ["CORS", "Configure CORS on your backend — React dev server runs on :5173, backend on :8000"],
        ["FormData for files", "Don't set Content-Type header when sending FormData — browser adds the boundary automatically"],
      ].map(([title, desc]) => (
        <div key={title} style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, padding: "12px 16px", marginBottom: 10 }}>
          <strong style={{ color: "#f78166" }}>⚠️ {title}</strong>
          <p style={{ color: "#8b949e", margin: "4px 0 0", fontSize: 13 }}>{desc}</p>
        </div>
      ))}

      <H2>Backend Integration Checklist</H2>
      <Code>{`✅ API Base URL in .env file (VITE_API_URL)
✅ Axios instance with base URL + token interceptor
✅ CORS configured on backend (Allow-Origin: http://localhost:5173)
✅ JWT stored in localStorage (or httpOnly cookie for better security)
✅ Refresh token logic for expired tokens
✅ Loading + error states for every API call
✅ FormData for file uploads (no Content-Type header)
✅ Pagination with useSearchParams (query string)
✅ Optimistic UI for better UX (update state before API confirms)`}</Code>

      <H2>Quick Reference — React vs Backend</H2>
      <Code>{`// FETCH DATA ON PAGE LOAD
useEffect(() => { fetchUsers(); }, []);

// SUBMIT FORM TO API
const handleSubmit = async (e) => {
  e.preventDefault();        // stop page reload!
  await api.post('/users', formData);
};

// PASS DATA BETWEEN COMPONENTS
// Parent → Child: props
// Child → Parent: callback prop
// Anywhere: useContext (global state)

// SHOW/HIDE ELEMENTS
{condition && <Component />}
{condition ? <A /> : <B />}

// LOOP THROUGH DATA
{items.map(item => <Row key={item.id} data={item} />)}

// NAVIGATE AFTER ACTION
const navigate = useNavigate();
navigate('/dashboard');

// READ URL PARAMS
const { id } = useParams();      // /users/:id
const [q] = useSearchParams();   // ?page=2
const page = q.get('page');`}</Code>

      <H2>Recommended Stack for Backend Devs</H2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "12px 0" }}>
        {[
          ["Routing", "React Router v6"],
          ["HTTP Client", "Axios + interceptors"],
          ["Forms", "React Hook Form"],
          ["State (global)", "Zustand or Context"],
          ["UI Library", "Ant Design or MUI"],
          ["Charts", "Recharts"],
          ["PDF", "react-pdf"],
          ["File Upload", "react-dropzone"],
          ["Bundler", "Vite"],
          ["TypeScript", "Highly recommended"],
        ].map(([k, v]) => (
          <div key={k} style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "#8b949e" }}>{k}</span>
            <span style={{ color: "#3fb950", fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export default function App() {
  const [active, setActive] = useState("intro");

  const Section = sections[active];

  return (
    <div style={{
      display: "flex", height: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif",
      background: "#010409", color: "#e6edf3", overflow: "hidden"
    }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: "#0d1117", borderRight: "1px solid #21262d",
        overflowY: "auto", flexShrink: 0, paddingTop: 16
      }}>
        <div style={{ padding: "0 16px 16px", borderBottom: "1px solid #21262d" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#58a6ff" }}>⚛️ React Docs</div>
          <div style={{ fontSize: 11, color: "#6e7681", marginTop: 2 }}>For Backend Developers</div>
        </div>
        <nav style={{ padding: "8px 0" }}>
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "9px 20px", border: "none", cursor: "pointer", fontSize: 13,
                background: active === item.id ? "#1f6feb22" : "transparent",
                color: active === item.id ? "#58a6ff" : "#8b949e",
                borderLeft: active === item.id ? "3px solid #58a6ff" : "3px solid transparent",
                fontWeight: active === item.id ? 600 : 400,
                transition: "all 0.15s"
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, overflowY: "auto", padding: "32px 40px", maxWidth: 860 }}>
        {Section ? <Section /> : <div>Select a topic</div>}
      </main>
    </div>
  );
}
