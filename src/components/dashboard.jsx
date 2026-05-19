import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Cell, PieChart, Pie, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

// ─── Color System ──────────────────────────────────────────────────────────────
const C = {
  bg0: "#070B12", bg1: "#0C1220", bg2: "#111827",
  border: "#1C2A3F", border2: "#243550",
  text: "#D0E0F5", muted: "#4A6080", dim: "#2A3A55",
  cyan: "#06D6F5", cyanD: "#04A8C2",
  green: "#00F076", greenD: "#00B855",
  purple: "#B66EFF", purpleD: "#8840DD",
  amber: "#FFB830", amberD: "#D08A00",
  red: "#FF4560", redD: "#CC2040",
  blue: "#3B92FF", blueD: "#1A6AD0",
  teal: "#14D9C4", tealD: "#0BA898",
  pink: "#FF6EB4",
};

// ─── Utils ─────────────────────────────────────────────────────────────────────
const r  = (a, b) => Math.random() * (b - a) + a;
const ri = (a, b) => Math.floor(r(a, b));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const fmt = (n) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : String(n);
const pct = (n, d) => `${(n*100).toFixed(d ?? 2)}%`;

function useInterval(fn, ms) {
  const ref = useRef(fn);
  useEffect(() => { ref.current = fn; });
  useEffect(() => {
    const id = setInterval(() => ref.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

function useLiveData(factory, ms) {
  const [data, set] = useState(factory);
  useInterval(() => set(factory()), ms);
  return data;
}

// ─── Data Factories ────────────────────────────────────────────────────────────
const mkPipeline24h = () => Array.from({length:24},(_,i)=>({
  h: `${String(i).padStart(2,"0")}:00`,
  processed: ri(900, 3200),
  failed: ri(0, 90),
  latency: ri(80, 520),
}));

const mkStreamBuf = (prev) => {
  const next = prev ? [...prev.slice(1)] : Array.from({length:30},(_,i)=>({t:i,rec:ri(1200,3400),err:ri(0,60)}));
  const last = next[next.length-1] ?? {t:0};
  next.push({t:last.t+1, rec:ri(1200,3400), err:ri(0,60)});
  return next;
};

const mkJobs = () => [
  "kafka-ingest","spark-transform","dq-validator","warehouse-load","feature-store","stream-join"
].map((n,i)=>({
  name: n,
  status: ["success","running","success","success","failed","running"][i % 6],
  rows: fmt(ri(50000,9900000)),
  lat: `${ri(1,240)}s`,
  lag: `${ri(0,400)}ms`,
}));

const mkWeekly = () => ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>({
  d,
  sessions: ri(6000,24000),
  pageviews: ri(18000,70000),
  bounce: r(28,65).toFixed(1),
}));

const mkFunnel = () => {
  const v = ri(45000, 90000);
  const stages = [
    ["Visitors",    1.00],
    ["Sign-ups",    r(.18,.32)],
    ["Activated",   r(.10,.18)],
    ["Retained",    r(.05,.12)],
    ["Paying",      r(.02,.06)],
  ];
  return stages.map(([s,f])=>({ stage:s, val:Math.floor(v*f), pct:(f*100).toFixed(1) }));
};

const mkModelPerf = () => Array.from({length:30},(_,i)=>({
  d: `D${i+1}`,
  acc:   clamp(.87 + Math.sin(i/4)*.03 + r(-.01,.01), .70, .99).toFixed(4),
  prec:  clamp(.84 + Math.cos(i/5)*.03 + r(-.01,.01), .70, .99).toFixed(4),
  rec:   clamp(.82 + Math.sin(i/3)*.04 + r(-.01,.01), .70, .99).toFixed(4),
  drift: r(.005,.09).toFixed(4),
}));

const mkDrift = () => Array.from({length:40},()=>({
  x: r(-3,3).toFixed(2)*1,
  y: r(-3,3).toFixed(2)*1,
  out: Math.random()<.12,
}));

const mkExpts = () => [
  "baseline-v2","exp/lr-cosine","exp/dropout-0.4","exp/augment-v3","exp/ensemble","exp/distil-bert"
].map((n,i)=>({
  n, acc: r(.78,.95).toFixed(4),
  loss: r(.06,.28).toFixed(4),
  ep: ri(20,120),
  st: ["completed","running","completed","failed","running","completed"][i],
}));

// ─── Micro Components ──────────────────────────────────────────────────────────
const Dot = ({color}) => (
  <span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:color,
    boxShadow:`0 0 8px ${color}`,flexShrink:0}}/>
);

const Badge = ({s}) => {
  const m = {
    success:   [C.green,  "SUCCESS"],
    running:   [C.cyan,   "RUNNING"],
    failed:    [C.red,    "FAILED"],
    completed: [C.purple, "DONE"],
  }[s] ?? [C.muted,"UNKNOWN"];
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:9,fontWeight:700,
      letterSpacing:.8,padding:"2px 7px",borderRadius:20,
      background:m[0]+"18",color:m[0],border:`1px solid ${m[0]}30`}}>
      <Dot color={m[0]}/>{m[1]}
    </span>
  );
};

const KCard = ({label, val, unit, sub, color, icon, trend}) => (
  <div style={{background:C.bg1,border:`1px solid ${C.border}`,borderRadius:10,
    padding:"14px 16px",borderLeft:`3px solid ${color}`,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",right:12,top:10,fontSize:22,opacity:.12}}>{icon}</div>
    <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1.2,marginBottom:6}}>{label}</div>
    <div style={{fontSize:28,fontWeight:800,color,fontVariantNumeric:"tabular-nums",lineHeight:1}}>
      {val}<span style={{fontSize:12,fontWeight:400,color:C.muted,marginLeft:4}}>{unit}</span>
    </div>
    {sub && <div style={{marginTop:6,fontSize:10,color:trend>=0?C.green:C.red}}>
      {trend>=0?"▲":"▼"} {Math.abs(trend)}% {sub}
    </div>}
  </div>
);

const Panel = ({title, badge, accent=C.cyan, children, style={}}) => (
  <div style={{background:C.bg1,border:`1px solid ${C.border}`,borderRadius:10,
    padding:"14px 16px",display:"flex",flexDirection:"column",gap:10,...style}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:3,height:14,background:accent,borderRadius:2}}/>
        <span style={{fontSize:11,fontWeight:700,color:C.text,textTransform:"uppercase",letterSpacing:1.4}}>{title}</span>
      </div>
      {badge && <span style={{fontSize:9,padding:"2px 8px",borderRadius:20,
        background:accent+"1A",color:accent,border:`1px solid ${accent}30`,fontWeight:700,letterSpacing:.8}}>{badge}</span>}
    </div>
    {children}
  </div>
);

const TTip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:"#08101C",border:`1px solid ${C.border2}`,borderRadius:6,padding:"8px 12px",fontSize:11}}>
      {label&&<div style={{color:C.muted,marginBottom:5,fontSize:10}}>{label}</div>}
      {payload.map((p,i)=>(
        <div key={i} style={{color:p.color,display:"flex",gap:10,justifyContent:"space-between"}}>
          <span style={{color:C.muted}}>{p.name}</span>
          <span style={{fontWeight:700}}>{typeof p.value==="number"?p.value.toLocaleString():p.value}</span>
        </div>
      ))}
    </div>
  );
};

const axTick = {fill:C.muted, fontSize:9};
const grid   = {strokeDasharray:"3 4",stroke:C.border,vertical:false};

// ─── TABS CONFIG ───────────────────────────────────────────────────────────────
const TABS = [
  {id:"de", label:"Data Engineering", color:C.cyan,   icon:"⚙"},
  {id:"an", label:"Analytics",        color:C.green,  icon:"📈"},
  {id:"ml", label:"ML Monitoring",    color:C.purple, icon:"🧠"},
];

// ══════════════════════════════════════════════════════════════════════════════
// DATA ENGINEERING TAB
// ══════════════════════════════════════════════════════════════════════════════
function TabDE() {
  const [pipe24,  setPipe24]  = useState(mkPipeline24h);
  const [stream,  setStream]  = useState(()=>mkStreamBuf(null));
  const [jobs,    setJobs]    = useState(mkJobs);
  const [kpi, setKpi] = useState({thr:1847,err:23,lag:142,up:99.71});

  useInterval(()=>{
    setStream(p=>mkStreamBuf(p));
    setKpi(k=>({
      thr: clamp(k.thr+ri(-120,120), 400, 4000),
      err: clamp(k.err+ri(-4,5), 0, 200),
      lag: clamp(k.lag+ri(-25,25), 5, 600),
      up:  parseFloat(clamp(k.up+r(-.04,.03),98,100).toFixed(2)),
    }));
  }, 1800);

  useInterval(()=>{ setPipe24(mkPipeline24h()); setJobs(mkJobs()); }, 8000);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        <KCard label="Throughput"    val={kpi.thr.toLocaleString()} unit="rec/s"   color={C.cyan}   icon="⚡" trend={+2.4}  sub="vs last hour"/>
        <KCard label="Error Rate"    val={kpi.err}                  unit="err/min"  color={C.red}    icon="🔥" trend={-1.2}  sub="vs last hour"/>
        <KCard label="Consumer Lag"  val={kpi.lag}                  unit="ms"       color={C.amber}  icon="⏱" trend={-5.8}  sub="vs last hour"/>
        <KCard label="Uptime"        val={kpi.up}                   unit="%"        color={C.green}  icon="✅" trend={+0.01} sub="this week"/>
      </div>

      {/* Charts row */}
      <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:12}}>
        <Panel title="24-Hour Pipeline Volume" badge="Auto-refresh 8s" accent={C.cyan}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={pipe24}>
              <defs>
                <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.cyan} stopOpacity={.35}/>
                  <stop offset="95%" stopColor={C.cyan} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.red} stopOpacity={.35}/>
                  <stop offset="95%" stopColor={C.red} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid {...grid}/>
              <XAxis dataKey="h" tick={axTick} interval={3}/>
              <YAxis tick={axTick}/>
              <Tooltip content={<TTip/>}/>
              <Legend iconSize={8} wrapperStyle={{fontSize:10,color:C.muted}}/>
              <Area type="monotone" dataKey="processed" name="Processed" stroke={C.cyan}  fill="url(#gc)" strokeWidth={2} dot={false}/>
              <Area type="monotone" dataKey="failed"    name="Failed"    stroke={C.red}   fill="url(#gr)" strokeWidth={2} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Live Stream (1.8s tick)" badge="● LIVE" accent={C.amber}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stream}>
              <defs>
                <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.amber} stopOpacity={.4}/>
                  <stop offset="95%" stopColor={C.amber} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid {...grid}/>
              <XAxis dataKey="t" hide/>
              <YAxis tick={axTick}/>
              <Tooltip content={<TTip/>}/>
              <Area type="monotone" dataKey="rec" name="Records/s" stroke={C.amber} fill="url(#ga)" strokeWidth={2} dot={false}/>
              <Area type="monotone" dataKey="err" name="Errors"    stroke={C.red}   fillOpacity={0} strokeWidth={1.5} dot={false} strokeDasharray="4 2"/>
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Latency bar + Jobs table */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:12}}>
        <Panel title="Latency Heatmap" accent={C.amber}>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={pipe24.slice(-10)} layout="vertical" barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false}/>
              <XAxis type="number" tick={axTick}/>
              <YAxis type="category" dataKey="h" tick={axTick} width={40}/>
              <Tooltip content={<TTip/>}/>
              <Bar dataKey="latency" name="ms" radius={[0,3,3,0]}>
                {pipe24.slice(-10).map((e,i)=>(
                  <Cell key={i} fill={e.latency>400?C.red:e.latency>250?C.amber:C.green}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Pipeline Jobs" badge={`${jobs.length} jobs`} accent={C.purple}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
            <thead>
              <tr style={{color:C.muted,textTransform:"uppercase",letterSpacing:.8}}>
                {["Job","Status","Rows","Latency","Lag"].map(h=>(
                  <th key={h} style={{padding:"4px 8px",textAlign:"left",borderBottom:`1px solid ${C.border}`,fontWeight:600}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((j,i)=>(
                <tr key={i} style={{background:i%2===0?"#090F1A":"transparent"}}>
                  <td style={{padding:"7px 8px",fontFamily:"monospace",color:C.text}}>{j.name}</td>
                  <td style={{padding:"7px 8px"}}><Badge s={j.status}/></td>
                  <td style={{padding:"7px 8px",color:C.cyan,  fontFamily:"monospace"}}>{j.rows}</td>
                  <td style={{padding:"7px 8px",color:C.amber, fontFamily:"monospace"}}>{j.lat}</td>
                  <td style={{padding:"7px 8px",color:j.lag==="0ms"?C.green:C.amber,fontFamily:"monospace"}}>{j.lag}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ANALYTICS TAB
// ══════════════════════════════════════════════════════════════════════════════
function TabAN() {
  const [weekly, setWeekly] = useState(mkWeekly);
  const [funnel, setFunnel] = useState(mkFunnel);
  const [kpi,    setKpi]    = useState({dau:48231, cvr:3.82, rev:124500, cac:18.4});
  const [traffic] = useState([
    {name:"Organic",v:38},{name:"Direct",v:24},{name:"Referral",v:18},
    {name:"Social",v:13},{name:"Email",v:7}
  ]);

  useInterval(()=>{
    setKpi(k=>({
      dau: clamp(k.dau+ri(-900,900), 10000, 100000),
      cvr: parseFloat(clamp(k.cvr+r(-.12,.12),1,9).toFixed(2)),
      rev: clamp(k.rev+ri(-4000,4000), 50000, 300000),
      cac: parseFloat(clamp(k.cac+r(-.6,.6),5,60).toFixed(1)),
    }));
  }, 2200);

  useInterval(()=>{ setWeekly(mkWeekly()); setFunnel(mkFunnel()); }, 9000);

  const PIE_COLORS = [C.cyan, C.green, C.purple, C.amber, C.pink];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        <KCard label="Daily Active Users" val={kpi.dau.toLocaleString()} unit="users" color={C.green}  icon="👥" trend={+5.2}  sub="vs yesterday"/>
        <KCard label="Conversion Rate"    val={kpi.cvr}                  unit="%"     color={C.cyan}   icon="🎯" trend={+0.3}  sub="vs last week"/>
        <KCard label="Revenue"            val={`₹${fmt(kpi.rev)}`}       unit=""      color={C.amber}  icon="💰" trend={+8.1}  sub="MTD"/>
        <KCard label="Avg CAC"            val={`₹${kpi.cac}`}            unit=""      color={C.purple} icon="📊" trend={-3.4}  sub="vs last month"/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:12}}>
        <Panel title="Sessions & Pageviews — 7 Day" accent={C.green}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekly} barGap={2}>
              <CartesianGrid {...grid}/>
              <XAxis dataKey="d" tick={axTick}/>
              <YAxis tick={axTick}/>
              <Tooltip content={<TTip/>}/>
              <Legend iconSize={8} wrapperStyle={{fontSize:10,color:C.muted}}/>
              <Bar dataKey="sessions"  name="Sessions"  fill={C.green}  radius={[3,3,0,0]} opacity={.9}/>
              <Bar dataKey="pageviews" name="Pageviews" fill={C.teal}   radius={[3,3,0,0]} opacity={.7}/>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Bounce Rate" accent={C.amber}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weekly}>
              <CartesianGrid {...grid}/>
              <XAxis dataKey="d" tick={axTick}/>
              <YAxis tick={axTick} domain={[20,75]}/>
              <Tooltip content={<TTip/>}/>
              <ReferenceLine y={50} stroke={C.red} strokeDasharray="4 2"
                label={{value:"50% threshold",fill:C.red,fontSize:9}}/>
              <Line type="monotone" dataKey="bounce" name="Bounce %" stroke={C.amber} strokeWidth={2.5}
                dot={{fill:C.amber,r:4}} activeDot={{r:6}}/>
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Panel title="Conversion Funnel" accent={C.cyan}>
          <div style={{display:"flex",flexDirection:"column",gap:10,paddingTop:4}}>
            {funnel.map((f,i)=>(
              <div key={i}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:5}}>
                  <span style={{color:C.text}}>{f.stage}</span>
                  <span style={{fontFamily:"monospace"}}>
                    <span style={{color:[C.cyan,C.blue,C.purple,C.pink,C.amber][i],fontWeight:700}}>
                      {f.val.toLocaleString()}
                    </span>
                    <span style={{color:C.muted,marginLeft:6}}>{f.pct}%</span>
                  </span>
                </div>
                <div style={{height:7,background:C.border,borderRadius:4}}>
                  <div style={{height:"100%",borderRadius:4,
                    width:`${f.pct}%`,
                    background:`linear-gradient(90deg,${[C.cyan,C.blue,C.purple,C.pink,C.amber][i]},${[C.cyan,C.blue,C.purple,C.pink,C.amber][i]}66)`,
                    transition:"width .6s ease"}}/>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Traffic Sources" accent={C.purple}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{flex:1}}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={traffic} cx="50%" cy="50%"
                    innerRadius={46} outerRadius={74}
                    paddingAngle={3} dataKey="v">
                    {traffic.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip content={<TTip/>}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {traffic.map((t,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:7,fontSize:11}}>
                  <div style={{width:8,height:8,borderRadius:2,background:PIE_COLORS[i],flexShrink:0}}/>
                  <span style={{color:C.muted}}>{t.name}</span>
                  <span style={{color:PIE_COLORS[i],fontWeight:700,marginLeft:"auto",fontFamily:"monospace"}}>{t.v}%</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ML MONITORING TAB
// ══════════════════════════════════════════════════════════════════════════════
function TabML() {
  const [metrics,  setMetrics]  = useState(mkModelPerf);
  const [driftPts, setDriftPts] = useState(mkDrift);
  const [expts,    setExpts]    = useState(mkExpts);
  const [kpi, setKpi] = useState({acc:.9124, drift:.034, p50:28, p99:187, rps:4820});

  const [streamAcc, setStreamAcc] = useState(()=>
    Array.from({length:30},(_,i)=>({t:i, acc:parseFloat(r(.88,.94).toFixed(4))}))
  );

  useInterval(()=>{
    setKpi(k=>({
      acc:   parseFloat(clamp(k.acc+r(-.002,.002),.70,.99).toFixed(4)),
      drift: parseFloat(clamp(k.drift+r(-.003,.004),0,.20).toFixed(4)),
      p50:   clamp(k.p50+ri(-3,3),5,200),
      p99:   clamp(k.p99+ri(-8,10),40,600),
      rps:   clamp(k.rps+ri(-120,120),500,9999),
    }));
    setStreamAcc(p=>{
      const next = [...p.slice(1)];
      next.push({t:p[p.length-1].t+1, acc:parseFloat(clamp(p[p.length-1].acc+r(-.003,.003),.80,.99).toFixed(4))});
      return next;
    });
  }, 1500);

  useInterval(()=>{ setMetrics(mkModelPerf()); setDriftPts(mkDrift()); setExpts(mkExpts()); }, 10000);

  const driftAlert = kpi.drift > 0.06;

  // Radar data
  const radarData = [
    {metric:"Accuracy",  val: kpi.acc*100},
    {metric:"Precision", val: r(80,95)},
    {metric:"Recall",    val: r(78,93)},
    {metric:"F1 Score",  val: r(79,92)},
    {metric:"AUC-ROC",   val: r(85,97)},
    {metric:"Coverage",  val: r(88,99)},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
        <KCard label="Accuracy"      val={pct(kpi.acc,2)}         unit=""   color={C.purple} icon="🎯" trend={+0.12} sub="vs baseline"/>
        <KCard label="Feature Drift" val={kpi.drift.toFixed(4)}   unit=""   color={driftAlert?C.red:C.green} icon="📡" trend={driftAlert?+15:-8} sub="score"/>
        <KCard label="Inference P50" val={kpi.p50}                unit="ms" color={C.cyan}   icon="⚡" trend={-2.1}  sub="latency"/>
        <KCard label="Inference P99" val={kpi.p99}                unit="ms" color={C.amber}  icon="⏱" trend={+3.4}  sub="latency"/>
        <KCard label="Req/sec"       val={kpi.rps.toLocaleString()} unit=""  color={C.teal}   icon="🔄" trend={+1.8}  sub="throughput"/>
      </div>

      {driftAlert && (
        <div style={{background:C.red+"14",border:`1px solid ${C.red}40`,borderRadius:8,
          padding:"10px 16px",display:"flex",alignItems:"center",gap:10,fontSize:12}}>
          <span style={{fontSize:18}}>⚠️</span>
          <span style={{color:C.red,fontWeight:700}}>DRIFT ALERT</span>
          <span style={{color:C.text}}>Feature drift score {kpi.drift} exceeds threshold 0.06 — consider retraining.</span>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:12}}>
        <Panel title="Model Performance — 30 Day History" accent={C.purple}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={metrics}>
              <CartesianGrid {...grid}/>
              <XAxis dataKey="d" tick={axTick} interval={4}/>
              <YAxis tick={axTick} domain={[.75,.99]}/>
              <Tooltip content={<TTip/>}/>
              <Legend iconSize={8} wrapperStyle={{fontSize:10,color:C.muted}}/>
              <ReferenceLine y={.85} stroke={C.red} strokeDasharray="4 2"
                label={{value:"SLA",fill:C.red,fontSize:9,position:"insideLeft"}}/>
              <Line type="monotone" dataKey="acc"  name="Accuracy"  stroke={C.purple} strokeWidth={2}   dot={false}/>
              <Line type="monotone" dataKey="prec" name="Precision" stroke={C.cyan}   strokeWidth={1.5} dot={false}/>
              <Line type="monotone" dataKey="rec"  name="Recall"    stroke={C.green}  strokeWidth={1.5} dot={false}/>
              <Line type="monotone" dataKey="drift" name="Drift"    stroke={C.red}    strokeWidth={1.5} dot={false} strokeDasharray="4 2"/>
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Live Accuracy Stream" badge="1.5s tick" accent={C.cyan}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={streamAcc}>
              <defs>
                <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.purple} stopOpacity={.4}/>
                  <stop offset="95%" stopColor={C.purple} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid {...grid}/>
              <XAxis dataKey="t" hide/>
              <YAxis tick={axTick} domain={[.78,.99]}/>
              <Tooltip content={<TTip/>}/>
              <ReferenceLine y={.85} stroke={C.red} strokeDasharray="3 3"/>
              <Area type="monotone" dataKey="acc" name="Accuracy" stroke={C.purple} fill="url(#gp)" strokeWidth={2} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr",gap:12}}>
        <Panel title="Feature Distribution" accent={C.teal}>
          <ResponsiveContainer width="100%" height={190}>
            <ScatterChart>
              <CartesianGrid {...grid}/>
              <XAxis type="number" dataKey="x" tick={axTick} name="F1"/>
              <YAxis type="number" dataKey="y" tick={axTick} name="F2"/>
              <Tooltip content={<TTip/>} cursor={{strokeDasharray:"3 3"}}/>
              <Scatter data={driftPts.filter(d=>!d.out)} name="Normal"  fill={C.teal}   opacity={.75}/>
              <Scatter data={driftPts.filter(d=> d.out)} name="Outlier" fill={C.red}    opacity={.9}/>
            </ScatterChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Model Radar" accent={C.purple}>
          <ResponsiveContainer width="100%" height={190}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={70}>
              <PolarGrid stroke={C.border}/>
              <PolarAngleAxis dataKey="metric" tick={{fill:C.muted,fontSize:9}}/>
              <PolarRadiusAxis domain={[70,100]} tick={false} axisLine={false}/>
              <Radar name="Model" dataKey="val" stroke={C.purple} fill={C.purple} fillOpacity={.25} strokeWidth={2}/>
              <Tooltip content={<TTip/>}/>
            </RadarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Experiment Tracker" badge={`${expts.length} runs`} accent={C.amber}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
            <thead>
              <tr style={{color:C.muted,textTransform:"uppercase",letterSpacing:.8}}>
                {["Experiment","Acc","Loss","Epochs","Status"].map(h=>(
                  <th key={h} style={{padding:"4px 8px",textAlign:"left",borderBottom:`1px solid ${C.border}`,fontWeight:600}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expts.map((e,i)=>(
                <tr key={i} style={{background:i%2===0?"#090F1A":"transparent"}}>
                  <td style={{padding:"6px 8px",fontFamily:"monospace",color:C.text,fontSize:9}}>{e.n}</td>
                  <td style={{padding:"6px 8px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <div style={{width:36,height:4,background:C.border,borderRadius:2}}>
                        <div style={{height:"100%",borderRadius:2,
                          width:`${parseFloat(e.acc)*100}%`,background:C.purple}}/>
                      </div>
                      <span style={{color:C.purple,fontFamily:"monospace"}}>{e.acc}</span>
                    </div>
                  </td>
                  <td style={{padding:"6px 8px",color:C.amber,fontFamily:"monospace"}}>{e.loss}</td>
                  <td style={{padding:"6px 8px",color:C.muted,fontFamily:"monospace"}}>{e.ep}</td>
                  <td style={{padding:"6px 8px"}}><Badge s={e.st}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState(0);
  const [tick, setTick] = useState(0);
  const [ts, setTs] = useState(()=>new Date().toLocaleTimeString("en",{hour12:false}));

  useInterval(()=>{
    setTick(t=>t+1);
    setTs(new Date().toLocaleTimeString("en",{hour12:false}));
  }, 1000);

  const tabColor = TABS[tab].color;

  return (
    <div style={{minHeight:"100vh",background:C.bg0,color:C.text,
      fontFamily:"'JetBrains Mono','Fira Code','Cascadia Code',monospace",
      display:"flex",flexDirection:"column"}}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;background:${C.bg0}}
        ::-webkit-scrollbar-thumb{background:${C.border2};border-radius:3px}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
        @keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
      `}</style>

      {/* ── HEADER ── */}
      <header style={{background:C.bg1,borderBottom:`1px solid ${C.border}`,
        padding:"0 20px",height:52,display:"flex",alignItems:"center",
        justifyContent:"space-between",flexShrink:0,gap:20}}>

        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:8,
            background:`linear-gradient(135deg,${C.cyan},${C.purple})`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>⬡</div>
          <span style={{fontWeight:800,fontSize:15,letterSpacing:.5}}>
            DataOps <span style={{color:C.cyan}}>Observatory</span>
          </span>
        </div>

        {/* Tabs */}
        <nav style={{display:"flex",gap:2,background:C.bg0,borderRadius:8,
          padding:3,border:`1px solid ${C.border}`}}>
          {TABS.map((t,i)=>(
            <button key={i} onClick={()=>setTab(i)} style={{
              padding:"5px 16px",borderRadius:6,border:"none",cursor:"pointer",
              fontSize:11,fontWeight:700,transition:"all .2s",
              background: tab===i?`${t.color}18`:"transparent",
              color: tab===i?t.color:C.muted,
              borderBottom: `2px solid ${tab===i?t.color:"transparent"}`,
            }}>
              <span style={{marginRight:6}}>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>

        {/* Status */}
        <div style={{display:"flex",alignItems:"center",gap:16,fontSize:11}}>
          <div style={{display:"flex",alignItems:"center",gap:6,color:C.green}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:C.green,
              boxShadow:`0 0 8px ${C.green}`,animation:"blink 1.5s infinite"}}/>
            LIVE · {ts}
          </div>
          <span style={{color:C.muted}}>tick #{tick}</span>
        </div>
      </header>

      {/* ── LIVE TICKER BAR ── */}
      <div style={{background:"#060A10",borderBottom:`1px solid ${C.border}`,
        padding:"5px 20px",display:"flex",gap:28,fontSize:10,color:C.muted,
        overflowX:"auto",flexShrink:0}}>
        {[
          ["DE THROUGHPUT", `${ri(900,3400).toLocaleString()} rec/s`, C.cyan],
          ["ACTIVE PIPELINES", `${ri(3,8)}/8`, C.green],
          ["KAFKA LAG", `${ri(20,400)} ms`, C.amber],
          ["DAU", ri(40000,60000).toLocaleString(), C.green],
          ["CONVERSION", `${r(3,5).toFixed(2)}%`, C.teal],
          ["MODEL ACC", `${(r(.88,.95)*100).toFixed(2)}%`, C.purple],
          ["DRIFT SCORE", r(.02,.08).toFixed(4), C.red],
          ["INFERENCE P99", `${ri(120,250)} ms`, C.amber],
        ].map(([l,v,c],i)=>(
          <span key={i} style={{whiteSpace:"nowrap",flexShrink:0}}>
            {l} <span style={{color:c,fontWeight:700}}>{v}</span>
          </span>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <main style={{flex:1,padding:"14px 16px",overflowY:"auto",
        animation:"slideIn .3s ease"}}>
        {tab===0 && <TabDE/>}
        {tab===1 && <TabAN/>}
        {tab===2 && <TabML/>}
      </main>
    </div>
  );
}
