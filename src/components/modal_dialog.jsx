import { useState, useEffect, useRef, useCallback, useReducer } from "react";

// ─────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────
const T = {
  bg:       "#FAFAF8",
  surface:  "#FFFFFF",
  raised:   "#F4F3F0",
  border:   "#E5E2DC",
  borderHi: "#C9C5BC",
  ink:      "#1C1917",
  inkSub:   "#57534E",
  inkMute:  "#A8A29E",

  cobalt:   "#1D4ED8",
  cobaltL:  "#EFF6FF",
  cobaltD:  "#1E40AF",
  jade:     "#059669",
  jadeL:    "#ECFDF5",
  amber:    "#B45309",
  amberL:   "#FFFBEB",
  crimson:  "#B91C1C",
  crimsonL: "#FEF2F2",

  overlay:  "rgba(28,25,23,0.48)",
  shadow:   "0 32px 96px rgba(28,25,23,0.22), 0 8px 24px rgba(28,25,23,0.08)",
};

// ─────────────────────────────────────────────────────────────
// CORE HOOKS
// ─────────────────────────────────────────────────────────────

const FOCUSABLE_SELECTORS = [
  'a[href]','button:not([disabled])','input:not([disabled])',
  'select:not([disabled])','textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])','details > summary',
].join(', ');

function useFocusTrap(enabled) {
  const ref        = useRef(null);
  const savedFocus = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    savedFocus.current = document.activeElement;
    const el = ref.current;
    if (!el) return;

    const getFocusable = () =>
      [...el.querySelectorAll(FOCUSABLE_SELECTORS)].filter(n => n.offsetParent !== null);

    const raf = requestAnimationFrame(() => (getFocusable()[0] ?? el).focus());

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const nodes = getFocusable();
      if (!nodes.length) { e.preventDefault(); return; }
      const first = nodes[0], last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || !el.contains(active)) { e.preventDefault(); last.focus(); }
      } else {
        if (active === last || !el.contains(active)) { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      savedFocus.current?.focus?.();
    };
  }, [enabled]);

  return ref;
}

function useModal(initial = false) {
  const [open, setOpen] = useState(initial);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open]);

  useEffect(() => {
    if (open) {
      const y = window.scrollY;
      document.body.style.cssText = `overflow:hidden;position:fixed;top:-${y}px;width:100%`;
      return () => {
        const top = document.body.style.top;
        document.body.style.cssText = '';
        window.scrollTo(0, -parseInt(top || '0'));
      };
    }
  }, [open]);

  return { isOpen: open, open: () => setOpen(true), close: () => setOpen(false), toggle: () => setOpen(o => !o) };
}

// ─────────────────────────────────────────────────────────────
// MODAL PRIMITIVE
// ─────────────────────────────────────────────────────────────
function Modal({ isOpen, onClose, children, size='md', closeOnBackdrop=true, animation='scale', labelId, descId }) {
  const [phase, setPhase] = useState('out');
  const containerRef = useFocusTrap(isOpen);
  const backdropRef  = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setPhase('in')));
      return () => cancelAnimationFrame(id);
    } else { setPhase('out'); }
  }, [isOpen]);

  const onBackdropClick = useCallback((e) => {
    if (closeOnBackdrop && e.target === backdropRef.current) onClose();
  }, [closeOnBackdrop, onClose]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (isOpen) { setMounted(true); }
    else { const t = setTimeout(() => setMounted(false), 280); return () => clearTimeout(t); }
  }, [isOpen]);

  if (!mounted) return null;

  const SIZES = { xs:{width:320}, sm:{width:440}, md:{width:560}, lg:{width:720}, xl:{width:960} };
  const ENTER = { scale:'scale(0.92) translateY(10px)', 'slide-up':'translateY(48px)', 'slide-down':'translateY(-48px)', fade:'scale(1)' };
  const sz = SIZES[size] || SIZES.md;
  const isIn = phase === 'in';

  return (
    <div ref={backdropRef} onClick={onBackdropClick} aria-hidden={!isOpen}
      style={{ position:'fixed',inset:0,zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',
        padding:20,background:T.overlay,
        backdropFilter: isIn ? 'blur(4px) saturate(0.8)' : 'blur(0px)',
        opacity: isIn ? 1 : 0,
        transition:'opacity 0.25s ease, backdrop-filter 0.28s ease' }}>
      <div ref={containerRef} role="dialog" aria-modal="true" aria-labelledby={labelId}
        aria-describedby={descId} tabIndex={-1}
        style={{ position:'relative',background:T.surface,borderRadius:14,boxShadow:T.shadow,
          width:sz.width,maxWidth:'calc(100vw - 40px)',maxHeight:'calc(100vh - 40px)',
          display:'flex',flexDirection:'column',overflow:'hidden',outline:'none',
          transform: isIn ? 'none' : (ENTER[animation]||ENTER.scale),
          opacity: isIn ? 1 : 0,
          transition:'transform 0.28s cubic-bezier(0.34,1.5,0.64,1), opacity 0.22s ease' }}>
        {children}
      </div>
    </div>
  );
}

Modal.Header = function({ id, children, onClose }) {
  return (
    <div style={{ display:'flex',alignItems:'flex-start',gap:12,padding:'20px 22px 16px',
      borderBottom:`1px solid ${T.border}`,flexShrink:0 }}>
      <div style={{ flex:1 }}>
        {typeof children === 'string'
          ? <h2 id={id} style={{ margin:0,fontSize:17,fontWeight:750,color:T.ink,letterSpacing:'-0.02em' }}>{children}</h2>
          : children}
      </div>
      {onClose && <CloseBtn onClick={onClose} />}
    </div>
  );
};

Modal.Body = function({ children, noPad=false }) {
  return <div style={{ flex:1,overflowY:'auto',padding: noPad?0:'18px 22px' }}>{children}</div>;
};

Modal.Footer = function({ children, justify='end' }) {
  const j = { start:'flex-start',center:'center',end:'flex-end',between:'space-between' };
  return (
    <div style={{ display:'flex',alignItems:'center',gap:8,justifyContent:j[justify]||j.end,
      padding:'14px 22px',borderTop:`1px solid ${T.border}`,background:T.raised,flexShrink:0 }}>
      {children}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// SHARED UI
// ─────────────────────────────────────────────────────────────
function CloseBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} aria-label="Close dialog"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width:30,height:30,borderRadius:8,flexShrink:0,
        border:`1px solid ${hov?T.borderHi:T.border}`,background:hov?T.raised:'transparent',
        color:hov?T.ink:T.inkMute,cursor:'pointer',fontSize:15,
        display:'flex',alignItems:'center',justifyContent:'center',transition:'all .15s' }}>×</button>
  );
}

function Btn({ children, variant='primary', color, onClick, type='button', disabled, full, style={} }) {
  const [hov, setHov] = useState(false);
  const col = color || T.cobalt;
  const v = {
    primary:   { bg: hov?col+'DD':col, text:'#fff', border:col },
    secondary: { bg: hov?T.raised:'transparent', text:T.inkSub, border:T.border },
    danger:    { bg: hov?T.crimson:'transparent', text:hov?'#fff':T.crimson, border:T.crimson },
    ghost:     { bg: hov?T.raised:'transparent', text:T.inkSub, border:'transparent' },
  }[variant] || {};
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding:'8px 18px',borderRadius:9,border:`1px solid ${v.border}`,background:v.bg,
        color:v.text,fontSize:13,fontWeight:600,cursor:disabled?'not-allowed':'pointer',
        opacity:disabled?0.55:1,transition:'all .15s',width:full?'100%':undefined,
        fontFamily:'inherit',display:'inline-flex',alignItems:'center',gap:6,...style }}>
      {children}
    </button>
  );
}

function Input({ label, id, type='text', placeholder, defaultValue, note }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
      {label && <label htmlFor={id} style={{ fontSize:12,fontWeight:600,color:T.inkSub }}>{label}</label>}
      {type === 'textarea' ? (
        <textarea id={id} defaultValue={defaultValue} placeholder={placeholder} rows={3}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ padding:'9px 12px',borderRadius:8,fontFamily:'inherit',
            border:`1.5px solid ${focus?T.cobalt:T.border}`,background:T.bg,
            color:T.ink,fontSize:13,outline:'none',resize:'vertical',transition:'border-color .15s' }} />
      ) : (
        <input id={id} type={type} defaultValue={defaultValue} placeholder={placeholder}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ padding:'9px 12px',borderRadius:8,fontFamily:'inherit',
            border:`1.5px solid ${focus?T.cobalt:T.border}`,background:T.bg,
            color:T.ink,fontSize:13,outline:'none',transition:'border-color .15s' }} />
      )}
      {note && <p style={{ margin:0,fontSize:11,color:T.inkMute }}>{note}</p>}
    </div>
  );
}

function Spinner({ size=16, color='#fff' }) {
  return <span style={{ display:'inline-block',width:size,height:size,border:`2px solid ${color}44`,
    borderTopColor:color,borderRadius:'50%',animation:'md-spin .65s linear infinite',flexShrink:0 }} />;
}

function Tag({ children, color=T.cobalt }) {
  return <span style={{ fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,
    background:color+'14',color,border:`1px solid ${color}22` }}>{children}</span>;
}

// ─────────────────────────────────────────────────────────────
// 7 MODAL VARIANTS
// ─────────────────────────────────────────────────────────────

function ConfirmModal({ isOpen, onClose, variant='delete' }) {
  const config = {
    delete:  { emoji:'🗑', color:T.crimson, colorL:T.crimsonL, title:'Delete repository', body:'This will permanently destroy "platform-core" and all its branches, issues, and history. There is no undo.', confirm:'Yes, delete it' },
    leave:   { emoji:'👋', color:T.amber,   colorL:T.amberL,   title:'Leave workspace',   body:'You will lose access to all projects in "Acme Engineering". An admin can reinvite you later.', confirm:'Leave workspace' },
    publish: { emoji:'🚀', color:T.jade,    colorL:T.jadeL,    title:'Deploy to production', body:'This will push build #4821 live. 12,400 users will see these changes immediately.', confirm:'Deploy now' },
  };
  const c = config[variant];
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" animation="scale" labelId="confirm-title">
      <Modal.Body>
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',gap:16,padding:'8px 0' }}>
          <div style={{ width:60,height:60,borderRadius:18,background:c.colorL,
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:28 }}>{c.emoji}</div>
          <div>
            <h2 id="confirm-title" style={{ margin:'0 0 8px',fontSize:18,fontWeight:750,color:T.ink,letterSpacing:'-0.02em' }}>{c.title}</h2>
            <p style={{ margin:0,fontSize:13,color:T.inkSub,lineHeight:1.65 }}>{c.body}</p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer justify="center">
        <Btn variant="secondary" onClick={onClose} style={{ minWidth:100 }}>Cancel</Btn>
        <Btn variant={variant==='publish'?'primary':'danger'} color={c.color} onClick={onClose} style={{ minWidth:140 }}>{c.confirm}</Btn>
      </Modal.Footer>
    </Modal>
  );
}

function FormModal({ isOpen, onClose }) {
  const [state, setState] = useState('idle');
  const handleSubmit = (e) => {
    e.preventDefault();
    setState('saving');
    setTimeout(() => { setState('saved'); setTimeout(() => { setState('idle'); onClose(); }, 900); }, 1500);
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" animation="slide-up" labelId="form-title">
      <Modal.Header id="form-title" onClose={onClose}>
        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          <div style={{ width:34,height:34,borderRadius:9,background:T.cobaltL,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17 }}>✏️</div>
          <div>
            <h2 id="form-title" style={{ margin:0,fontSize:16,fontWeight:750,color:T.ink }}>Edit Profile</h2>
            <p style={{ margin:0,fontSize:11,color:T.inkMute }}>Changes apply to all workspaces</p>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body>
        <form id="edit-profile" onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:14 }}>
          <div style={{ display:'flex',alignItems:'center',gap:14,padding:14,background:T.raised,borderRadius:10,border:`1px solid ${T.border}` }}>
            <div style={{ width:52,height:52,borderRadius:'50%',background:`linear-gradient(135deg,${T.cobalt},#7C3AED)`,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,color:'#fff',fontWeight:800,flexShrink:0 }}>MC</div>
            <div>
              <div style={{ fontSize:14,fontWeight:700,color:T.ink }}>Marcus Cole</div>
              <button type="button" style={{ fontSize:11,color:T.cobalt,background:'none',border:'none',cursor:'pointer',padding:0,fontFamily:'inherit',fontWeight:600 }}>Change photo →</button>
            </div>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <Input id="fname" label="First name" defaultValue="Marcus" />
            <Input id="lname" label="Last name" defaultValue="Cole" />
          </div>
          <Input id="email" label="Email" type="email" defaultValue="marcus@company.io" note="Changing your email requires re-verification." />
          <Input id="title" label="Job title" defaultValue="Staff Engineer" />
          <Input id="bio" label="Bio" type="textarea" placeholder="Tell your team about yourself…" />
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Btn variant="secondary" onClick={onClose}>Discard</Btn>
        <Btn type="submit" form="edit-profile" disabled={state!=='idle'} style={{ minWidth:130 }}>
          {state==='saving' && <><Spinner size={13} />Saving…</>}
          {state==='saved' && <>✓ Saved!</>}
          {state==='idle' && 'Save changes'}
        </Btn>
      </Modal.Footer>
    </Modal>
  );
}

function LightboxModal({ isOpen, onClose }) {
  const slides = [
    { id:47,  label:'System architecture overview', tag:'Engineering' },
    { id:200, label:'Q4 design exploration',        tag:'Design'      },
    { id:64,  label:'Team retreat — Oaxaca 2024',   tag:'Culture'     },
    { id:433, label:'Product roadmap FY25',          tag:'Product'     },
    { id:99,  label:'Deployment dashboard preview', tag:'Platform'    },
  ];
  const [idx, setIdx] = useState(0);
  const prev = useCallback(() => setIdx(i => (i-1+slides.length)%slides.length), []);
  const next = useCallback(() => setIdx(i => (i+1)%slides.length), []);
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => { if (e.key==='ArrowLeft') prev(); if (e.key==='ArrowRight') next(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, prev, next]);
  const s = slides[idx];
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" animation="fade" closeOnBackdrop>
      <div style={{ background:'#0C0C0C',display:'flex',flexDirection:'column' }}>
        <div style={{ position:'relative',height:380,overflow:'hidden' }}>
          <img key={s.id} src={`https://picsum.photos/seed/${s.id}/900/400`} alt={s.label}
            style={{ width:'100%',height:'100%',objectFit:'cover',animation:'md-fade .3s ease' }} />
          <div style={{ position:'absolute',inset:0,background:'linear-gradient(to top,#0C0C0C 0%,transparent 55%)' }} />
          <button onClick={onClose} aria-label="Close" style={{ position:'absolute',top:12,right:12,width:32,height:32,
            borderRadius:8,background:'#FFFFFF1A',border:'1px solid #FFFFFF22',color:'#fff',cursor:'pointer',fontSize:16,backdropFilter:'blur(8px)' }}>×</button>
          {[['←',prev,true],['→',next,false]].map(([sym,fn,isLeft]) => (
            <button key={sym} onClick={fn} aria-label={isLeft?'Previous':'Next'}
              style={{ position:'absolute',top:'50%',left:isLeft?12:'auto',right:isLeft?'auto':12,
                transform:'translateY(-50%)',width:40,height:40,borderRadius:'50%',
                background:'#FFFFFF18',border:'1px solid #FFFFFF22',color:'#fff',
                cursor:'pointer',fontSize:18,backdropFilter:'blur(8px)',
                display:'flex',alignItems:'center',justifyContent:'center' }}>{sym}</button>
          ))}
          <div style={{ position:'absolute',bottom:16,left:18,right:18 }}>
            <Tag color="#fff">{s.tag}</Tag>
            <div style={{ marginTop:6,fontSize:15,fontWeight:700,color:'#fff' }}>{s.label}</div>
          </div>
        </div>
        <div style={{ display:'flex',gap:8,padding:'10px 14px',alignItems:'center',overflowX:'auto' }}>
          {slides.map((sl,i) => (
            <button key={sl.id} onClick={() => setIdx(i)}
              style={{ width:56,height:40,borderRadius:6,padding:0,cursor:'pointer',flexShrink:0,
                border:`2px solid ${i===idx?T.cobalt:'transparent'}`,overflow:'hidden',transition:'border-color .15s' }}>
              <img src={`https://picsum.photos/seed/${sl.id}/112/80`} alt=""
                style={{ width:'100%',height:'100%',objectFit:'cover',opacity:i===idx?1:0.45,transition:'opacity .15s' }} />
            </button>
          ))}
          <span style={{ marginLeft:'auto',fontSize:11,color:'#555',flexShrink:0 }}>{idx+1} / {slides.length} · ←→</span>
        </div>
      </div>
    </Modal>
  );
}

function DrawerModal({ isOpen, onClose }) {
  const containerRef = useFocusTrap(isOpen);
  const [phase, setPhase] = useState('out');
  useEffect(() => {
    if (isOpen) requestAnimationFrame(() => requestAnimationFrame(() => setPhase('in')));
    else setPhase('out');
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => { if (e.key==='Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onClose]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (isOpen) setMounted(true);
    else { const t = setTimeout(() => setMounted(false), 320); return () => clearTimeout(t); }
  }, [isOpen]);
  if (!mounted) return null;
  const isIn = phase === 'in';
  const SECTIONS = [
    { icon:'📋',label:'General',     sub:'Name, description, visibility' },
    { icon:'👥',label:'Members',     sub:'Roles and access control' },
    { icon:'🔗',label:'Integrations',sub:'GitHub, Slack, Linear' },
    { icon:'🔔',label:'Notifications',sub:'Alerts and digests' },
    { icon:'💳',label:'Billing',     sub:'Plan, invoices, limits' },
    { icon:'⚠️',label:'Danger Zone', sub:'Archive or delete project', danger:true },
  ];
  return (
    <div onClick={(e) => { if (e.target===e.currentTarget) onClose(); }}
      style={{ position:'fixed',inset:0,zIndex:2000,
        background:isIn?T.overlay:'transparent',backdropFilter:isIn?'blur(3px)':'none',
        transition:'background .3s, backdrop-filter .3s' }}>
      <div ref={containerRef} role="dialog" aria-modal="true" aria-label="Project settings" tabIndex={-1}
        style={{ position:'absolute',top:0,right:0,bottom:0,width:400,background:T.surface,
          boxShadow:'-12px 0 48px rgba(28,25,23,.2)',display:'flex',flexDirection:'column',outline:'none',
          transform:isIn?'translateX(0)':'translateX(100%)',transition:'transform .3s cubic-bezier(.32,0,.15,1)' }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,padding:'18px 20px',borderBottom:`1px solid ${T.border}`,flexShrink:0 }}>
          <div style={{ width:34,height:34,borderRadius:9,background:T.raised,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17 }}>⚙️</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14,fontWeight:700,color:T.ink }}>Project Settings</div>
            <div style={{ fontSize:11,color:T.inkMute }}>platform-core · v2</div>
          </div>
          <CloseBtn onClick={onClose} />
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'8px 0' }}>
          {SECTIONS.map((s) => (
            <button key={s.label} style={{ width:'100%',display:'flex',alignItems:'center',gap:12,
              padding:'12px 20px',border:'none',background:'transparent',cursor:'pointer',
              textAlign:'left',fontFamily:'inherit',borderLeft:'3px solid transparent',transition:'all .12s' }}
              onMouseEnter={e => { e.currentTarget.style.background=T.raised; e.currentTarget.style.borderLeftColor=s.danger?T.crimson:T.cobalt; }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderLeftColor='transparent'; }}>
              <span style={{ fontSize:18 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize:13,fontWeight:600,color:s.danger?T.crimson:T.ink }}>{s.label}</div>
                <div style={{ fontSize:11,color:T.inkMute,marginTop:1 }}>{s.sub}</div>
              </div>
              <span style={{ marginLeft:'auto',color:T.inkMute,fontSize:16 }}>›</span>
            </button>
          ))}
        </div>
        <div style={{ padding:'14px 20px',borderTop:`1px solid ${T.border}` }}>
          <Btn variant="secondary" full onClick={onClose}>Close panel</Btn>
        </div>
      </div>
    </div>
  );
}

function WizardModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState(null);
  const TOTAL = 3;
  const PLANS = [
    { id:'hobby', name:'Hobby',price:'Free',   desc:'3 projects · 1 member',    icon:'🌱' },
    { id:'pro',   name:'Pro',  price:'$12/mo', desc:'Unlimited · CI/CD · Logs', icon:'⚡' },
    { id:'team',  name:'Team', price:'$48/mo', desc:'SSO · Audit · SLA support',icon:'🏢' },
  ];
  const finish = () => { setStep(0); setPlan(null); onClose(); };
  const STEPS = [
    { title:'Pick your plan', sub:'Upgrade or downgrade anytime',
      content: (
        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          {PLANS.map(p => (
            <button key={p.id} onClick={() => setPlan(p.id)}
              style={{ display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:11,
                border:`2px solid ${plan===p.id?T.cobalt:T.border}`,background:plan===p.id?T.cobaltL:T.bg,
                cursor:'pointer',textAlign:'left',fontFamily:'inherit',transition:'all .15s' }}>
              <span style={{ fontSize:26 }}>{p.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14,fontWeight:700,color:T.ink }}>{p.name}</div>
                <div style={{ fontSize:12,color:T.inkMute }}>{p.desc}</div>
              </div>
              <div style={{ fontSize:14,fontWeight:700,color:plan===p.id?T.cobalt:T.inkSub }}>{p.price}</div>
            </button>
          ))}
        </div>
      ),
    },
    { title:'Invite teammates', sub:'You can skip and invite later',
      content: (
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          <Input id="inv1" label="Email address" type="email" placeholder="colleague@company.io" />
          <Input id="inv2" label="Email address" type="email" placeholder="another@company.io" />
          <div style={{ padding:'10px 12px',background:T.raised,borderRadius:9,fontSize:12,color:T.inkMute,lineHeight:1.6,border:`1px solid ${T.border}` }}>
            Invites expire after 7 days. Recipients will be added as viewers by default.
          </div>
        </div>
      ),
    },
    { title:"You're all set 🎉", sub:'Your workspace is ready',
      content: (
        <div style={{ textAlign:'center',padding:'12px 0' }}>
          <div style={{ fontSize:56,marginBottom:16 }}>🚀</div>
          <p style={{ margin:'0 0 20px',fontSize:14,color:T.inkSub,lineHeight:1.6 }}>
            Your workspace is live on the <strong style={{ color:T.cobalt }}>{PLANS.find(p=>p.id===plan)?.name||'Hobby'}</strong> plan.
          </p>
          <div style={{ display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap' }}>
            {['Projects','Docs','Pipelines','Settings'].map(l => <Tag key={l} color={T.cobalt}>{l}</Tag>)}
          </div>
        </div>
      ),
    },
  ];
  const cur = STEPS[step];
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" animation="slide-up" labelId="wiz-title">
      <Modal.Header id="wiz-title" onClose={onClose}>
        <h2 id="wiz-title" style={{ margin:'0 0 2px',fontSize:16,fontWeight:750,color:T.ink }}>{cur.title}</h2>
        <p style={{ margin:0,fontSize:12,color:T.inkMute }}>{cur.sub}</p>
      </Modal.Header>
      <div style={{ display:'flex',gap:4,padding:'12px 22px 0',alignItems:'center' }}>
        {Array.from({length:TOTAL}).map((_,i) => (
          <div key={i} style={{ flex:1,height:3,borderRadius:2,background:i<=step?T.cobalt:T.border,transition:'background .3s' }} />
        ))}
        <span style={{ fontSize:10,color:T.inkMute,marginLeft:8,flexShrink:0 }}>{step+1}/{TOTAL}</span>
      </div>
      <Modal.Body>{cur.content}</Modal.Body>
      <Modal.Footer>
        {step>0 && step<TOTAL-1 && <Btn variant="ghost" onClick={() => setStep(s=>s-1)}>← Back</Btn>}
        <Btn style={{ marginLeft:'auto' }} onClick={step===TOTAL-1?finish:()=>setStep(s=>s+1)} disabled={step===0&&!plan}>
          {step===TOTAL-1?'Open workspace →':step===1?'Send invites →':'Continue →'}
        </Btn>
      </Modal.Footer>
    </Modal>
  );
}

function NestedModal({ isOpen, onClose }) {
  const inner = useModal();
  const innermost = useModal();
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="md" animation="scale" labelId="n1-title">
        <Modal.Header id="n1-title" onClose={onClose}>
          <h2 id="n1-title" style={{ margin:0,fontSize:16,fontWeight:750,color:T.ink }}>Level 1 — Outer</h2>
        </Modal.Header>
        <Modal.Body>
          <p style={{ fontSize:13,color:T.inkSub,lineHeight:1.7,marginBottom:16 }}>
            Each modal manages its own focus trap and Escape handler independently. Opening a nested modal hands over focus control. Closing restores it.
          </p>
          <div style={{ padding:'12px 14px',background:T.raised,borderRadius:9,marginBottom:16,border:`1px solid ${T.border}`,fontSize:12,color:T.inkMute,lineHeight:1.6 }}>
            <strong style={{ color:T.ink }}>Try it:</strong> Open the inner modal, press Escape — only the inner one closes.
          </div>
          <Btn onClick={inner.open} color="#7C3AED">Open Level 2 →</Btn>
        </Modal.Body>
        <Modal.Footer><Btn variant="secondary" onClick={onClose}>Close</Btn></Modal.Footer>
      </Modal>
      <Modal isOpen={inner.isOpen} onClose={inner.close} size="sm" animation="scale">
        <Modal.Header onClose={inner.close}><h2 style={{ margin:0,fontSize:15,fontWeight:750,color:T.ink }}>Level 2 — Inner</h2></Modal.Header>
        <Modal.Body>
          <p style={{ fontSize:13,color:T.inkSub,lineHeight:1.65,marginBottom:14 }}>Focus is trapped here now. ESC closes this — Level 1 stays open.</p>
          <Btn onClick={innermost.open} color={T.jade} style={{ fontSize:12 }}>Go deeper →</Btn>
        </Modal.Body>
        <Modal.Footer><Btn variant="secondary" onClick={inner.close}>Close this</Btn></Modal.Footer>
      </Modal>
      <Modal isOpen={innermost.isOpen} onClose={innermost.close} size="xs" animation="scale">
        <Modal.Header onClose={innermost.close}><h2 style={{ margin:0,fontSize:14,fontWeight:750,color:T.ink }}>Level 3 — Deepest</h2></Modal.Header>
        <Modal.Body><p style={{ fontSize:13,color:T.inkSub,lineHeight:1.65 }}>Three levels deep! Press Escape to unwind one level at a time.</p></Modal.Body>
        <Modal.Footer justify="center"><Btn onClick={innermost.close} color={T.jade}>Close ←</Btn></Modal.Footer>
      </Modal>
    </>
  );
}

function ScrollableModal({ isOpen, onClose }) {
  const [accepted, setAccepted] = useState(false);
  const SECTIONS = [
    ['1. Acceptance of Terms','By accessing or using our platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.'],
    ['2. Use of Services','Our platform is intended for commercial and personal use in accordance with these terms. You agree not to misuse our services or help anyone else do so. Misuse includes any activity that interferes with the normal operation of the service.'],
    ['3. Intellectual Property','The content, features, and functionality of this service are owned by the company and protected by international copyright, trademark, and other intellectual property laws. You may not copy or distribute this content.'],
    ['4. Privacy Policy','Your use of the service is also governed by our Privacy Policy. Please review it to understand our practices regarding the collection and use of your personal information.'],
    ['5. Limitation of Liability','In no event shall the company be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of the service.'],
    ['6. Termination','We reserve the right to terminate or suspend access immediately, without prior notice, for any breach of these Terms. Upon termination, your right to use the service ceases immediately.'],
    ['7. Governing Law','These Terms shall be governed by the laws of the jurisdiction in which the company is registered, without regard to conflict of law provisions.'],
  ];
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" animation="slide-up" labelId="tos-title">
      <Modal.Header id="tos-title" onClose={onClose}>
        <h2 id="tos-title" style={{ margin:'0 0 2px',fontSize:16,fontWeight:750,color:T.ink }}>Terms of Service</h2>
        <p style={{ margin:0,fontSize:11,color:T.inkMute }}>Last updated January 2025</p>
      </Modal.Header>
      <Modal.Body>
        <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
          {SECTIONS.map(([title,text]) => (
            <div key={title}>
              <h3 style={{ margin:'0 0 6px',fontSize:13,fontWeight:700,color:T.ink }}>{title}</h3>
              <p style={{ margin:0,fontSize:13,color:T.inkSub,lineHeight:1.7 }}>{text}</p>
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer justify="between">
        <label style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color:T.inkSub }}>
          <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)}
            style={{ width:15,height:15,accentColor:T.cobalt }} />
          I have read and agree
        </label>
        <div style={{ display:'flex',gap:8 }}>
          <Btn variant="secondary" onClick={onClose}>Decline</Btn>
          <Btn disabled={!accepted} onClick={onClose}>Accept →</Btn>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// CODE VIEWER
// ─────────────────────────────────────────────────────────────
const SNIPPETS = {
  focustrap: `// ── useFocusTrap ─────────────────────────────────────────────
const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

function useFocusTrap(enabled) {
  const ref        = useRef(null);
  const savedFocus = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    savedFocus.current = document.activeElement;   // remember trigger
    const getFocusable = () =>
      [...ref.current.querySelectorAll(FOCUSABLE)]
        .filter(n => n.offsetParent !== null);      // skip hidden

    // Auto-focus first focusable element
    requestAnimationFrame(() => getFocusable()[0]?.focus());

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const nodes = getFocusable();
      const first = nodes[0], last = nodes[nodes.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();           // wrap backwards
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();          // wrap forwards
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      savedFocus.current?.focus();    // ← restores focus on close
    };
  }, [enabled]);

  return ref;
}`,

  usemodal: `// ── useModal — Escape + scroll lock ──────────────────────────
function useModal(initial = false) {
  const [open, setOpen] = useState(initial);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open]);

  // Scroll lock — preserves scroll position
  useEffect(() => {
    if (open) {
      const y = window.scrollY;
      document.body.style.cssText =
        \`overflow:hidden;position:fixed;top:-\${y}px;width:100%\`;
      return () => {
        const top = document.body.style.top;
        document.body.style.cssText = '';
        window.scrollTo(0, -parseInt(top || '0'));
      };
    }
  }, [open]);

  return {
    isOpen: open,
    open:   () => setOpen(true),
    close:  () => setOpen(false),
    toggle: () => setOpen(o => !o),
  };
}`,

  outside: `// ── Outside click — the e.target pattern ─────────────────────
// Overlay fills the viewport. Dialog sits inside it.
// A click on the dialog BUBBLES up but e.target stays as
// the dialog element — never equals the overlayRef.

function Modal({ onClose }) {
  const overlayRef = useRef(null);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        // Only close when the backdrop itself was clicked
        if (e.target === overlayRef.current) onClose();
      }}
      style={{ position:'fixed',inset:0,zIndex:9999,
               display:'flex',alignItems:'center',justifyContent:'center' }}
    >
      <div role="dialog" aria-modal="true">
        {/* Clicks here do NOT match overlayRef */}
        Modal content
      </div>
    </div>
  );
}

// ── ARIA checklist ────────────────────────────────────────────
// ✓ role="dialog"            marks region for screen readers
// ✓ aria-modal="true"        hides background content
// ✓ aria-labelledby="id"     points to the h2 heading
// ✓ aria-describedby="id"    points to description text
// ✓ tabIndex={-1} on dialog  allows programmatic focus`,
};

function CodeViewer({ code, filename }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ background:'#111',border:'1px solid #222',borderRadius:10,overflow:'hidden' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',
        padding:'7px 14px',background:'#1A1A1A',borderBottom:'1px solid #222' }}>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <div style={{ display:'flex',gap:4 }}>
            {['#FF5F57','#FEBC2E','#28C840'].map(c => <div key={c} style={{ width:9,height:9,borderRadius:'50%',background:c }} />)}
          </div>
          <span style={{ fontSize:10,color:'#555',fontFamily:'monospace' }}>{filename}</span>
        </div>
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          style={{ fontSize:10,fontWeight:700,padding:'2px 10px',borderRadius:5,
            border:`1px solid ${copied?'#3FB950':'#333'}`,
            background:copied?'#3FB95018':'transparent',
            color:copied?'#3FB950':'#555',cursor:'pointer',fontFamily:'inherit' }}>
          {copied?'✓ Copied':'Copy'}
        </button>
      </div>
      <pre style={{ margin:0,padding:'14px 18px',overflowX:'auto',fontSize:11,
        lineHeight:1.8,color:'#7DABC4',fontFamily:"'JetBrains Mono','Fira Code',monospace",whiteSpace:'pre' }}>
        {code}
      </pre>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────
export default function App() {
  const confirm    = useModal();
  const form       = useModal();
  const lightbox   = useModal();
  const drawer     = useModal();
  const wizard     = useModal();
  const nested     = useModal();
  const scrollable = useModal();

  const [confirmVariant, setConfirmVariant] = useState('delete');
  const [activeCode, setActiveCode] = useState(null);

  const DEMOS = [
    { group:'Confirm & Alert', accent:T.crimson, items:[
      { label:'Destructive confirm', icon:'🗑', fn:() => { setConfirmVariant('delete');  confirm.open(); } },
      { label:'Warning confirm',     icon:'⚠️', fn:() => { setConfirmVariant('leave');   confirm.open(); } },
      { label:'Positive confirm',    icon:'🚀', fn:() => { setConfirmVariant('publish'); confirm.open(); } },
    ]},
    { group:'Form & Content', accent:T.cobalt, items:[
      { label:'Form dialog',       icon:'✏️', fn:form.open       },
      { label:'Scrollable / ToS',  icon:'📄', fn:scrollable.open },
      { label:'Multi-step wizard', icon:'✨', fn:wizard.open     },
    ]},
    { group:'Special Patterns', accent:T.jade, items:[
      { label:'Image lightbox', icon:'🖼', fn:lightbox.open },
      { label:'Side drawer',    icon:'◫', fn:drawer.open   },
      { label:'Nested modals',  icon:'🪆', fn:nested.open   },
    ]},
  ];

  return (
    <div style={{ minHeight:'100vh',background:T.bg,color:T.ink,
      fontFamily:"'Instrument Sans','DM Sans',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:5px; background:${T.bg}; }
        ::-webkit-scrollbar-thumb { background:${T.borderHi}; border-radius:3px; }
        @keyframes md-spin { to { transform:rotate(360deg); } }
        @keyframes md-fade { from { opacity:0; } to { opacity:1; } }
        button,input,select,textarea { font-family:inherit; }
        button:focus-visible { outline:2px solid ${T.cobalt}; outline-offset:2px; }
        input:focus-visible,textarea:focus-visible { outline:none; }
      `}</style>

      <header style={{ background:T.surface,borderBottom:`1px solid ${T.border}`,
        padding:'0 28px',height:54,display:'flex',alignItems:'center',
        justifyContent:'space-between',position:'sticky',top:0,zIndex:100,
        boxShadow:'0 1px 0 rgba(28,25,23,.07)' }}>
        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          <div style={{ width:28,height:28,borderRadius:7,background:T.cobalt,
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:'#fff' }}>◻</div>
          <span style={{ fontSize:15,fontWeight:700,letterSpacing:'-0.02em' }}>
            Modal <span style={{ color:T.cobalt }}>Dialogs</span>
          </span>
          <span style={{ fontSize:11,color:T.inkMute,paddingLeft:4 }}>focus trap · Escape · outside click · ARIA</span>
        </div>
        <span style={{ fontSize:11,color:T.inkMute,padding:'3px 10px',
          border:`1px solid ${T.border}`,borderRadius:20 }}>7 variants · zero deps</span>
      </header>

      <main style={{ maxWidth:860,margin:'0 auto',padding:'28px 24px' }}>
        {/* Feature grid */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:28 }}>
          {[
            { icon:'⌨️',title:'Escape key',      color:T.cobalt,  desc:'Closes the topmost modal. Nested modals unwind one at a time.' },
            { icon:'🖱', title:'Outside click',   color:T.jade,    desc:'e.target === overlayRef — never fires on dialog children.' },
            { icon:'🔒',title:'Focus trap',       color:'#7C3AED', desc:'Tab/Shift+Tab cycles inside. Focus restored to trigger on close.' },
            { icon:'📜',title:'Scroll lock',      color:T.amber,   desc:'body position:fixed preserves exact scroll position on restore.' },
            { icon:'♿',title:'ARIA',             color:T.cobalt,  desc:'role=dialog, aria-modal, aria-labelledby, aria-describedby.' },
            { icon:'🌀',title:'Spring animation', color:T.jade,    desc:'cubic-bezier(.34,1.5,.64,1) — scale + translate, feels alive.' },
          ].map(f => (
            <div key={f.title} style={{ background:T.surface,border:`1px solid ${T.border}`,
              borderTop:`2px solid ${f.color}`,borderRadius:10,padding:'13px 14px' }}>
              <div style={{ fontSize:20,marginBottom:7 }}>{f.icon}</div>
              <div style={{ fontSize:12,fontWeight:700,color:T.ink,marginBottom:4 }}>{f.title}</div>
              <div style={{ fontSize:11,color:T.inkMute,lineHeight:1.55 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Demo groups */}
        {DEMOS.map(group => (
          <div key={group.group} style={{ background:T.surface,border:`1px solid ${T.border}`,
            borderRadius:12,padding:'14px 16px',marginBottom:12 }}>
            <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:12 }}>
              <div style={{ width:3,height:14,borderRadius:2,background:group.accent }} />
              <span style={{ fontSize:12,fontWeight:700,color:T.ink }}>{group.group}</span>
            </div>
            <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
              {group.items.map(item => (
                <button key={item.label} onClick={item.fn}
                  style={{ display:'flex',alignItems:'center',gap:7,fontSize:12,fontWeight:600,
                    padding:'8px 16px',borderRadius:9,border:`1px solid ${T.border}`,
                    background:T.bg,color:T.ink,cursor:'pointer',transition:'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=group.accent; e.currentTarget.style.background=group.accent+'0A'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.background=T.bg; }}>
                  <span>{item.icon}</span>{item.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Code reference */}
        <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:'14px 16px',marginBottom:12 }}>
          <div style={{ fontSize:12,fontWeight:700,color:T.ink,marginBottom:12 }}>Code Reference</div>
          <div style={{ display:'flex',gap:6,marginBottom:14 }}>
            {[['useFocusTrap','focustrap'],['useModal','usemodal'],['Outside click + ARIA','outside']].map(([l,k]) => (
              <button key={k} onClick={() => setActiveCode(activeCode===k?null:k)}
                style={{ fontSize:10,fontWeight:700,padding:'4px 12px',borderRadius:20,
                  border:`1px solid ${activeCode===k?T.cobalt:T.border}`,
                  background:activeCode===k?T.cobaltL:'transparent',
                  color:activeCode===k?T.cobalt:T.inkMute,cursor:'pointer' }}>
                {l}
              </button>
            ))}
          </div>
          {activeCode && (
            <CodeViewer code={SNIPPETS[activeCode]}
              filename={{ focustrap:'useFocusTrap.js', usemodal:'useModal.js', outside:'Modal.jsx' }[activeCode]} />
          )}
        </div>

        {/* Keyboard reference */}
        <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:'14px 16px' }}>
          <div style={{ fontSize:12,fontWeight:700,color:T.ink,marginBottom:10 }}>Keyboard Behaviour</div>
          <div style={{ display:'flex',flexDirection:'column',gap:7 }}>
            {[
              ['Escape',       'Close the topmost open modal'],
              ['Tab',          'Move focus forward — wraps from last to first'],
              ['Shift + Tab',  'Move focus backward — wraps from first to last'],
              ['Enter / Space','Activate the focused button'],
              ['← → arrows',  'Navigate images in lightbox'],
            ].map(([k,d]) => (
              <div key={k} style={{ display:'flex',alignItems:'center',gap:12 }}>
                <kbd style={{ fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:5,
                  background:T.raised,border:`1px solid ${T.borderHi}`,color:T.inkSub,
                  fontFamily:'monospace',whiteSpace:'nowrap',flexShrink:0 }}>{k}</kbd>
                <span style={{ fontSize:12,color:T.inkMute }}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <ConfirmModal    isOpen={confirm.isOpen}    onClose={confirm.close}    variant={confirmVariant} />
      <FormModal       isOpen={form.isOpen}       onClose={form.close} />
      <LightboxModal   isOpen={lightbox.isOpen}   onClose={lightbox.close} />
      <DrawerModal     isOpen={drawer.isOpen}     onClose={drawer.close} />
      <WizardModal     isOpen={wizard.isOpen}     onClose={wizard.close} />
      <NestedModal     isOpen={nested.isOpen}     onClose={nested.close} />
      <ScrollableModal isOpen={scrollable.isOpen} onClose={scrollable.close} />
    </div>
  );
}
