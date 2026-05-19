import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  bg:     "#0A0E17",
  bg1:    "#0F1521",
  bg2:    "#151D2E",
  card:   "#111827",
  border: "#1E2D45",
  border2:"#253550",
  text:   "#E2EBF9",
  muted:  "#4A6280",
  dim:    "#1A2840",

  indigo: "#6366F1",
  violet: "#8B5CF6",
  emerald:"#10B981",
  amber:  "#F59E0B",
  rose:   "#F43F5E",
  sky:    "#0EA5E9",
  teal:   "#14B8A6",
  fuchsia:"#D946EF",
  lime:   "#84CC16",
  orange: "#F97316",
};

// ─── FAKE API ────────────────────────────────────────────────────────────────
const TAGS = ["React","Python","AI","DevOps","Design","API","Cloud","ML","Security","TypeScript"];
const CATS = ["Engineering","Product","Design","Data","Research","Career"];
const NAMES = ["Alice Chen","Bob Patel","Carol Wu","Dev Singh","Eve Tanaka","Finn O'Brien","Grace Liu","Hiro Sato"];
const IMGS  = [
  "https://picsum.photos/seed/aa/400/260",
  "https://picsum.photos/seed/bb/400/260",
  "https://picsum.photos/seed/cc/400/260",
  "https://picsum.photos/seed/dd/400/260",
  "https://picsum.photos/seed/ee/400/260",
  "https://picsum.photos/seed/ff/400/260",
  "https://picsum.photos/seed/gg/400/260",
  "https://picsum.photos/seed/hh/400/260",
];

const ri = (a,b) => Math.floor(Math.random()*(b-a)+a);
const pick = arr => arr[ri(0,arr.length)];

let __id = 0;
const mkPost = (i) => ({
  id: ++__id,
  idx: i,
  title: [
    "Building Scalable Systems with Event-Driven Architecture",
    "The Hidden Cost of Technical Debt in Growing Teams",
    "Zero-Trust Security: A Practical Implementation Guide",
    "Feature Flags Done Right: Strategies for Safe Deployments",
    "Designing APIs That Developers Actually Love to Use",
    "Lessons Learned from Running 1000 A/B Tests",
    "Why Your Microservices Are Probably a Monolith in Disguise",
    "Observability Beyond Logs: Traces, Metrics, and Everything Else",
    "The Psychology of Code Reviews: Building a Feedback Culture",
    "Database Indexing Strategies That Changed Our Query Times",
  ][i % 10],
  excerpt: "A deep exploration of how modern engineering teams tackle complex technical challenges while maintaining velocity and code quality across distributed systems.",
  author: pick(NAMES),
  category: pick(CATS),
  tag: pick(TAGS),
  img: `https://picsum.photos/seed/${i*7+3}/400/260`,
  readTime: ri(3,18),
  likes: ri(12, 980),
  date: new Date(Date.now() - ri(0, 30)*86400000).toLocaleDateString("en",{month:"short",day:"numeric"}),
});

const mkProducts = (page, perPage=8) =>
  Array.from({length:perPage},(_,i)=>({
    id: page*perPage+i+1,
    name: ["Noise-XR Pro Headphones","Luminary Desk Lamp","Zenith Mechanical Keyboard","Orbit Webcam 4K","CloudSync NAS Drive","PixelPen Stylus Pro","ArcFlow Standing Desk","FocusLight Ring"][i%8],
    price: (29.99 + ri(0,470) + ri(0,99)/100).toFixed(2),
    rating: (3.5 + Math.random()*1.5).toFixed(1),
    reviews: ri(18,4200),
    badge: ["","NEW","HOT","SALE","","LIMITED","","BESTSELLER"][i%8],
    category: pick(["Audio","Lighting","Input","Video","Storage","Drawing","Furniture","Lighting"]),
    img: `https://picsum.photos/seed/prod${page*perPage+i}/300/300`,
    color: [T.indigo,T.violet,T.emerald,T.sky,T.amber,T.rose,T.teal,T.fuchsia][i%8],
  }));

const mkPhotos = (count=12) =>
  Array.from({length:count},(_,i)=>({
    id: ri(1,99999),
    w: [400,600,400,500,400,400][i%6],
    h: [300,400,500,300,400,350][i%6],
    seed: ri(100,999),
    caption: ["Golden Hour","Urban Geometry","Still Waters","Mountain Light","Forest Path","Coastal Breeze","Night City","Morning Mist","Desert Wind","Autumn Colors","Street Life","Garden Gate"][i%12],
    photographer: pick(NAMES),
  }));

// Simulate API delay
const fakeApi = (data, delay=600+ri(0,400)) =>
  new Promise(res => setTimeout(()=>res(data), delay));

// ─── HOOKS ───────────────────────────────────────────────────────────────────

/**
 * useIntersectionObserver
 * Fires callback when target element enters viewport
 */
function useIntersectionObserver(callback, options={}) {
  const ref = useRef(null);
  useEffect(()=>{
    const el = ref.current;
    if(!el) return;
    const obs = new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting) callback();
    }, { threshold:0.1, ...options });
    obs.observe(el);
    return ()=>obs.disconnect();
  },[callback]);
  return ref;
}

/**
 * useInfiniteScroll
 * Core infinite scroll hook — fetch more when sentinel enters view
 */
function useInfiniteScroll(fetchFn, deps=[]) {
  const [items,   setItems]   = useState([]);
  const [page,    setPage]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async()=>{
    if(loading||!hasMore) return;
    setLoading(true); setError(null);
    try {
      const { data, done } = await fetchFn(page);
      setItems(prev=>[...prev,...data]);
      setPage(p=>p+1);
      if(done) setHasMore(false);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  },[page, loading, hasMore, ...deps]);

  // Load first page on mount
  useEffect(()=>{ load(); },[]);

  const sentinelRef = useIntersectionObserver(()=>{
    if(!loading && hasMore) load();
  });

  const reset = useCallback(()=>{
    setItems([]); setPage(0); setHasMore(true); setError(null);
  },[]);

  return { items, loading, hasMore, error, sentinelRef, reset, load };
}

/**
 * usePagination
 * Classic page-based pagination hook
 */
function usePagination(fetchFn, { pageSize=8 }={}) {
  const [items,      setItems]      = useState([]);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(false);

  const load = useCallback(async(pg)=>{
    setLoading(true);
    const { data, total } = await fetchFn(pg, pageSize);
    setItems(data);
    setTotalPages(Math.ceil(total/pageSize));
    setPage(pg);
    setLoading(false);
  },[fetchFn, pageSize]);

  useEffect(()=>{ load(1); },[]);

  return {
    items, page, totalPages, loading,
    goTo:  (pg) => load(pg),
    next:  () => page < totalPages && load(page+1),
    prev:  () => page > 1         && load(page-1),
  };
}

/**
 * useLazyImage
 * IntersectionObserver-based lazy image with blur-up transition
 */
function useLazyImage(src) {
  const [loaded,  setLoaded]  = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(()=>{
    const el = ref.current;
    if(!el) return;
    const obs = new IntersectionObserver(([e])=>{
      if(e.isIntersecting){ setVisible(true); obs.disconnect(); }
    },{ rootMargin:"200px" });
    obs.observe(el);
    return ()=>obs.disconnect();
  },[]);

  return { ref, src: visible?src:undefined, loaded, onLoad:()=>setLoaded(true) };
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const Skeleton = ({w="100%",h=20,radius=6})=>(
  <div style={{width:w,height:h,borderRadius:radius,background:`linear-gradient(90deg,${T.dim} 25%,${T.bg2} 50%,${T.dim} 75%)`,backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite"}}/>
);

const Spinner = ({size=20,color=T.indigo})=>(
  <div style={{width:size,height:size,border:`2px solid ${color}22`,borderTop:`2px solid ${color}`,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
);

const Tag = ({children,color=T.indigo})=>(
  <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:color+"18",color,border:`1px solid ${color}28`,fontWeight:600,letterSpacing:.4}}>{children}</span>
);

const Stars = ({rating})=>{
  const full = Math.floor(rating);
  return (
    <span style={{color:T.amber,fontSize:11,letterSpacing:-1}}>
      {"★".repeat(full)}{"☆".repeat(5-full)}
      <span style={{color:T.muted,marginLeft:4,fontSize:10}}>{rating}</span>
    </span>
  );
};

// ─── POST CARD (for infinite scroll) ─────────────────────────────────────────
const PostCard = ({post, animate=true}) => {
  const [hov, setHov] = useState(false);
  return (
    <article onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:T.card,border:`1px solid ${hov?T.border2:T.border}`,borderRadius:12,overflow:"hidden",
        transform:hov?"translateY(-3px)":"translateY(0)",transition:"all .2s ease",
        boxShadow:hov?`0 12px 40px #00000060`:"none",
        animation:animate?"fadeUp .4s ease both":undefined}}>
      <div style={{height:160,overflow:"hidden",background:T.dim,position:"relative"}}>
        <img src={post.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",
          transform:hov?"scale(1.05)":"scale(1)",transition:"transform .3s ease"}}
          onError={e=>{e.target.style.display="none"}}/>
        <div style={{position:"absolute",top:10,left:10}}>
          <Tag color={T.indigo}>{post.category}</Tag>
        </div>
      </div>
      <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:T.muted}}>
          <span>{post.author}</span>
          <span>·</span>
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.readTime} min read</span>
        </div>
        <h3 style={{fontSize:14,fontWeight:700,color:T.text,lineHeight:1.4,margin:0}}>{post.title}</h3>
        <p style={{fontSize:12,color:T.muted,lineHeight:1.6,margin:0}}>{post.excerpt}</p>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:4}}>
          <Tag color={T.violet}>{post.tag}</Tag>
          <span style={{fontSize:11,color:T.muted}}>♥ {post.likes.toLocaleString()}</span>
        </div>
      </div>
    </article>
  );
};

const PostSkeleton = () => (
  <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
    <Skeleton w="100%" h={160} radius={0}/>
    <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
      <Skeleton h={12} w="40%"/>
      <Skeleton h={16} w="90%"/>
      <Skeleton h={12} w="75%"/>
      <Skeleton h={12} w="60%"/>
    </div>
  </div>
);

// ─── PRODUCT CARD (for pagination) ───────────────────────────────────────────
const ProductCard = ({product}) => {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:T.card,border:`1px solid ${hov?T.border2:T.border}`,borderRadius:12,overflow:"hidden",
        transform:hov?"translateY(-2px)":"none",transition:"all .2s",cursor:"pointer",
        animation:"fadeUp .35s ease both"}}>
      <div style={{height:180,background:T.dim,position:"relative",overflow:"hidden"}}>
        <img src={product.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.85}}
          onError={e=>{e.target.style.display="none"}}/>
        {product.badge && (
          <div style={{position:"absolute",top:10,right:10,background:product.color,color:"#fff",
            fontSize:9,fontWeight:800,padding:"3px 8px",borderRadius:20,letterSpacing:.8}}>
            {product.badge}
          </div>
        )}
        <div style={{position:"absolute",bottom:10,left:10}}>
          <Tag color={product.color}>{product.category}</Tag>
        </div>
      </div>
      <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:6}}>
        <div style={{fontSize:12,fontWeight:700,color:T.text,lineHeight:1.3}}>{product.name}</div>
        <Stars rating={product.rating}/>
        <div style={{fontSize:10,color:T.muted}}>{product.reviews.toLocaleString()} reviews</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:4}}>
          <span style={{fontSize:18,fontWeight:800,color:product.color}}>₹{product.price}</span>
          <button style={{fontSize:10,fontWeight:700,padding:"5px 12px",borderRadius:20,border:"none",
            background:product.color,color:"#fff",cursor:"pointer"}}>Add to cart</button>
        </div>
      </div>
    </div>
  );
};

const ProductSkeleton = () => (
  <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
    <Skeleton w="100%" h={180} radius={0}/>
    <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
      <Skeleton h={14} w="80%"/> <Skeleton h={10} w="55%"/>
      <Skeleton h={10} w="40%"/> <Skeleton h={16} w="35%"/>
    </div>
  </div>
);

// ─── PHOTO CARD (for lazy loading) ───────────────────────────────────────────
const LazyPhoto = ({photo}) => {
  const src = `https://picsum.photos/seed/${photo.seed}/${photo.w}/${photo.h}`;
  const lazy = useLazyImage(src);
  return (
    <div ref={lazy.ref} style={{borderRadius:10,overflow:"hidden",background:T.dim,position:"relative",
      gridRowEnd:`span ${Math.ceil(photo.h/60)}`,animation:"fadeUp .4s ease both"}}>
      {!lazy.loaded && (
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Spinner color={T.teal}/>
        </div>
      )}
      {lazy.src && (
        <img src={lazy.src} alt={photo.caption}
          onLoad={lazy.onLoad}
          style={{width:"100%",display:"block",
            opacity:lazy.loaded?1:0,
            filter:lazy.loaded?"blur(0)":"blur(8px)",
            transform:lazy.loaded?"scale(1)":"scale(1.02)",
            transition:"opacity .5s ease, filter .5s ease, transform .5s ease"}}/>
      )}
      <div style={{position:"absolute",bottom:0,left:0,right:0,
        background:"linear-gradient(to top,#000000CC,transparent)",
        padding:"24px 12px 10px",
        opacity:lazy.loaded?1:0,transition:"opacity .5s ease"}}>
        <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{photo.caption}</div>
        <div style={{fontSize:10,color:"#ffffff88"}}>{photo.photographer}</div>
      </div>
    </div>
  );
};

// ─── CODE SNIPPET VIEWER ─────────────────────────────────────────────────────
const CODE = {
  infiniteScroll: `// ── useInfiniteScroll hook ────────────────────────────
function useInfiniteScroll(fetchFn) {
  const [items,   setItems]   = useState([]);
  const [page,    setPage]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const { data, done } = await fetchFn(page);
    setItems(prev => [...prev, ...data]);
    setPage(p => p + 1);
    if (done) setHasMore(false);
    setLoading(false);
  }, [page, loading, hasMore]);

  // IntersectionObserver sentinel
  const sentinelRef = useRef(null);
  useEffect(() => {
    const el  = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) load();
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [load]);

  useEffect(() => { load(); }, []);   // initial load

  return { items, loading, hasMore, sentinelRef };
}

// ── Usage ────────────────────────────────────────────────
function Feed() {
  const { items, loading, hasMore, sentinelRef } =
    useInfiniteScroll(async (page) => {
      const res  = await fetch(\`/api/posts?page=\${page}&limit=9\`);
      const json = await res.json();
      return { data: json.posts, done: !json.hasMore };
    });

  return (
    <div className="grid">
      {items.map(post => <PostCard key={post.id} post={post} />)}
      {loading && <Spinner />}
      {/* Sentinel — triggers load when scrolled into view */}
      <div ref={sentinelRef} style={{ height: 1 }} />
      {!hasMore && <p>You've reached the end!</p>}
    </div>
  );
}`,

  pagination: `// ── usePagination hook ────────────────────────────────
function usePagination(fetchFn, { pageSize = 8 } = {}) {
  const [items,      setItems]      = useState([]);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(false);

  const load = useCallback(async (pg) => {
    setLoading(true);
    const { data, total } = await fetchFn(pg, pageSize);
    setItems(data);
    setTotalPages(Math.ceil(total / pageSize));
    setPage(pg);
    setLoading(false);
  }, [fetchFn, pageSize]);

  useEffect(() => { load(1); }, []);

  return {
    items, page, totalPages, loading,
    goTo: (pg) => load(pg),
    next: () => page < totalPages && load(page + 1),
    prev: () => page > 1         && load(page - 1),
  };
}

// ── Usage ────────────────────────────────────────────────
function ProductGrid() {
  const { items, page, totalPages, loading, goTo, next, prev } =
    usePagination(async (pg, size) => {
      const res  = await fetch(\`/api/products?page=\${pg}&limit=\${size}\`);
      const json = await res.json();
      return { data: json.items, total: json.total };
    }, { pageSize: 8 });

  return (
    <div>
      <div className="grid">
        {loading
          ? Array.from({length: 8}).map((_,i) => <Skeleton key={i} />)
          : items.map(p => <ProductCard key={p.id} product={p} />)
        }
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        <button onClick={prev} disabled={page === 1}>← Prev</button>
        {Array.from({length: totalPages}, (_, i) => (
          <button key={i} onClick={() => goTo(i+1)}
            className={page === i+1 ? "active" : ""}>
            {i + 1}
          </button>
        ))}
        <button onClick={next} disabled={page === totalPages}>Next →</button>
      </div>
    </div>
  );
}`,

  lazyLoad: `// ── useLazyImage hook ─────────────────────────────────
function useLazyImage(src) {
  const [loaded,  setLoaded]  = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el  = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        obs.disconnect(); // load once, stop watching
      }
    }, { rootMargin: "200px" });  // pre-load 200px before viewport
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return {
    ref,
    src:    visible ? src : undefined,  // only assign src when visible
    loaded,
    onLoad: () => setLoaded(true),
  };
}

// ── Usage — blur-up reveal effect ────────────────────────
function LazyImage({ src, alt }) {
  const lazy = useLazyImage(src);

  return (
    <div ref={lazy.ref} style={{ position: "relative" }}>
      {/* Skeleton shown while loading */}
      {!lazy.loaded && <div className="skeleton" />}

      {/* Image — only rendered when visible */}
      {lazy.src && (
        <img
          src={lazy.src}
          alt={alt}
          onLoad={lazy.onLoad}
          style={{
            opacity:    lazy.loaded ? 1    : 0,
            filter:     lazy.loaded ? "blur(0)" : "blur(10px)",
            transform:  lazy.loaded ? "scale(1)" : "scale(1.03)",
            transition: "opacity .5s, filter .5s, transform .5s",
          }}
        />
      )}
    </div>
  );
}

// ── Tips ─────────────────────────────────────────────────
// rootMargin: "200px"  → pre-load before entering viewport
// disconnect after load → saves memory / CPU
// blur-up pattern       → perceived performance trick
// placeholder color     → match dominant image color`,
};

const CodeViewer = ({code}) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(()=>setCopied(false), 2000);
  };
  return (
    <div style={{background:"#060B14",border:`1px solid ${T.border}`,borderRadius:10,overflow:"hidden"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"8px 16px",borderBottom:`1px solid ${T.border}`,background:T.bg1}}>
        <div style={{display:"flex",gap:6}}>
          {["#FF5F57","#FEBC2E","#28C840"].map(c=><div key={c} style={{width:10,height:10,borderRadius:"50%",background:c}}/>)}
        </div>
        <button onClick={copy} style={{fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:6,
          border:`1px solid ${T.border2}`,background:copied?T.emerald+"22":"transparent",
          color:copied?T.emerald:T.muted,cursor:"pointer",transition:"all .2s"}}>
          {copied?"✓ Copied!":"Copy"}
        </button>
      </div>
      <pre style={{margin:0,padding:"16px",overflowX:"auto",fontSize:11,lineHeight:1.7,
        color:"#A8C0E0",fontFamily:"'JetBrains Mono','Fira Code',monospace",whiteSpace:"pre"}}>
        {code}
      </pre>
    </div>
  );
};

// ─── TAB 1: INFINITE SCROLL ──────────────────────────────────────────────────
function TabInfinite() {
  const [showCode, setShowCode] = useState(false);

  const fetchPosts = useCallback(async(page)=>{
    const perPage = 9;
    const maxPages = 4;
    await fakeApi(null, 700+ri(0,300));
    const data = Array.from({length:perPage},(_,i)=>mkPost(page*perPage+i));
    return { data, done: page >= maxPages-1 };
  },[]);

  const { items, loading, hasMore, error, sentinelRef, reset } = useInfiniteScroll(fetchPosts);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16}}>
        <div>
          <h2 style={{margin:0,fontSize:18,fontWeight:800,color:T.text}}>
            Infinite Scroll
            <span style={{marginLeft:10,fontSize:12,fontWeight:600,color:T.indigo,
              background:T.indigo+"18",padding:"2px 10px",borderRadius:20,border:`1px solid ${T.indigo}30`}}>
              IntersectionObserver
            </span>
          </h2>
          <p style={{margin:"6px 0 0",fontSize:12,color:T.muted}}>
            Scroll down — new posts load automatically when the sentinel div enters the viewport.
          </p>
        </div>
        <div style={{display:"flex",gap:8,flexShrink:0}}>
          <button onClick={()=>setShowCode(s=>!s)}
            style={{fontSize:11,fontWeight:700,padding:"6px 14px",borderRadius:8,cursor:"pointer",
              border:`1px solid ${T.border2}`,background:showCode?T.indigo+"22":"transparent",
              color:showCode?T.indigo:T.muted,transition:"all .2s"}}>
            {showCode?"Hide Code":"View Hook"}
          </button>
          <button onClick={reset}
            style={{fontSize:11,fontWeight:700,padding:"6px 14px",borderRadius:8,cursor:"pointer",
              border:`1px solid ${T.border2}`,background:"transparent",color:T.muted}}>
            Reset
          </button>
        </div>
      </div>

      {/* Info pills */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {[
          ["IntersectionObserver",T.indigo],
          ["Sentinel div at bottom",T.violet],
          ["rootMargin pre-load",T.sky],
          ["Auto-disconnect on end",T.teal],
          ["Error recovery",T.rose],
        ].map(([l,c])=><Tag key={l} color={c}>{l}</Tag>)}
      </div>

      {showCode && <CodeViewer code={CODE.infiniteScroll}/>}

      {/* Stats bar */}
      <div style={{display:"flex",gap:16,padding:"10px 16px",background:T.bg1,
        borderRadius:8,border:`1px solid ${T.border}`,fontSize:12}}>
        <span style={{color:T.muted}}>Loaded: <span style={{color:T.text,fontWeight:700}}>{items.length} posts</span></span>
        <span style={{color:T.muted}}>Pages: <span style={{color:T.indigo,fontWeight:700}}>{Math.ceil(items.length/9)}</span></span>
        <span style={{color:T.muted}}>Status: <span style={{color:loading?T.amber:hasMore?T.emerald:T.rose,fontWeight:700}}>
          {loading?"Loading...":hasMore?"Watching scroll":"Complete"}
        </span></span>
      </div>

      {/* Feed grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
        {items.map(post=><PostCard key={post.id} post={post}/>)}
        {loading && Array.from({length:3}).map((_,i)=><PostSkeleton key={`sk-${i}`}/>)}
      </div>

      {/* Sentinel */}
      <div ref={sentinelRef} style={{height:4,borderRadius:2,
        background:hasMore?T.indigo+"30":"transparent",
        transition:"background .3s"}}>
        {hasMore && loading && (
          <div style={{display:"flex",justifyContent:"center",paddingTop:12,gap:10,alignItems:"center"}}>
            <Spinner color={T.indigo}/>
            <span style={{fontSize:12,color:T.muted}}>Loading next page…</span>
          </div>
        )}
      </div>

      {!hasMore && (
        <div style={{textAlign:"center",padding:"20px",color:T.muted,fontSize:13,
          border:`1px dashed ${T.border}`,borderRadius:10}}>
          ✓ All posts loaded · {items.length} total
        </div>
      )}

      {error && (
        <div style={{padding:"12px 16px",background:T.rose+"14",border:`1px solid ${T.rose}30`,
          borderRadius:8,color:T.rose,fontSize:12}}>
          ⚠ Error: {error}
        </div>
      )}
    </div>
  );
}

// ─── TAB 2: PAGINATION ───────────────────────────────────────────────────────
function TabPagination() {
  const [showCode, setShowCode] = useState(false);
  const [mode,     setMode]     = useState("paginated"); // paginated | loadmore

  // Load-more state
  const [lmItems,   setLmItems]   = useState([]);
  const [lmPage,    setLmPage]    = useState(0);
  const [lmLoading, setLmLoading] = useState(false);
  const [lmDone,    setLmDone]    = useState(false);

  const TOTAL = 48;

  const fetchProducts = useCallback(async(pg,size)=>{
    await fakeApi(null, 500+ri(0,300));
    return { data: mkProducts(pg-1, size), total: TOTAL };
  },[]);

  const { items, page, totalPages, loading, goTo, next, prev } = usePagination(fetchProducts,{pageSize:8});

  const loadMore = async()=>{
    if(lmLoading||lmDone) return;
    setLmLoading(true);
    await fakeApi(null, 600);
    const newItems = mkProducts(lmPage, 8);
    setLmItems(p=>[...p,...newItems]);
    setLmPage(p=>p+1);
    if((lmPage+1)*8 >= TOTAL) setLmDone(true);
    setLmLoading(false);
  };

  useEffect(()=>{ if(mode==="loadmore" && lmItems.length===0) loadMore(); },[mode]);

  // Page numbers
  const pages = useMemo(()=>{
    const arr = [];
    for(let i=1;i<=totalPages;i++){
      if(i===1||i===totalPages||Math.abs(i-page)<=1) arr.push(i);
      else if(arr[arr.length-1]!=="…") arr.push("…");
    }
    return arr;
  },[page, totalPages]);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16}}>
        <div>
          <h2 style={{margin:0,fontSize:18,fontWeight:800,color:T.text}}>
            Pagination
            <span style={{marginLeft:10,fontSize:12,fontWeight:600,color:T.emerald,
              background:T.emerald+"18",padding:"2px 10px",borderRadius:20,border:`1px solid ${T.emerald}30`}}>
              Page Controls + Load More
            </span>
          </h2>
          <p style={{margin:"6px 0 0",fontSize:12,color:T.muted}}>
            Classic page-based navigation with ellipsis, plus a "Load More" variant.
          </p>
        </div>
        <button onClick={()=>setShowCode(s=>!s)}
          style={{fontSize:11,fontWeight:700,padding:"6px 14px",borderRadius:8,cursor:"pointer",
            border:`1px solid ${T.border2}`,background:showCode?T.emerald+"22":"transparent",
            color:showCode?T.emerald:T.muted,transition:"all .2s",flexShrink:0}}>
          {showCode?"Hide Code":"View Hook"}
        </button>
      </div>

      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {[["Page state in URL",T.emerald],["Ellipsis for large ranges",T.teal],["Load More variant",T.sky],["Skeleton swap on navigate",T.amber]].map(([l,c])=><Tag key={l} color={c}>{l}</Tag>)}
      </div>

      {showCode && <CodeViewer code={CODE.pagination}/>}

      {/* Mode toggle */}
      <div style={{display:"flex",gap:2,background:T.bg0,borderRadius:8,padding:3,
        border:`1px solid ${T.border}`,width:"fit-content"}}>
        {[["paginated","Page Numbers"],["loadmore","Load More"]].map(([m,l])=>(
          <button key={m} onClick={()=>setMode(m)}
            style={{padding:"5px 16px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,
              background:mode===m?T.emerald+"22":"transparent",
              color:mode===m?T.emerald:T.muted,
              borderBottom:`2px solid ${mode===m?T.emerald:"transparent"}`,transition:"all .2s"}}>
            {l}
          </button>
        ))}
      </div>

      {mode==="paginated" && (
        <>
          {/* Stats */}
          <div style={{display:"flex",gap:16,padding:"10px 16px",background:T.bg1,
            borderRadius:8,border:`1px solid ${T.border}`,fontSize:12}}>
            <span style={{color:T.muted}}>Page: <span style={{color:T.emerald,fontWeight:700}}>{page} / {totalPages}</span></span>
            <span style={{color:T.muted}}>Items: <span style={{color:T.text,fontWeight:700}}>{items.length} of {TOTAL}</span></span>
            <span style={{color:T.muted}}>Status: <span style={{color:loading?T.amber:T.emerald,fontWeight:700}}>{loading?"Fetching…":"Ready"}</span></span>
          </div>

          {/* Grid */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14,minHeight:400}}>
            {loading
              ? Array.from({length:8}).map((_,i)=><ProductSkeleton key={i}/>)
              : items.map(p=><ProductCard key={p.id} product={p}/>)
            }
          </div>

          {/* Pagination controls */}
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            <button onClick={prev} disabled={page===1||loading}
              style={paginBtn(page===1||loading, T.emerald)}>← Prev</button>
            {pages.map((pg,i)=>(
              <button key={`${pg}-${i}`}
                onClick={()=>typeof pg==="number"&&goTo(pg)}
                disabled={pg==="…"||loading}
                style={paginBtn(false, T.emerald, pg===page, pg==="…")}>
                {pg}
              </button>
            ))}
            <button onClick={next} disabled={page===totalPages||loading}
              style={paginBtn(page===totalPages||loading, T.emerald)}>Next →</button>
          </div>
        </>
      )}

      {mode==="loadmore" && (
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14}}>
            {lmItems.map(p=><ProductCard key={p.id} product={p}/>)}
            {lmLoading && Array.from({length:4}).map((_,i)=><ProductSkeleton key={`lm-sk-${i}`}/>)}
          </div>
          {!lmDone ? (
            <div style={{display:"flex",justifyContent:"center"}}>
              <button onClick={loadMore} disabled={lmLoading}
                style={{padding:"10px 32px",borderRadius:10,border:`1px solid ${T.emerald}`,
                  background:lmLoading?T.emerald+"18":T.emerald+"22",color:T.emerald,
                  cursor:lmLoading?"not-allowed":"pointer",fontSize:12,fontWeight:700,
                  display:"flex",alignItems:"center",gap:8,transition:"all .2s"}}>
                {lmLoading?<><Spinner size={14} color={T.emerald}/> Loading…</>:`Load More (${lmItems.length}/${TOTAL})`}
              </button>
            </div>
          ):(
            <div style={{textAlign:"center",color:T.muted,fontSize:13,padding:16,
              border:`1px dashed ${T.border}`,borderRadius:10}}>
              ✓ All {TOTAL} products loaded
            </div>
          )}
        </>
      )}
    </div>
  );
}

function paginBtn(disabled, color, active=false, ellipsis=false) {
  return {
    minWidth:36,height:36,padding:"0 10px",borderRadius:8,border:`1px solid ${active?color:T.border}`,
    background:active?color+"22":"transparent",
    color:active?color:disabled||ellipsis?T.muted:T.text,
    cursor:disabled||ellipsis?"default":"pointer",
    fontSize:12,fontWeight:active?700:400,transition:"all .2s",
    opacity:disabled?0.4:1,
  };
}

// ─── TAB 3: LAZY LOADING ─────────────────────────────────────────────────────
function TabLazy() {
  const [showCode, setShowCode]     = useState(false);
  const [photos,   setPhotos]       = useState(()=>mkPhotos(12));
  const [loading,  setLoading]      = useState(false);
  const [total,    setTotal]        = useState(12);

  const loadMore = async()=>{
    setLoading(true);
    await fakeApi(null, 800);
    setPhotos(p=>[...p,...mkPhotos(9)]);
    setTotal(t=>t+9);
    setLoading(false);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16}}>
        <div>
          <h2 style={{margin:0,fontSize:18,fontWeight:800,color:T.text}}>
            Lazy Loading
            <span style={{marginLeft:10,fontSize:12,fontWeight:600,color:T.teal,
              background:T.teal+"18",padding:"2px 10px",borderRadius:20,border:`1px solid ${T.teal}30`}}>
              Blur-up + rootMargin pre-load
            </span>
          </h2>
          <p style={{margin:"6px 0 0",fontSize:12,color:T.muted}}>
            Images load only when scrolled near the viewport. Blur-up reveals for perceived speed.
          </p>
        </div>
        <button onClick={()=>setShowCode(s=>!s)}
          style={{fontSize:11,fontWeight:700,padding:"6px 14px",borderRadius:8,cursor:"pointer",
            border:`1px solid ${T.border2}`,background:showCode?T.teal+"22":"transparent",
            color:showCode?T.teal:T.muted,transition:"all .2s",flexShrink:0}}>
          {showCode?"Hide Code":"View Hook"}
        </button>
      </div>

      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {[["Blur-up reveal",T.teal],["200px rootMargin",T.emerald],["Spinner placeholder",T.sky],["One-shot observer",T.violet],["CSS transitions",T.amber]].map(([l,c])=><Tag key={l} color={c}>{l}</Tag>)}
      </div>

      {showCode && <CodeViewer code={CODE.lazyLoad}/>}

      <div style={{padding:"10px 16px",background:T.bg1,borderRadius:8,border:`1px solid ${T.border}`,fontSize:12,display:"flex",gap:16}}>
        <span style={{color:T.muted}}>Photos: <span style={{color:T.teal,fontWeight:700}}>{photos.length}</span></span>
        <span style={{color:T.muted}}>Tip: <span style={{color:T.text}}>Scroll down — images load + blur-reveal as they enter view</span></span>
      </div>

      {/* Masonry-style grid */}
      <div style={{columns:"3 220px",columnGap:14,lineHeight:0}}>
        {photos.map(photo=>(
          <div key={photo.id} style={{marginBottom:14,breakInside:"avoid",display:"block"}}>
            <div style={{borderRadius:10,overflow:"hidden",background:T.dim,position:"relative"}}>
              <LazyPhoto photo={photo}/>
            </div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",justifyContent:"center"}}>
        <button onClick={loadMore} disabled={loading}
          style={{padding:"10px 32px",borderRadius:10,border:`1px solid ${T.teal}`,
            background:loading?T.teal+"18":T.teal+"22",color:T.teal,
            cursor:loading?"not-allowed":"pointer",fontSize:12,fontWeight:700,
            display:"flex",alignItems:"center",gap:8}}>
          {loading?<><Spinner size={14} color={T.teal}/> Loading…</>:`Load More Photos (${photos.length} loaded)`}
        </button>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
const TABS_CONFIG = [
  { id:"infinite", label:"Infinite Scroll",  icon:"∞", color:T.indigo,  desc:"Auto-load on scroll" },
  { id:"paginate", label:"Pagination",       icon:"⊞", color:T.emerald, desc:"Page controls + load more" },
  { id:"lazy",     label:"Lazy Loading",     icon:"◎", color:T.teal,    desc:"Blur-up image reveal" },
];

export default function App() {
  const [tab, setTab] = useState(0);

  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,
      fontFamily:"'Plus Jakarta Sans','Nunito',system-ui,sans-serif"}}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:${T.bg}}
        ::-webkit-scrollbar{width:5px;background:${T.bg}}
        ::-webkit-scrollbar-thumb{background:${T.border2};border-radius:3px}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
      `}</style>

      {/* Header */}
      <header style={{background:T.bg1,borderBottom:`1px solid ${T.border}`,
        position:"sticky",top:0,zIndex:100,backdropFilter:"blur(12px)"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px",
          height:60,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <span style={{fontSize:16,fontWeight:800,color:T.text}}>Scroll</span>
            <span style={{fontSize:16,fontWeight:800,color:TABS_CONFIG[tab].color}}> Patterns</span>
            <span style={{marginLeft:10,fontSize:11,color:T.muted}}>3 production-ready React templates</span>
          </div>
          <div style={{display:"flex",gap:4,background:T.bg,borderRadius:10,
            padding:4,border:`1px solid ${T.border}`}}>
            {TABS_CONFIG.map((t,i)=>(
              <button key={i} onClick={()=>setTab(i)}
                style={{padding:"5px 14px",borderRadius:8,border:"none",cursor:"pointer",
                  fontSize:11,fontWeight:700,transition:"all .2s",
                  background:tab===i?t.color+"22":"transparent",
                  color:tab===i?t.color:T.muted,
                  borderBottom:`2px solid ${tab===i?t.color:"transparent"}`}}>
                <span style={{marginRight:5}}>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Active tab description pill */}
      <div style={{background:T.bg1,borderBottom:`1px solid ${T.border}`,padding:"8px 24px"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18}}>{TABS_CONFIG[tab].icon}</span>
          <span style={{fontSize:12,color:T.muted}}>{TABS_CONFIG[tab].desc}</span>
          <span style={{marginLeft:"auto",fontSize:10,color:T.muted,
            padding:"2px 10px",borderRadius:20,border:`1px solid ${T.border}`}}>
            Copy hook → plug into your project
          </span>
        </div>
      </div>

      {/* Main content */}
      <main style={{maxWidth:1100,margin:"0 auto",padding:"24px"}}>
        {tab===0 && <TabInfinite/>}
        {tab===1 && <TabPagination/>}
        {tab===2 && <TabLazy/>}
      </main>
    </div>
  );
}
