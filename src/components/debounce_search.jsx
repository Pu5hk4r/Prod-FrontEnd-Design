import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════════════════
const C = {
  bg:      "#07090F",
  bg1:     "#0C1018",
  bg2:     "#111622",
  card:    "#0F1420",
  border:  "#192235",
  border2: "#1F2D45",
  text:    "#D8E8FA",
  muted:   "#46607A",
  dim:     "#162030",

  gold:    "#F5A623",
  goldD:   "#C27A00",
  cyan:    "#22D3EE",
  cyanD:   "#0891B2",
  green:   "#22C55E",
  rose:    "#FB7185",
  violet:  "#A78BFA",
  sky:     "#38BDF8",
  amber:   "#FBB040",
  emerald: "#10B981",
  indigo:  "#6366F1",
  white:   "#FFFFFF",
};

// ═══════════════════════════════════════════════════════════════
// FAKE DATA — 200 records across categories
// ═══════════════════════════════════════════════════════════════
const ri = (a, b) => Math.floor(Math.random() * (b - a) + a);
const pick = arr => arr[ri(0, arr.length)];

const USERS = [
  { id:1,  name:"Alice Chen",       role:"Senior Engineer",    team:"Platform",   avatar:"AC", status:"online",  skills:["React","TypeScript","Go"],     joined:"2021-03" },
  { id:2,  name:"Bob Patel",        role:"Product Manager",    team:"Growth",     avatar:"BP", status:"away",    skills:["Strategy","Analytics","SQL"],   joined:"2020-06" },
  { id:3,  name:"Carol Wu",         role:"Data Scientist",     team:"ML",         avatar:"CW", status:"online",  skills:["Python","PyTorch","Spark"],     joined:"2022-01" },
  { id:4,  name:"Dev Singh",        role:"DevOps Engineer",    team:"Infra",      avatar:"DS", status:"offline", skills:["Kubernetes","Terraform","AWS"],  joined:"2019-11" },
  { id:5,  name:"Eve Tanaka",       role:"UX Designer",        team:"Design",     avatar:"ET", status:"online",  skills:["Figma","Research","Motion"],    joined:"2021-08" },
  { id:6,  name:"Finn O'Brien",     role:"Backend Engineer",   team:"Platform",   avatar:"FO", status:"online",  skills:["Rust","PostgreSQL","gRPC"],     joined:"2020-03" },
  { id:7,  name:"Grace Liu",        role:"Frontend Engineer",  team:"Product",    avatar:"GL", status:"away",    skills:["Vue","CSS","WebGL"],            joined:"2022-05" },
  { id:8,  name:"Hiro Sato",        role:"Engineering Manager",team:"Platform",   avatar:"HS", status:"online",  skills:["Leadership","Systems","Go"],    joined:"2018-09" },
  { id:9,  name:"Iris Moreau",      role:"Security Engineer",  team:"Infra",      avatar:"IM", status:"offline", skills:["Pentest","Zero Trust","SOC2"],  joined:"2021-01" },
  { id:10, name:"Jay Kim",          role:"ML Engineer",        team:"ML",         avatar:"JK", status:"online",  skills:["Python","CUDA","TensorFlow"],   joined:"2020-11" },
  { id:11, name:"Kenji Nakamura",   role:"Staff Engineer",     team:"Platform",   avatar:"KN", status:"online",  skills:["Distributed","C++","Design"],  joined:"2017-04" },
  { id:12, name:"Luna Garcia",      role:"Data Engineer",      team:"ML",         avatar:"LG", status:"away",    skills:["dbt","Airflow","Snowflake"],    joined:"2022-02" },
  { id:13, name:"Marco Rossi",      role:"iOS Engineer",       team:"Mobile",     avatar:"MR", status:"online",  skills:["Swift","SwiftUI","Combine"],    joined:"2021-06" },
  { id:14, name:"Nina Volkov",      role:"Android Engineer",   team:"Mobile",     avatar:"NV", status:"online",  skills:["Kotlin","Compose","RxJava"],    joined:"2020-09" },
  { id:15, name:"Omar Hassan",      role:"Site Reliability",   team:"Infra",      avatar:"OH", status:"offline", skills:["Prometheus","Go","Linux"],      joined:"2019-07" },
  { id:16, name:"Priya Sharma",     role:"Analytics Engineer", team:"Growth",     avatar:"PS", status:"online",  skills:["SQL","Looker","Python"],        joined:"2021-11" },
  { id:17, name:"Quinn Murphy",     role:"Full Stack Engineer", team:"Product",   avatar:"QM", status:"away",    skills:["Next.js","Prisma","tRPC"],      joined:"2022-08" },
  { id:18, name:"Riya Kapoor",      role:"Research Scientist", team:"ML",         avatar:"RK", status:"online",  skills:["NLP","Transformers","MLOps"],   joined:"2020-04" },
  { id:19, name:"Sam Torres",       role:"Backend Engineer",   team:"Growth",     avatar:"ST", status:"online",  skills:["Node.js","Redis","GraphQL"],    joined:"2021-03" },
  { id:20, name:"Tina Okonkwo",     role:"Engineering Manager",team:"Mobile",     avatar:"TO", status:"online",  skills:["Mobile","Strategy","Android"], joined:"2019-02" },
];

const DOCS = [
  { id:1,  title:"Getting Started with the Platform API",   category:"API",           views:8420, updated:"2h ago",   tags:["API","REST","Authentication"] },
  { id:2,  title:"Kubernetes Deployment Best Practices",    category:"DevOps",         views:6210, updated:"1d ago",   tags:["K8s","Docker","Helm"] },
  { id:3,  title:"React Query Data Fetching Patterns",      category:"Frontend",       views:5890, updated:"3h ago",   tags:["React","Hooks","Cache"] },
  { id:4,  title:"PostgreSQL Performance Tuning Guide",     category:"Database",       views:4730, updated:"2d ago",   tags:["SQL","Indexes","EXPLAIN"] },
  { id:5,  title:"ML Model Deployment with FastAPI",        category:"ML",             views:4120, updated:"5h ago",   tags:["Python","FastAPI","Docker"] },
  { id:6,  title:"TypeScript Generics Deep Dive",           category:"Frontend",       views:3950, updated:"1d ago",   tags:["TypeScript","Patterns"] },
  { id:7,  title:"Zero-Trust Security Architecture",        category:"Security",       views:3740, updated:"3d ago",   tags:["Security","IAM","mTLS"] },
  { id:8,  title:"Event-Driven Architecture Patterns",      category:"Architecture",   views:3580, updated:"4h ago",   tags:["Kafka","CQRS","Events"] },
  { id:9,  title:"Data Pipeline with Apache Airflow",       category:"Data",           views:3210, updated:"2d ago",   tags:["Airflow","ETL","Python"] },
  { id:10, title:"GraphQL Schema Design Principles",        category:"API",            views:2980, updated:"6h ago",   tags:["GraphQL","Schema","Types"] },
  { id:11, title:"Terraform Infrastructure as Code",        category:"DevOps",         views:2870, updated:"1d ago",   tags:["Terraform","AWS","IaC"] },
  { id:12, title:"Observability with OpenTelemetry",        category:"DevOps",         views:2640, updated:"5d ago",   tags:["Tracing","Metrics","Logs"] },
  { id:13, title:"React Server Components Explained",       category:"Frontend",       views:2510, updated:"8h ago",   tags:["React","Next.js","RSC"] },
  { id:14, title:"LLM Fine-Tuning on Custom Data",          category:"ML",             views:2390, updated:"2d ago",   tags:["LLM","LoRA","Training"] },
  { id:15, title:"Redis Caching Strategies",               category:"Database",       views:2180, updated:"3d ago",   tags:["Redis","Cache","TTL"] },
  { id:16, title:"gRPC vs REST: A Practical Comparison",   category:"API",            views:2050, updated:"4d ago",   tags:["gRPC","Protocol","API"] },
  { id:17, title:"Building a Design System from Scratch",  category:"Design",         views:1940, updated:"1d ago",   tags:["Tokens","Components","Figma"] },
  { id:18, title:"Feature Flags with LaunchDarkly",        category:"Architecture",   views:1820, updated:"6d ago",   tags:["Flags","A/B","Rollout"] },
  { id:19, title:"WebAssembly Performance Tricks",          category:"Frontend",       views:1710, updated:"1w ago",   tags:["WASM","Rust","Performance"] },
  { id:20, title:"Datadog APM Setup and Best Practices",   category:"DevOps",         views:1640, updated:"2d ago",   tags:["APM","Metrics","Alerts"] },
];

// Simulate search API with delay
const fakeSearch = async (query, filters, delay = 400 + ri(0, 300)) => {
  await new Promise(r => setTimeout(r, delay));
  // Simulate occasional error for demo
  if (query === "error") throw new Error("Search service unavailable");
  return query;
};

// ═══════════════════════════════════════════════════════════════
// ╔══════════════════════════════════════════════════════════╗
// ║                  DEBOUNCE HOOKS                         ║
// ╚══════════════════════════════════════════════════════════╝
// ═══════════════════════════════════════════════════════════

/**
 * useDebounce — delays updating the value until after `delay` ms of inactivity
 * The simplest form: just debounce a value
 */
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);   // cleanup cancels pending timer
  }, [value, delay]);
  return debounced;
}

/**
 * useDebouncedCallback — debounces a function (not a value)
 * Returns a stable callback that fires only after `delay` ms of silence
 */
function useDebouncedCallback(fn, delay = 300) {
  const timerRef = useRef(null);
  const fnRef    = useRef(fn);
  useEffect(() => { fnRef.current = fn; });

  const debounced = useCallback((...args) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fnRef.current(...args), delay);
  }, [delay]);

  const cancel  = useCallback(() => clearTimeout(timerRef.current), []);
  const flush   = useCallback((...args) => { cancel(); fnRef.current(...args); }, [cancel]);

  useEffect(() => () => clearTimeout(timerRef.current), []);
  return { debounced, cancel, flush };
}

/**
 * useSearchWithDebounce — full search hook:
 * debounce + async fetch + abort controller + history + loading state
 */
function useSearchWithDebounce(searchFn, {
  delay     = 350,
  minLength = 1,
  maxHistory= 8,
} = {}) {
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [history,  setHistory]  = useState([]);

  const debouncedQuery = useDebounce(query, delay);
  const abortRef       = useRef(null);
  const requestId      = useRef(0);

  // Fire search when debounced value changes
  useEffect(() => {
    if (debouncedQuery.length < minLength) {
      setResults(null); setLoading(false); setError(null);
      return;
    }
    // Cancel previous in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const thisReq = ++requestId.current;
    setLoading(true); setError(null);

    searchFn(debouncedQuery, { signal: abortRef.current.signal })
      .then(data => {
        if (thisReq !== requestId.current) return; // stale — ignore
        setResults(data);
        setLoading(false);
      })
      .catch(err => {
        if (err.name === "AbortError") return; // intentionally cancelled
        if (thisReq !== requestId.current) return;
        setError(err.message);
        setLoading(false);
      });
  }, [debouncedQuery]);

  const commit = useCallback((q = query) => {
    if (!q.trim()) return;
    setHistory(h => [q, ...h.filter(x => x !== q)].slice(0, maxHistory));
  }, [query, maxHistory]);

  const clear   = useCallback(() => { setQuery(""); setResults(null); setError(null); }, []);
  const removeHistory = useCallback(item => setHistory(h => h.filter(x => x !== item)), []);

  return {
    query, setQuery,
    results, loading, error,
    history, commit, removeHistory,
    debouncedQuery,
    isSearching: query.length >= minLength,
  };
}

// ═══════════════════════════════════════════════════════════════
// UI PRIMITIVES
// ═══════════════════════════════════════════════════════════════
const Tag = ({ children, color = C.cyan }) => (
  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20,
    background: color + "1A", color, border: `1px solid ${color}28`, fontWeight: 600 }}>
    {children}
  </span>
);

const Highlight = ({ text, query }) => {
  if (!query) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((p, i) =>
        regex.test(p)
          ? <mark key={i} style={{ background: C.gold + "40", color: C.gold, borderRadius: 2, padding: "0 1px" }}>{p}</mark>
          : <span key={i}>{p}</span>
      )}
    </span>
  );
};

const StatusDot = ({ status }) => {
  const col = { online: C.green, away: C.amber, offline: C.muted }[status];
  return <span style={{ width: 8, height: 8, borderRadius: "50%", background: col,
    boxShadow: status === "online" ? `0 0 6px ${col}` : "none", display: "inline-block", flexShrink: 0 }} />;
};

const Spinner = ({ size = 16, color = C.cyan }) => (
  <div style={{ width: size, height: size, border: `2px solid ${color}22`,
    borderTop: `2px solid ${color}`, borderRadius: "50%", animation: "spin .7s linear infinite", flexShrink: 0 }} />
);

const Skeleton = ({ w = "100%", h = 14, r = 6 }) => (
  <div style={{ width: w, height: h, borderRadius: r,
    background: `linear-gradient(90deg,${C.dim} 25%,${C.bg2} 50%,${C.dim} 75%)`,
    backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
);

// Code viewer
const CodeBlock = ({ code, title }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ background: "#050810", border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
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
            border: `1px solid ${C.border2}`, background: copied ? C.green + "22" : "transparent",
            color: copied ? C.green : C.muted, cursor: "pointer", transition: "all .2s" }}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre style={{ margin: 0, padding: "16px 20px", overflowX: "auto", fontSize: 11, lineHeight: 1.75,
        color: "#90B8D8", fontFamily: "'JetBrains Mono','Fira Code',monospace", whiteSpace: "pre" }}>
        {code}
      </pre>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SEARCH INPUT COMPONENT
// ═══════════════════════════════════════════════════════════════
function SearchInput({ value, onChange, onClear, onSubmit, loading, placeholder, accent = C.cyan, hint }) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  return (
    <div style={{ position: "relative" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: C.bg1, border: `1.5px solid ${focused ? accent : C.border}`,
        borderRadius: 12, padding: "10px 14px", transition: "border-color .2s",
        boxShadow: focused ? `0 0 0 3px ${accent}14` : "none",
      }}>
        {/* Search icon / spinner */}
        <div style={{ flexShrink: 0 }}>
          {loading
            ? <Spinner size={17} color={accent} />
            : <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={focused ? accent : C.muted} strokeWidth={2}>
                <circle cx={11} cy={11} r={8} /><path d="m21 21-4.35-4.35" />
              </svg>
          }
        </div>

        <input
          ref={inputRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={e => { if (e.key === "Enter") onSubmit?.(); if (e.key === "Escape") { onClear(); inputRef.current?.blur(); } }}
          placeholder={placeholder || "Search…"}
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            fontSize: 14, color: C.text, fontFamily: "inherit",
          }}
        />

        {/* Kbd hint */}
        {hint && !value && <span style={{ fontSize: 10, color: C.muted, flexShrink: 0, fontFamily: "monospace" }}>{hint}</span>}

        {/* Clear button */}
        {value && (
          <button onClick={onClear} style={{ background: C.border, border: "none", cursor: "pointer",
            width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center",
            justifyContent: "center", color: C.muted, fontSize: 12, flexShrink: 0 }}>✕</button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 1: BASIC DEBOUNCE — User directory search
// ═══════════════════════════════════════════════════════════════
const CODES = {
  useDebounce: `// ── useDebounce — debounce any value ─────────────────────────
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);   // cancels if value changes
  }, [value, delay]);

  return debounced;
}

// ── Usage — search a user list ────────────────────────────────
function UserSearch() {
  const [query, setQuery] = useState("");
  const debouncedQuery    = useDebounce(query, 350);

  // Only runs when user STOPS typing for 350ms
  const results = useMemo(() =>
    users.filter(u =>
      u.name.toLowerCase().includes(debouncedQuery.toLowerCase())
    ), [debouncedQuery]);

  return (
    <>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search users…"
      />
      {/* debouncedQuery drives the actual filter */}
      <div>Showing {results.length} results for "{debouncedQuery}"</div>
      {results.map(u => <UserCard key={u.id} user={u} />)}
    </>
  );
}`,

  useSearchFull: `// ── useSearchWithDebounce — full async search hook ───────────
function useSearchWithDebounce(searchFn, {
  delay      = 350,
  minLength  = 1,
  maxHistory = 8,
} = {}) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [history, setHistory] = useState([]);

  const debouncedQuery = useDebounce(query, delay);
  const abortRef       = useRef(null);
  const requestId      = useRef(0);

  useEffect(() => {
    if (debouncedQuery.length < minLength) {
      setResults(null); setLoading(false); return;
    }
    // Cancel previous in-flight request (abort controller)
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const thisReq = ++requestId.current;  // race condition guard
    setLoading(true); setError(null);

    searchFn(debouncedQuery, { signal: abortRef.current.signal })
      .then(data => {
        if (thisReq !== requestId.current) return; // stale response
        setResults(data);
        setLoading(false);
      })
      .catch(err => {
        if (err.name === "AbortError") return;     // intentional cancel
        setError(err.message);
        setLoading(false);
      });
  }, [debouncedQuery]);

  const commit = useCallback((q = query) => {
    if (!q.trim()) return;
    setHistory(h => [q, ...h.filter(x => x !== q)].slice(0, maxHistory));
  }, [query]);

  return {
    query, setQuery,        // controlled input
    results, loading, error,
    history, commit,        // search history
    debouncedQuery,         // the actual search value (delayed)
    isSearching: query.length >= minLength,
  };
}`,

  useDebouncedCb: `// ── useDebouncedCallback — debounce a function call ──────────
function useDebouncedCallback(fn, delay = 300) {
  const timerRef = useRef(null);
  const fnRef    = useRef(fn);
  useEffect(() => { fnRef.current = fn; }); // always latest fn

  const debounced = useCallback((...args) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => fnRef.current(...args), delay
    );
  }, [delay]);

  const cancel = useCallback(() => clearTimeout(timerRef.current), []);
  // flush = run immediately, skip remaining wait
  const flush  = useCallback((...args) => { cancel(); fnRef.current(...args); }, [cancel]);

  useEffect(() => () => clearTimeout(timerRef.current), []); // cleanup
  return { debounced, cancel, flush };
}

// ── Usage — save form draft as user types ─────────────────────
function DraftEditor() {
  const [content, setContent] = useState("");

  const { debounced: saveDraft } = useDebouncedCallback(
    async (text) => {
      await api.saveDraft({ content: text });
      console.log("Draft saved");
    },
    800   // save 800ms after user stops typing
  );

  return (
    <textarea
      value={content}
      onChange={e => {
        setContent(e.target.value);
        saveDraft(e.target.value);  // fires debounced
      }}
    />
  );
}`,
};

function TabBasic() {
  const [query, setQuery] = useState("");
  const [activeCode, setActiveCode] = useState(null);
  const [filterTeam, setFilterTeam] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const debouncedQuery = useDebounce(query, 350);
  const teams   = ["All", "Platform", "ML", "Infra", "Growth", "Design", "Mobile", "Product"];
  const statuses = ["All", "online", "away", "offline"];

  const results = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    return USERS.filter(u => {
      const matchQ = !q || u.name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.skills.some(s => s.toLowerCase().includes(q));
      const matchT = filterTeam === "All" || u.team === filterTeam;
      const matchS = filterStatus === "All" || u.status === filterStatus;
      return matchQ && matchT && matchS;
    });
  }, [debouncedQuery, filterTeam, filterStatus]);

  const teamColors = { Platform: C.cyan, ML: C.violet, Infra: C.amber, Growth: C.green,
    Design: C.rose, Mobile: C.sky, Product: C.emerald };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text }}>
          useDebounce
          <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 600, color: C.gold,
            background: C.gold + "18", padding: "2px 10px", borderRadius: 20, border: `1px solid ${C.gold}28` }}>
            350ms · client-side filter
          </span>
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: C.muted }}>
          Debounces the query value — filter only runs when typing stops. Zero API calls.
        </p>
      </div>

      {/* Code toggle pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.keys(CODES).map(k => (
          <button key={k} onClick={() => setActiveCode(activeCode === k ? null : k)}
            style={{ fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 20, cursor: "pointer",
              border: `1px solid ${activeCode === k ? C.gold : C.border}`,
              background: activeCode === k ? C.gold + "18" : "transparent",
              color: activeCode === k ? C.gold : C.muted, transition: "all .2s" }}>
            {k === "useDebounce" ? "useDebounce hook" : k === "useSearchFull" ? "useSearchWithDebounce" : "useDebouncedCallback"}
          </button>
        ))}
      </div>
      {activeCode && <CodeBlock code={CODES[activeCode]} title={`${activeCode}.js`} />}

      {/* Search + Filters */}
      <SearchInput value={query} onChange={setQuery} onClear={() => setQuery("")}
        loading={false} placeholder="Search by name, role, or skill…" accent={C.gold} hint="⌘K" />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {teams.map(t => (
            <button key={t} onClick={() => setFilterTeam(t)}
              style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20, cursor: "pointer",
                border: `1px solid ${filterTeam === t ? (teamColors[t] || C.cyan) : C.border}`,
                background: filterTeam === t ? (teamColors[t] || C.cyan) + "22" : "transparent",
                color: filterTeam === t ? (teamColors[t] || C.cyan) : C.muted, transition: "all .15s" }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20, cursor: "pointer",
                border: `1px solid ${filterStatus === s ? C.cyan : C.border}`,
                background: filterStatus === s ? C.cyan + "18" : "transparent",
                color: filterStatus === s ? C.cyan : C.muted, transition: "all .15s" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ fontSize: 12, color: C.muted, display: "flex", gap: 16 }}>
        <span>Showing <span style={{ color: C.gold, fontWeight: 700 }}>{results.length}</span> of {USERS.length}</span>
        {debouncedQuery && <span>for "<span style={{ color: C.text }}>{debouncedQuery}</span>"</span>}
      </div>

      {/* Results grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 12 }}>
        {results.map(u => (
          <div key={u.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10,
            animation: "fadeUp .3s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${teamColors[u.team] || C.cyan}44,${teamColors[u.team] || C.cyan}22)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 800, color: teamColors[u.team] || C.cyan, flexShrink: 0 }}>
                {u.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  <Highlight text={u.name} query={debouncedQuery} />
                </div>
                <div style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  <Highlight text={u.role} query={debouncedQuery} />
                </div>
              </div>
              <StatusDot status={u.status} />
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              <Tag color={teamColors[u.team] || C.cyan}>{u.team}</Tag>
              {u.skills.map(s => (
                <Tag key={s} color={debouncedQuery && s.toLowerCase().includes(debouncedQuery.toLowerCase()) ? C.gold : C.muted}>
                  <Highlight text={s} query={debouncedQuery} />
                </Tag>
              ))}
            </div>
            <div style={{ fontSize: 10, color: C.muted }}>Joined {u.joined}</div>
          </div>
        ))}
        {results.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 20px",
            color: C.muted, fontSize: 13, border: `1px dashed ${C.border}`, borderRadius: 10 }}>
            No users matching "{debouncedQuery}"
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 2: ASYNC DEBOUNCE — Full search with dropdown, history, abort
// ═══════════════════════════════════════════════════════════════
function TabAsync() {
  const [showCode, setShowCode] = useState(false);
  const [focused,  setFocused]  = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const dropdownRef = useRef(null);

  // Simulate API search
  const doSearch = useCallback(async (q) => {
    await fakeSearch(q, {});
    // Return filtered DOCS
    return DOCS.filter(d =>
      d.title.toLowerCase().includes(q.toLowerCase()) ||
      d.category.toLowerCase().includes(q.toLowerCase()) ||
      d.tags.some(t => t.toLowerCase().includes(q.toLowerCase()))
    );
  }, []);

  const { query, setQuery, results, loading, error, history,
    commit, removeHistory, debouncedQuery, isSearching } = useSearchWithDebounce(doSearch, { delay: 350 });

  const CATS = ["All", "API", "Frontend", "DevOps", "ML", "Database", "Security", "Architecture", "Data", "Design"];
  const catColors = { API: C.cyan, Frontend: C.violet, DevOps: C.amber, ML: C.rose,
    Database: C.sky, Security: C.rose, Architecture: C.emerald, Data: C.indigo, Design: C.gold };

  const filteredResults = useMemo(() => {
    if (!results) return null;
    if (activeFilter === "All") return results;
    return results.filter(d => d.category === activeFilter);
  }, [results, activeFilter]);

  const showDropdown = focused && (history.length > 0 || isSearching);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text }}>
            Async Debounced Search
            <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 600, color: C.cyan,
              background: C.cyan + "18", padding: "2px 10px", borderRadius: 20, border: `1px solid ${C.cyan}28` }}>
              AbortController + Race guard
            </span>
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: C.muted }}>
            Full async search: debounce → fetch → abort stale → race-condition guard → history.
          </p>
        </div>
        <button onClick={() => setShowCode(s => !s)}
          style={{ fontSize: 11, fontWeight: 700, padding: "6px 14px", borderRadius: 8, cursor: "pointer",
            border: `1px solid ${C.border2}`, background: showCode ? C.cyan + "18" : "transparent",
            color: showCode ? C.cyan : C.muted, flexShrink: 0, transition: "all .2s" }}>
          {showCode ? "Hide Code" : "View Full Hook"}
        </button>
      </div>

      {/* Key concepts */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[["useDebounce(350ms)", C.gold], ["AbortController", C.cyan], ["Race condition guard", C.violet],
          ["Search history", C.emerald], ["Error recovery", C.rose], ["Stale response drop", C.amber]].map(([l, c]) => (
          <Tag key={l} color={c}>{l}</Tag>
        ))}
      </div>

      {showCode && <CodeBlock code={CODES.useSearchFull} title="useSearchWithDebounce.js" />}

      {/* Search with dropdown */}
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <SearchInput value={query} onChange={setQuery}
          onClear={() => { setQuery(""); setFocused(false); }}
          onSubmit={() => { commit(); setFocused(false); }}
          loading={loading} placeholder="Search docs, guides, references…"
          accent={C.cyan} hint="↵ to commit" />

        {/* Dropdown */}
        {showDropdown && (
          <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 50,
            background: C.bg1, border: `1px solid ${C.border2}`, borderRadius: 12, overflow: "hidden",
            boxShadow: "0 20px 60px #00000080", animation: "fadeUp .15s ease" }}>

            {/* History */}
            {!isSearching && history.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, padding: "8px 14px 4px",
                  textTransform: "uppercase", letterSpacing: 1 }}>Recent Searches</div>
                {history.map(h => (
                  <div key={h} style={{ display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 14px", cursor: "pointer" }}
                    onMouseDown={() => { setQuery(h); setFocused(false); }}>
                    <span style={{ fontSize: 12, color: C.muted }}>↺</span>
                    <span style={{ fontSize: 13, color: C.text, flex: 1 }}>{h}</span>
                    <button onMouseDown={e => { e.stopPropagation(); removeHistory(h); }}
                      style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 11 }}>✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Suggestions while typing */}
            {isSearching && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, padding: "8px 14px 4px",
                  textTransform: "uppercase", letterSpacing: 1 }}>
                  {loading ? "Searching…" : results ? `${results.length} results` : ""}
                </div>
                {loading && (
                  <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                    {[100, 80, 60].map(w => <Skeleton key={w} h={12} w={`${w}%`} />)}
                  </div>
                )}
                {results?.slice(0, 5).map(r => (
                  <div key={r.id} onMouseDown={() => { setQuery(r.title); commit(r.title); setFocused(false); }}
                    style={{ padding: "9px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                      borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6,
                      background: (catColors[r.category] || C.cyan) + "22",
                      color: catColors[r.category] || C.cyan, fontWeight: 700, flexShrink: 0 }}>
                      {r.category}
                    </span>
                    <span style={{ fontSize: 12, color: C.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <Highlight text={r.title} query={debouncedQuery} />
                    </span>
                    <span style={{ fontSize: 10, color: C.muted, flexShrink: 0 }}>{r.views.toLocaleString()} views</span>
                  </div>
                ))}
                {results?.length === 0 && !loading && (
                  <div style={{ padding: "14px", fontSize: 12, color: C.muted, textAlign: "center" }}>
                    No results for "{debouncedQuery}"
                  </div>
                )}
                {error && (
                  <div style={{ padding: "12px 14px", fontSize: 12, color: C.rose }}>⚠ {error}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {CATS.map(cat => (
          <button key={cat} onClick={() => setActiveFilter(cat)}
            style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20, cursor: "pointer",
              border: `1px solid ${activeFilter === cat ? (catColors[cat] || C.cyan) : C.border}`,
              background: activeFilter === cat ? (catColors[cat] || C.cyan) + "18" : "transparent",
              color: activeFilter === cat ? (catColors[cat] || C.cyan) : C.muted, transition: "all .15s" }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {!isSearching && (
        <div style={{ padding: "30px", textAlign: "center", color: C.muted, fontSize: 13,
          border: `1px dashed ${C.border}`, borderRadius: 10 }}>
          Start typing to search {DOCS.length} documents…
        </div>
      )}

      {isSearching && loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", display: "flex", flex: "column", gap: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Skeleton h={14} w="70%" /> <Skeleton h={10} w="40%" /> <Skeleton h={10} w="55%" />
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredResults && !loading && (
        <>
          <div style={{ fontSize: 12, color: C.muted }}>
            <span style={{ color: C.cyan, fontWeight: 700 }}>{filteredResults.length}</span> results for "{debouncedQuery}"
            {activeFilter !== "All" && <span> in <span style={{ color: catColors[activeFilter] || C.cyan }}>{activeFilter}</span></span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredResults.map(doc => (
              <div key={doc.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
                padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 14,
                animation: "fadeUp .3s ease both" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: (catColors[doc.category] || C.cyan) + "22",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                  {{"API":"⚡","Frontend":"⚛","DevOps":"🔧","ML":"🧠","Database":"🗄","Security":"🔒","Architecture":"🏗","Data":"📊","Design":"🎨"}[doc.category] || "📄"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                    <Highlight text={doc.title} query={debouncedQuery} />
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <Tag color={catColors[doc.category] || C.cyan}>{doc.category}</Tag>
                    {doc.tags.map(t => <Tag key={t} color={debouncedQuery && t.toLowerCase().includes(debouncedQuery.toLowerCase()) ? C.gold : C.muted}>{t}</Tag>)}
                    <span style={{ fontSize: 10, color: C.muted, marginLeft: "auto" }}>{doc.views.toLocaleString()} views · {doc.updated}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 3: PATTERNS COMPARISON
// ═══════════════════════════════════════════════════════════════
function TabPatterns() {
  // Live debounce visualiser
  const [rawInput,      setRawInput]      = useState("");
  const [delay,         setDelay]         = useState(400);
  const [events,        setEvents]        = useState([]);
  const debouncedValue = useDebounce(rawInput, delay);
  const [lastFired,     setLastFired]     = useState(null);

  useEffect(() => {
    if (rawInput) {
      setEvents(e => [...e.slice(-12), { type: "keystroke", val: rawInput, t: Date.now() }]);
    }
  }, [rawInput]);

  useEffect(() => {
    if (debouncedValue) {
      setLastFired(debouncedValue);
      setEvents(e => [...e.slice(-12), { type: "fired", val: debouncedValue, t: Date.now() }]);
    }
  }, [debouncedValue]);

  // useDebouncedCallback demo
  const [cbInput,    setCbInput]    = useState("");
  const [cbLog,      setCbLog]      = useState([]);
  const { debounced: debouncedSave, cancel, flush } = useDebouncedCallback(
    (v) => setCbLog(l => [...l.slice(-5), `✓ Saved: "${v}" at ${new Date().toLocaleTimeString()}`]), 600
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text }}>Patterns & Visualiser</h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: C.muted }}>
          See debounce in action — watch keystrokes vs fired events in real time.
        </p>
      </div>

      {/* ── Comparison table ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {[
          { hook: "useDebounce", use: "Debounce a value", example: "Search input → filter", delay: "300–500ms", pro: "Simplest, zero API calls", con: "Client-side only", color: C.gold },
          { hook: "useSearchWithDebounce", use: "Async API search", example: "Autocomplete, docs search", delay: "300–400ms", pro: "Abort, race-guard, history", con: "Needs API endpoint", color: C.cyan },
          { hook: "useDebouncedCallback", use: "Debounce a function", example: "Auto-save, analytics", delay: "500–1000ms", pro: "cancel() + flush() control", con: "Manual call needed", color: C.violet },
        ].map(p => (
          <div key={p.hook} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: p.color, fontFamily: "monospace" }}>{p.hook}</div>
            <div style={{ fontSize: 11, color: C.text }}>{p.use}</div>
            <div style={{ fontSize: 10, color: C.muted, background: C.dim, borderRadius: 6, padding: "6px 10px", fontStyle: "italic" }}>{p.example}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 10 }}><span style={{ color: C.muted }}>Delay: </span><span style={{ color: C.amber }}>{p.delay}</span></div>
              <div style={{ fontSize: 10 }}><span style={{ color: C.muted }}>✓ </span><span style={{ color: C.green }}>{p.pro}</span></div>
              <div style={{ fontSize: 10 }}><span style={{ color: C.muted }}>✗ </span><span style={{ color: C.rose }}>{p.con}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Live debounce visualiser ── */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>
          Live Visualiser — watch keystrokes vs debounced fires
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
          <input value={rawInput} onChange={e => setRawInput(e.target.value)}
            placeholder="Type anything fast…"
            style={{ flex: 1, background: C.bg2, border: `1px solid ${C.border2}`, borderRadius: 8,
              padding: "8px 12px", fontSize: 13, color: C.text, outline: "none", fontFamily: "inherit" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: C.muted }}>Delay:</span>
            <input type="range" min={100} max={1500} value={delay} onChange={e => setDelay(+e.target.value)}
              style={{ width: 100 }} />
            <span style={{ fontSize: 12, color: C.gold, fontFamily: "monospace", minWidth: 50 }}>{delay}ms</span>
          </div>
          <button onClick={() => { setEvents([]); setLastFired(null); setRawInput(""); }}
            style={{ fontSize: 10, padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.border2}`,
              background: "transparent", color: C.muted, cursor: "pointer" }}>Clear</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div style={{ background: C.bg2, borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Raw input (every keystroke)</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: "monospace", minHeight: 28 }}>{rawInput || "…"}</div>
          </div>
          <div style={{ background: C.bg2, borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Debounced value (fires after {delay}ms)</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.gold, fontFamily: "monospace", minHeight: 28 }}>{lastFired || "…"}</div>
          </div>
        </div>

        {/* Event log */}
        <div style={{ background: "#050810", borderRadius: 8, padding: "10px", maxHeight: 160, overflowY: "auto", fontFamily: "monospace", fontSize: 10 }}>
          {events.length === 0 && <div style={{ color: C.muted }}>// event log — start typing…</div>}
          {events.map((e, i) => (
            <div key={i} style={{ color: e.type === "fired" ? C.gold : C.muted, marginBottom: 2 }}>
              {e.type === "fired"
                ? `⚡ FIRED  → "${e.val}"`
                : `   key   → "${e.val}"`}
            </div>
          ))}
        </div>
      </div>

      {/* ── useDebouncedCallback demo ── */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.violet, marginBottom: 4 }}>
          useDebouncedCallback — Auto-save with cancel() & flush()
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
          Type in the editor. It auto-saves 600ms after you stop. Press <Tag color={C.violet}>flush</Tag> to save immediately or <Tag color={C.rose}>cancel</Tag> to abort.
        </div>
        <textarea value={cbInput} onChange={e => { setCbInput(e.target.value); debouncedSave(e.target.value); }}
          placeholder="Start typing your draft…"
          style={{ width: "100%", background: C.bg2, border: `1px solid ${C.border2}`, borderRadius: 8,
            padding: "10px 12px", fontSize: 13, color: C.text, outline: "none", fontFamily: "inherit",
            resize: "vertical", minHeight: 80 }} />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={() => flush(cbInput)}
            style={{ fontSize: 11, fontWeight: 700, padding: "6px 14px", borderRadius: 8, cursor: "pointer",
              border: `1px solid ${C.violet}`, background: C.violet + "18", color: C.violet }}>
            ⚡ Flush (save now)
          </button>
          <button onClick={() => cancel()}
            style={{ fontSize: 11, fontWeight: 700, padding: "6px 14px", borderRadius: 8, cursor: "pointer",
              border: `1px solid ${C.rose}`, background: C.rose + "18", color: C.rose }}>
            ✕ Cancel pending save
          </button>
        </div>
        <div style={{ marginTop: 10, fontFamily: "monospace", fontSize: 11 }}>
          {cbLog.map((l, i) => <div key={i} style={{ color: C.green }}>{l}</div>)}
        </div>
        {showCode && <CodeBlock code={CODES.useDebouncedCb} title="useDebouncedCallback.js" />}
      </div>

      {/* ── When to use what ── */}
      <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>When to Use Which Delay?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            ["100–200ms", "Instant feedback needed (sliders, live preview)", C.green],
            ["300–400ms", "Search inputs, autocomplete, API calls", C.gold],
            ["500–800ms", "Auto-save drafts, form validation, analytics events", C.amber],
            ["1000ms+",  "Heavy computations, expensive renders, resize handlers", C.rose],
          ].map(([range, desc, col]) => (
            <div key={range} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 11, fontFamily: "monospace", color: col, fontWeight: 700, minWidth: 90 }}>{range}</span>
              <span style={{ fontSize: 12, color: C.muted }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════
const TABS = [
  { label: "useDebounce",      icon: "⏱", color: C.gold,   desc: "Client-side value debounce" },
  { label: "Async Search",     icon: "⚡", color: C.cyan,   desc: "API + abort + history" },
  { label: "Patterns",         icon: "⊞", color: C.violet, desc: "Visualiser + comparison" },
];

export default function App() {
  const [tab, setTab] = useState(0);
  const showCode = false; // used in TabPatterns sub-component

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'Outfit','Sora',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border2}; border-radius: 3px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        input::placeholder { color: ${C.muted}; }
        textarea::placeholder { color: ${C.muted}; }
        input[type=range] { accent-color: ${C.gold}; }
        button:hover { opacity: 0.85; }
      `}</style>

      {/* Header */}
      <header style={{ background: C.bg1, borderBottom: `1px solid ${C.border}`,
        position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(16px)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px",
          height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 800 }}>Debounced </span>
            <span style={{ fontSize: 16, fontWeight: 800, color: C.gold }}>Search</span>
            <span style={{ marginLeft: 10, fontSize: 11, color: C.muted }}>3 production-ready hooks</span>
          </div>
          <nav style={{ display: "flex", gap: 3, background: C.bg, borderRadius: 10,
            padding: 4, border: `1px solid ${C.border}` }}>
            {TABS.map((t, i) => (
              <button key={i} onClick={() => setTab(i)}
                style={{ padding: "5px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: 700, transition: "all .2s",
                  background: tab === i ? t.color + "22" : "transparent",
                  color: tab === i ? t.color : C.muted,
                  borderBottom: `2px solid ${tab === i ? t.color : "transparent"}` }}>
                <span style={{ marginRight: 5 }}>{t.icon}</span>{t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Sub-bar */}
      <div style={{ background: C.bg1, borderBottom: `1px solid ${C.border}`,
        padding: "7px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>{TABS[tab].icon}</span>
          <span style={{ fontSize: 12, color: C.muted }}>{TABS[tab].desc}</span>
          <span style={{ marginLeft: "auto", fontSize: 10, color: C.muted,
            padding: "2px 10px", borderRadius: 20, border: `1px solid ${C.border}` }}>
            Copy hook → drop into any project
          </span>
        </div>
      </div>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px" }}>
        {tab === 0 && <TabBasic />}
        {tab === 1 && <TabAsync />}
        {tab === 2 && <TabPatterns />}
      </main>
    </div>
  );
}
