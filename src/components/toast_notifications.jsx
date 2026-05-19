import { useState, useEffect, useRef, useCallback, createContext, useContext, useReducer } from "react";

// ═══════════════════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════════════════
const C = {
  bg:     "#0D1117",
  bg1:    "#161B22",
  bg2:    "#21262D",
  border: "#30363D",
  text:   "#E6EDF3",
  muted:  "#7D8590",
  dim:    "#1C2128",

  green:   "#3FB950",
  greenBg: "#0D1F12",
  greenBd: "#238636",

  blue:    "#58A6FF",
  blueBg:  "#0D1B2E",
  blueBd:  "#1F6FEB",

  amber:   "#D29922",
  amberBg: "#1C1700",
  amberBd: "#9E6A03",

  red:     "#F85149",
  redBg:   "#1C0A09",
  redBd:   "#DA3633",

  purple:  "#BC8CFF",
  purpleBg:"#160D22",
  purpleBd:"#6E40C9",

  cyan:    "#39C5CF",
  cyanBg:  "#071519",
  cyanBd:  "#1B7C83",
};

// ═══════════════════════════════════════════════════════════════
// ╔═══════════════════════════════════════════════════════════╗
// ║              TOAST ENGINE (copy this!)                   ║
// ╚═══════════════════════════════════════════════════════════╝
// ═══════════════════════════════════════════════════════════════

const TOAST_LIMIT    = 5;      // max visible at once
const DEFAULT_DURATION = 4000; // ms before auto-dismiss

// ── Action types ─────────────────────────────────────────────
const ADD     = "ADD";
const DISMISS = "DISMISS";
const REMOVE  = "REMOVE";
const UPDATE  = "UPDATE";
const PAUSE   = "PAUSE";
const RESUME  = "RESUME";

// ── Reducer ──────────────────────────────────────────────────
function toastReducer(state, action) {
  switch (action.type) {
    case ADD:
      return {
        ...state,
        queue: [...state.queue, action.toast],
        toasts: state.toasts.length < TOAST_LIMIT
          ? [...state.toasts, { ...action.toast, entering: true }]
          : state.toasts,
      };

    case DISMISS:
      return {
        ...state,
        toasts: state.toasts.map(t =>
          t.id === action.id ? { ...t, dismissed: true } : t
        ),
      };

    case REMOVE: {
      const removed = state.toasts.filter(t => t.id !== action.id);
      const next    = state.queue.find(q => !state.toasts.find(t => t.id === q.id));
      return {
        ...state,
        toasts: next
          ? [...removed, { ...next, entering: true }]
          : removed,
        queue: state.queue.filter(q => q.id !== action.id),
      };
    }

    case UPDATE:
      return {
        ...state,
        toasts: state.toasts.map(t =>
          t.id === action.id ? { ...t, ...action.updates } : t
        ),
      };

    case PAUSE:
      return {
        ...state,
        toasts: state.toasts.map(t =>
          t.id === action.id ? { ...t, paused: true } : t
        ),
      };

    case RESUME:
      return {
        ...state,
        toasts: state.toasts.map(t =>
          t.id === action.id ? { ...t, paused: false } : t
        ),
      };

    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────
const ToastCtx = createContext(null);

let __id = 0;
const genId = () => `toast-${++__id}-${Date.now()}`;

// ── Provider ─────────────────────────────────────────────────
function ToastProvider({ children, position = "bottom-right" }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [], queue: [] });
  const [pos, setPos] = useState(position);

  const add = useCallback((toast) => {
    const id = genId();
    dispatch({ type: ADD, toast: { duration: DEFAULT_DURATION, ...toast, id } });
    return id;
  }, []);

  const dismiss  = useCallback((id) => dispatch({ type: DISMISS, id }), []);
  const remove   = useCallback((id) => dispatch({ type: REMOVE,  id }), []);
  const update   = useCallback((id, updates) => dispatch({ type: UPDATE, id, updates }), []);
  const pause    = useCallback((id) => dispatch({ type: PAUSE,  id }), []);
  const resume   = useCallback((id) => dispatch({ type: RESUME, id }), []);
  const clearAll = useCallback(() => state.toasts.forEach(t => dismiss(t.id)), [state.toasts, dismiss]);

  // Convenience methods
  const toast = useCallback((msg, opts = {}) => add({ type: "default", message: msg, ...opts }), [add]);
  toast.success = (msg, opts) => add({ type: "success", message: msg, ...opts });
  toast.error   = (msg, opts) => add({ type: "error",   message: msg, ...opts });
  toast.warning = (msg, opts) => add({ type: "warning", message: msg, ...opts });
  toast.info    = (msg, opts) => add({ type: "info",    message: msg, ...opts });
  toast.promise = (promise, { loading, success, error }) => {
    const id = add({ type: "loading", message: loading, duration: Infinity });
    promise
      .then(() => update(id, { type: "success", message: success, duration: DEFAULT_DURATION }))
      .catch(() => update(id, { type: "error",   message: error,   duration: DEFAULT_DURATION }));
    return id;
  };

  return (
    <ToastCtx.Provider value={{ toasts: state.toasts, queue: state.queue, toast, dismiss, remove, update, pause, resume, clearAll, pos, setPos }}>
      {children}
      <ToastViewport />
    </ToastCtx.Provider>
  );
}

function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ═══════════════════════════════════════════════════════════════
// TOAST ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════
const TYPE_CONFIG = {
  success: { icon: "✓",  color: C.green,  bg: C.greenBg, border: C.greenBd, label: "Success"  },
  error:   { icon: "✕",  color: C.red,    bg: C.redBg,   border: C.redBd,   label: "Error"    },
  warning: { icon: "⚠",  color: C.amber,  bg: C.amberBg, border: C.amberBd, label: "Warning"  },
  info:    { icon: "ℹ",  color: C.blue,   bg: C.blueBg,  border: C.blueBd,  label: "Info"     },
  loading: { icon: null, color: C.purple, bg: C.purpleBg,border: C.purpleBd,label: "Loading"  },
  default: { icon: "◆",  color: C.cyan,   bg: C.cyanBg,  border: C.cyanBd,  label: "Notice"   },
};

function ProgressBar({ duration, paused, color }) {
  const [width, setWidth] = useState(100);
  const startRef = useRef(null);
  const elapsed  = useRef(0);
  const rafRef   = useRef(null);

  useEffect(() => {
    if (duration === Infinity) return;

    const tick = (now) => {
      if (!startRef.current) startRef.current = now;
      const delta = now - startRef.current;
      const total = elapsed.current + delta;
      const pct   = Math.max(0, 100 - (total / duration) * 100);
      setWidth(pct);
      if (pct > 0) rafRef.current = requestAnimationFrame(tick);
    };

    if (!paused) {
      startRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      elapsed.current += performance.now() - (startRef.current ?? performance.now());
      cancelAnimationFrame(rafRef.current);
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [paused, duration]);

  if (duration === Infinity) return null;

  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
      background: color + "22", borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${width}%`,
        background: `linear-gradient(90deg, ${color}88, ${color})`,
        transition: paused ? "none" : "width 0.1s linear",
        borderRadius: "0 0 10px 10px",
      }} />
    </div>
  );
}

function Spinner({ color, size = 16 }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid ${color}33`,
      borderTop: `2px solid ${color}`,
      borderRadius: "50%",
      animation: "toast-spin .7s linear infinite",
      flexShrink: 0,
    }} />
  );
}

function ToastItem({ toast, position }) {
  const { dismiss, remove, pause, resume } = useToast();
  const [phase, setPhase]  = useState("enter");   // enter | idle | exit
  const [hovered, setHov]  = useState(false);
  const timerRef = useRef(null);
  const cfg = TYPE_CONFIG[toast.type] || TYPE_CONFIG.default;

  // Auto-dismiss timer
  useEffect(() => {
    if (toast.duration === Infinity || toast.paused) return;
    timerRef.current = setTimeout(() => dismiss(toast.id), toast.duration);
    return () => clearTimeout(timerRef.current);
  }, [toast.id, toast.duration, toast.paused]);

  // Enter animation
  useEffect(() => {
    const t = setTimeout(() => setPhase("idle"), 20);
    return () => clearTimeout(t);
  }, []);

  // Exit animation then remove
  useEffect(() => {
    if (toast.dismissed) {
      setPhase("exit");
      const t = setTimeout(() => remove(toast.id), 380);
      return () => clearTimeout(t);
    }
  }, [toast.dismissed]);

  const isTop    = position.startsWith("top");
  const isCenter = position.includes("center");
  const isRight  = position.includes("right");

  const slideDir = isCenter
    ? isTop ? "translateY(-16px)" : "translateY(16px)"
    : isRight ? "translateX(24px)" : "translateX(-24px)";

  const enterStyle = {
    opacity:   0,
    transform: `${slideDir} scale(0.92)`,
    maxHeight: 0,
    marginBottom: 0,
  };
  const idleStyle  = {
    opacity:   1,
    transform: "translateX(0) translateY(0) scale(1)",
    maxHeight: 200,
    marginBottom: 8,
  };
  const exitStyle  = {
    opacity:   0,
    transform: `${slideDir} scale(0.88)`,
    maxHeight: 0,
    marginBottom: 0,
    pointerEvents: "none",
  };

  const style = phase === "enter" ? enterStyle : phase === "exit" ? exitStyle : idleStyle;

  return (
    <div
      onMouseEnter={() => { setHov(true);  pause(toast.id);  clearTimeout(timerRef.current); }}
      onMouseLeave={() => { setHov(false); resume(toast.id); }}
      style={{
        position: "relative", overflow: "hidden",
        background: cfg.bg,
        border: `1px solid ${hovered ? cfg.color + "60" : cfg.border}`,
        borderRadius: 11,
        padding: "13px 14px",
        minWidth: 280, maxWidth: 380,
        display: "flex", alignItems: "flex-start", gap: 11,
        boxShadow: hovered
          ? `0 8px 32px #00000080, 0 0 0 1px ${cfg.color}20`
          : "0 4px 20px #00000060",
        cursor: "default",
        userSelect: "none",
        transition: "opacity .38s cubic-bezier(.4,0,.2,1), transform .38s cubic-bezier(.34,1.56,.64,1), max-height .35s ease, margin-bottom .35s ease, border-color .2s, box-shadow .2s",
        ...style,
      }}
    >
      {/* Icon / Spinner */}
      <div style={{
        width: 24, height: 24, borderRadius: 8, flexShrink: 0,
        background: cfg.color + "22",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginTop: 1,
      }}>
        {toast.type === "loading"
          ? <Spinner color={cfg.color} size={13} />
          : <span style={{ fontSize: 12, color: cfg.color, fontWeight: 800 }}>{cfg.icon}</span>
        }
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>
            {toast.title}
          </div>
        )}
        <div style={{ fontSize: 12, color: toast.title ? C.muted : C.text, lineHeight: 1.5 }}>
          {toast.message}
        </div>
        {toast.action && (
          <button
            onClick={() => { toast.action.onClick(); dismiss(toast.id); }}
            style={{
              marginTop: 8, fontSize: 11, fontWeight: 700, padding: "3px 10px",
              borderRadius: 6, border: `1px solid ${cfg.color}44`,
              background: cfg.color + "18", color: cfg.color, cursor: "pointer",
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => dismiss(toast.id)}
        style={{
          width: 20, height: 20, borderRadius: 6, border: "none",
          background: hovered ? C.border : "transparent",
          color: C.muted, cursor: "pointer", fontSize: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginTop: 1, transition: "background .15s",
        }}
      >✕</button>

      {/* Progress bar */}
      <ProgressBar duration={toast.duration} paused={hovered || toast.paused} color={cfg.color} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// VIEWPORT — portal that positions the toast stack
// ═══════════════════════════════════════════════════════════════
const POSITION_STYLES = {
  "top-left":      { top: 16, left: 16, alignItems: "flex-start" },
  "top-center":    { top: 16, left: "50%", transform: "translateX(-50%)", alignItems: "center" },
  "top-right":     { top: 16, right: 16, alignItems: "flex-end" },
  "bottom-left":   { bottom: 16, left: 16, alignItems: "flex-start" },
  "bottom-center": { bottom: 16, left: "50%", transform: "translateX(-50%)", alignItems: "center" },
  "bottom-right":  { bottom: 16, right: 16, alignItems: "flex-end" },
};

function ToastViewport() {
  const { toasts, pos, queue } = useToast();
  const isBottom = pos.startsWith("bottom");
  const posStyle = POSITION_STYLES[pos] || POSITION_STYLES["bottom-right"];

  const orderedToasts = isBottom ? [...toasts].reverse() : toasts;

  return (
    <div style={{
      position: "fixed", zIndex: 9999,
      display: "flex", flexDirection: "column",
      pointerEvents: "none",
      ...posStyle,
    }}>
      {/* Queue badge */}
      {queue.length > toasts.length && (
        <div style={{
          fontSize: 10, fontWeight: 700, color: C.muted, textAlign: "center",
          padding: "4px 12px", marginBottom: 6,
          background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20,
          alignSelf: "center", pointerEvents: "auto",
        }}>
          +{queue.length - toasts.length} more queued
        </div>
      )}
      <div style={{ display: "flex", flexDirection: isBottom ? "column-reverse" : "column",
        gap: 0, pointerEvents: "auto", alignItems: posStyle.alignItems }}>
        {orderedToasts.map(t => (
          <ToastItem key={t.id} toast={t} position={pos} />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CODE SNIPPETS
// ═══════════════════════════════════════════════════════════════
const CODE_HOOK = `// ── useToast hook ────────────────────────────────────────────
// Drop this + <ToastProvider> into your project — zero deps

function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("Wrap your app in <ToastProvider>");
  return ctx;
}

// ── API ───────────────────────────────────────────────────────
const { toast } = useToast();

// Basic variants
toast("Message");                         // default
toast.success("File saved!");
toast.error("Upload failed.");
toast.warning("Storage almost full.");
toast.info("New version available.");

// With title + options
toast.success("Deployment complete", {
  title:    "CI/CD Pipeline",
  duration: 6000,              // ms, or Infinity to persist
  action:   { label: "View logs", onClick: () => router.push("/logs") },
});

// Promise toast (loading → success/error)
toast.promise(uploadFile(), {
  loading: "Uploading file…",
  success: "File uploaded!",
  error:   "Upload failed.",
});

// Programmatic dismiss
const id = toast.info("Processing…", { duration: Infinity });
await doWork();
toast.dismiss(id);   // or: update(id, { type:"success", message:"Done!" })`;

const CODE_PROVIDER = `// ── Setup ─────────────────────────────────────────────────────
// 1. Wrap your app
function App() {
  return (
    <ToastProvider position="bottom-right">
      <YourApp />
    </ToastProvider>
  );
}

// Available positions:
// top-left | top-center | top-right
// bottom-left | bottom-center | bottom-right

// 2. Use anywhere in the tree
function SaveButton() {
  const { toast } = useToast();

  const save = async () => {
    const id = toast.promise(saveData(), {
      loading: "Saving…",
      success: "Changes saved!",
      error:   "Save failed — check your connection.",
    });
  };

  return <button onClick={save}>Save</button>;
}

// ── Queue behaviour ────────────────────────────────────────────
// TOAST_LIMIT = 5          max visible at once
// DEFAULT_DURATION = 4000  ms auto-dismiss
// Hover pauses the timer
// Excess toasts queue → show as next slot opens`;

const CODE_REDUCER = `// ── Core Reducer (state machine) ─────────────────────────────
function toastReducer(state, action) {
  switch (action.type) {

    case "ADD":
      // If under limit: show immediately. Else: queue it.
      return {
        queue: [...state.queue, action.toast],
        toasts: state.toasts.length < TOAST_LIMIT
          ? [...state.toasts, { ...action.toast, entering: true }]
          : state.toasts,
      };

    case "DISMISS":
      // Mark as dismissed → triggers exit animation
      return {
        toasts: state.toasts.map(t =>
          t.id === action.id ? { ...t, dismissed: true } : t
        ),
      };

    case "REMOVE":
      // Remove from visible, promote next from queue
      const removed = state.toasts.filter(t => t.id !== action.id);
      const next    = state.queue.find(
        q => !state.toasts.find(t => t.id === q.id)
      );
      return {
        toasts: next ? [...removed, { ...next, entering: true }] : removed,
        queue:  state.queue.filter(q => q.id !== action.id),
      };

    case "UPDATE":
      // Update any field (used by toast.promise)
      return {
        toasts: state.toasts.map(t =>
          t.id === action.id ? { ...t, ...action.updates } : t
        ),
      };
  }
}

// ── Animation phases ───────────────────────────────────────────
// "enter"  → opacity:0, translateX(24px), scale(.92), maxHeight:0
// "idle"   → opacity:1, translate(0,0),   scale(1),   maxHeight:200
// "exit"   → opacity:0, translateX(24px), scale(.88), maxHeight:0
// Transition uses cubic-bezier(.34,1.56,.64,1) for spring feel`;

function CodeViewer({ code, title }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ background: "#0A0E15", border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "8px 16px", background: C.bg1, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 5 }}>
            {["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
          </div>
          <span style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>{title}</span>
        </div>
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
            border: `1px solid ${copied ? C.green : C.border}`,
            background: copied ? C.green + "18" : "transparent",
            color: copied ? C.green : C.muted, cursor: "pointer", transition: "all .2s", fontFamily: "inherit" }}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre style={{ margin: 0, padding: "16px 20px", overflowX: "auto", fontSize: 11, lineHeight: 1.75,
        color: "#7DABC4", fontFamily: "'JetBrains Mono','Fira Code',monospace", whiteSpace: "pre" }}>
        {code}
      </pre>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DEMO PANEL
// ═══════════════════════════════════════════════════════════════
function DemoPanel() {
  const { toast, clearAll, pos, setPos, toasts, queue } = useToast();
  const [activeCode, setActiveCode] = useState(null);

  const positions = ["top-left","top-center","top-right","bottom-left","bottom-center","bottom-right"];

  const DEMOS = [
    {
      group: "Basic Types",
      color: C.green,
      items: [
        { label: "Success",  emoji: "✓",  fn: () => toast.success("File saved successfully!", { title: "Saved" }) },
        { label: "Error",    emoji: "✕",  fn: () => toast.error("Upload failed. Please retry.", { title: "Upload Error", action: { label: "Retry", onClick: () => {} } }) },
        { label: "Warning",  emoji: "⚠",  fn: () => toast.warning("Storage is 90% full.", { title: "Warning" }) },
        { label: "Info",     emoji: "ℹ",  fn: () => toast.info("Version 2.4.1 is available.", { title: "Update Available", action: { label: "Update now", onClick: () => {} } }) },
        { label: "Default",  emoji: "◆",  fn: () => toast("Clipboard copied!") },
      ]
    },
    {
      group: "Advanced",
      color: C.purple,
      items: [
        {
          label: "Promise", emoji: "⟳",
          fn: () => toast.promise(
            new Promise((res, rej) => setTimeout(Math.random() > 0.3 ? res : rej, 2200)),
            { loading: "Deploying to production…", success: "Deployment complete! 🚀", error: "Deployment failed. Rolling back." }
          )
        },
        {
          label: "With Action", emoji: "→",
          fn: () => toast.error("Connection lost.", {
            title: "Network Error",
            duration: 8000,
            action: { label: "Reconnect", onClick: () => toast.success("Reconnected!") }
          })
        },
        {
          label: "Persistent", emoji: "∞",
          fn: () => {
            const id = toast.info("Background sync running…", { title: "Sync", duration: Infinity });
            setTimeout(() => toast.update?.(id, { type: "success", message: "Sync complete!", duration: 3000 }), 3000);
          }
        },
        {
          label: "Multi-line", emoji: "≡",
          fn: () => toast.warning(
            "Your session will expire in 5 minutes. Save your work to avoid losing changes.",
            { title: "Session Expiring", duration: 7000 }
          )
        },
      ]
    },
    {
      group: "Queue Stress",
      color: C.amber,
      items: [
        { label: "Burst ×5",   emoji: "5×", fn: () => { ["alpha","beta","gamma","delta","epsilon"].forEach((n,i) => setTimeout(() => toast.success(`Task "${n}" complete`), i*120)) } },
        { label: "Burst ×10",  emoji: "10×", fn: () => { Array.from({length:10}).forEach((_,i) => setTimeout(() => toast[["success","error","info","warning"][i%4]](`Notification #${i+1}`), i*80)) } },
        { label: "Mixed storm", emoji: "⚡", fn: () => {
          toast.success("Build passed");
          setTimeout(() => toast.error("Test suite failed"), 300);
          setTimeout(() => toast.info("PR review requested"), 600);
          setTimeout(() => toast.warning("Memory usage high"), 900);
          setTimeout(() => toast.success("Deploy triggered"), 1200);
          setTimeout(() => toast.info("Slack notification sent"), 1500);
        }},
        { label: "Clear All", emoji: "✕", fn: clearAll },
      ]
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Hero stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        {[
          { label: "Active",   val: toasts.length,              color: C.cyan  },
          { label: "Queued",   val: Math.max(0, queue.length - toasts.length), color: C.amber },
          { label: "Position", val: pos.replace("-", " "),       color: C.purple },
          { label: "Limit",    val: `${toasts.length} / 5`,      color: C.green },
        ].map(s => (
          <div key={s.label} style={{ background: C.bg1, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: "12px 14px", borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Position picker */}
      <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>Position</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, maxWidth: 360 }}>
          {positions.map(p => (
            <button key={p} onClick={() => setPos(p)}
              style={{ fontSize: 10, fontWeight: 700, padding: "6px 8px", borderRadius: 8,
                border: `1px solid ${pos === p ? C.cyan : C.border}`,
                background: pos === p ? C.cyan + "18" : "transparent",
                color: pos === p ? C.cyan : C.muted,
                cursor: "pointer", transition: "all .15s", fontFamily: "inherit",
                textAlign: "center" }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Demo buttons */}
      {DEMOS.map(group => (
        <div key={group.group} style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 3, height: 14, background: group.color, borderRadius: 2 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{group.group}</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {group.items.map(item => (
              <button key={item.label} onClick={item.fn}
                style={{ fontSize: 11, fontWeight: 700, padding: "7px 14px", borderRadius: 9,
                  border: `1px solid ${C.border}`, background: C.bg2,
                  color: C.text, cursor: "pointer", display: "flex", alignItems: "center",
                  gap: 6, transition: "all .15s", fontFamily: "inherit" }}
                onMouseEnter={e => { e.target.style.borderColor = group.color; e.target.style.color = group.color; e.target.style.background = group.color + "12"; }}
                onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.text; e.target.style.background = C.bg2; }}>
                <span style={{ fontSize: 12 }}>{item.emoji}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Code sections */}
      <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>Code Reference</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {[["useToast API","hook"],["Setup & Usage","provider"],["State Reducer","reducer"]].map(([l,k]) => (
            <button key={k} onClick={() => setActiveCode(activeCode === k ? null : k)}
              style={{ fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
                border: `1px solid ${activeCode === k ? C.cyan : C.border}`,
                background: activeCode === k ? C.cyan + "14" : "transparent",
                color: activeCode === k ? C.cyan : C.muted, cursor: "pointer", fontFamily: "inherit" }}>
              {l}
            </button>
          ))}
        </div>
        {activeCode === "hook"     && <CodeViewer code={CODE_HOOK}     title="useToast.js" />}
        {activeCode === "provider" && <CodeViewer code={CODE_PROVIDER} title="setup.jsx" />}
        {activeCode === "reducer"  && <CodeViewer code={CODE_REDUCER}  title="toastReducer.js" />}
      </div>

      {/* Features grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {[
          ["Queue system",     "Excess toasts queue up — auto-promote when a slot opens",           C.cyan   ],
          ["Auto-dismiss",     "RAF-based progress bar. Hover pauses the countdown.",                C.green  ],
          ["Spring animations","cubic-bezier(.34,1.56,.64,1) entry gives a satisfying spring feel.", C.purple ],
          ["toast.promise()",  "Pass any Promise — auto loading → success/error transition.",        C.amber  ],
          ["Action buttons",   "Add inline CTAs. Click fires callback and auto-dismisses.",          C.blue   ],
          ["6 positions",      "top/bottom × left/center/right — configurable at provider level.",   C.rose   ],
        ].map(([title, desc, color]) => (
          <div key={title} style={{ background: C.bg1, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: "12px 14px", borderTop: `2px solid ${color}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 5 }}>{title}</div>
            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════
export default function App() {
  return (
    <ToastProvider position="bottom-right">
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text,
        fontFamily: "'Geist','Outfit',system-ui,sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          ::-webkit-scrollbar { width: 5px; background: ${C.bg}; }
          ::-webkit-scrollbar-thumb { background: #30363D; border-radius: 3px; }
          @keyframes toast-spin { to { transform: rotate(360deg); } }
          button { font-family: inherit; }
        `}</style>

        {/* Header */}
        <header style={{ background: C.bg1, borderBottom: `1px solid ${C.border}`,
          padding: "0 24px", height: 56, display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8,
              background: "linear-gradient(135deg,#58A6FF,#BC8CFF)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🔔</div>
            <span style={{ fontSize: 16, fontWeight: 800 }}>
              Toast <span style={{ color: C.blue }}>Notifications</span>
            </span>
            <span style={{ fontSize: 11, color: C.muted }}>— queue · auto-dismiss · animations</span>
          </div>
          <div style={{ fontSize: 11, color: C.muted, padding: "3px 10px",
            border: `1px solid ${C.border}`, borderRadius: 20 }}>
            useReducer · RAF · zero deps
          </div>
        </header>

        <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
          <DemoPanel />
        </main>
      </div>
    </ToastProvider>
  );
}
