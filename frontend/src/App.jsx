import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  UploadCloud, FileText, Check, Clock, Calendar, RefreshCw,
  CheckCircle, AlertCircle, BarChart2, Compass, Cpu, Lock,
  Mail, TrendingUp, Star, ArrowRight, Layers, Target, Waves,
  Zap, Play, Pause, RotateCcw, X, Timer, Activity
} from 'lucide-react';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, ReferenceLine
} from 'recharts';
import './index.css';
import logo from '../logo_option.png';

const API_BASE_URL = 'http://localhost:8000/api';

/* ══════════════════════════════════════════════════
   AERIAL OCEAN VIEW — ondas vistas de cima
   ══════════════════════════════════════════════════ */
const wavePath = (baseY, amplitude, wavelength, phaseOffset = 0) => {
  const W = 1600;
  let d = `M ${-wavelength + phaseOffset} ${baseY}`;
  const cycles = Math.ceil(W / (wavelength / 2)) + 4;
  for (let i = 0; i < cycles; i++) {
    const x0 = -wavelength + phaseOffset + i * (wavelength / 2);
    const x1 = x0 + wavelength / 2;
    const sign = i % 2 === 0 ? -1 : 1;
    d += ` Q ${(x0 + x1) / 2} ${baseY + sign * amplitude}, ${x1} ${baseY}`;
  }
  return d;
};

const AerialOceanBG = () => {
  return null;
};

/* ── Logo ─────────────────────────────────────────────────── */
const VibeVectorLogo = () => (
  <img src={logo} alt="Concurseiro Logo" style={{ height: '56px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
);

const VibeVectorLogoHero = () => (
  <img src={logo} alt="Concurseiro Logo" style={{ height: '240px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }} />
);

/* ── Tooltips ────────────────────────────────────────────── */
function ScatterTooltip({ active, payload }) {
  if (active && payload?.length) {
    const data = payload[0].payload;
    return (
      <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-white)', border: '1px solid var(--blue-primary)', color: 'var(--blue-primary)', borderRadius: '10px', backdropFilter: 'blur(16px)' }}>
        <p style={{ color: 'var(--blue-primary)', fontWeight: 700, marginBottom: '0.2rem' }}>{data.name}</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{data.total_hours}h restantes</p>
      </div>
    );
  }
  return null;
}

function RadarTooltip({ active, payload }) {
  if (active && payload?.length) {
    return (
      <div style={{ padding: '0.65rem 0.9rem', background: 'var(--bg-white)', border: '1px solid rgba(0, 74, 173, 0.05)', borderRadius: '10px' }}>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: '0.8rem', margin: '2px 0' }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

/* ── Skeleton loader ─────────────────────────────────────── */
const Skeleton = ({ width = '100%', height = 20, radius = 8, style = {} }) => (
  <div style={{
    width, height, borderRadius: radius,
    background: 'linear-gradient(90deg, rgba(0, 74, 173, 0.1) 0%, rgba(0, 74, 173, 0.12) 50%, rgba(0, 74, 173, 0.1) 100%)',
    backgroundSize: '200% 100%',
    animation: 'skeletonPulse 1.5s ease-in-out infinite',
    ...style,
  }} />
);

/* ── MOCK DATA ───────────────────────────────────────────── */
const MOCK_DASHBOARD_DATA = {
  total_estimated_hours: 120,
  daily_hours: 4,
  total_days: 30,
  start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  knowledge_areas: [
    { name: 'Dir. Constitucional', shortName: 'D. Const.', description: 'Princípios, direitos e garantias essenciais, além de organização do estado.', total_hours: 20, complexity: 4, incidence: 5 },
    { name: 'Dir. Administrativo', shortName: 'D. Admin.', description: 'Atos, poderes, administração pública e a nova lei de licitações.', total_hours: 25, complexity: 5, incidence: 5 },
    { name: 'Língua Portuguesa',   shortName: 'Português', description: 'Interpretação profunda de textos e forte domínio de análise sintática.', total_hours: 30, complexity: 3, incidence: 4 },
    { name: 'Raciocínio Lógico',   shortName: 'R. Lógico', description: 'Lógica proposicional, análises combinatórias e probabilidade estatística.', total_hours: 15, complexity: 4, incidence: 3 },
    { name: 'Informática',         shortName: 'TI',        description: 'Redes, segurança, conceitos de internet e banco de dados corporativo.', total_hours: 10, complexity: 2, incidence: 3 },
    { name: 'Legislação Específica', shortName: 'Legislação', description: 'Regimentos estaduais, lei orgânica, direitos das autarquias locais.', total_hours: 20, complexity: 3, incidence: 4 },
  ],
  recommended_courses: [
    { title: 'Série Pro: Carreiras Jurídicas', platform: 'Estratégia Concursos', description: 'Material denso de jurisprudência com simulados focados na banca.' },
    { title: 'Assinatura Ilimitada Plus',      platform: 'Gran Cursos',          description: 'Centenas de videoaulas com professores especialistas por carreira.' },
    { title: 'Projeto Focus',                  platform: 'Direção Concursos',    description: 'PDFs diretos e mapas mentais ágeis sem poluição de conteúdo.' },
    { title: 'Plataforma Ilimitada de Questões', platform: 'QConcursos',         description: 'Banco dinâmico com milhões de questões filtradas pelo seu edital.' },
  ],
  daily_plan: [
    { day: 1,  tasks: [{ id:'1',  title:'Constituição Org.',          duration:2,   area:'Direito Constitucional' }, { id:'2',  title:'Ortografia',                   duration:2,   area:'Língua Portuguesa' }] },
    { day: 2,  tasks: [{ id:'3',  title:'Atos Administrativos',       duration:1.5, area:'Direito Administrativo' }, { id:'4',  title:'Windows/Linux',               duration:1,   area:'Informática Básica' }, { id:'5', title:'Lógica', duration:1.5, area:'Raciocínio Lógico Matemático' }] },
    { day: 3,  tasks: [{ id:'6',  title:'Licitações Lei',             duration:3,   area:'Direito Administrativo' }, { id:'7',  title:'Excel Avançado',              duration:1,   area:'Informática Básica' }] },
    { day: 4,  tasks: [{ id:'8',  title:'Sintaxe da Língua',          duration:2,   area:'Língua Portuguesa' },      { id:'9',  title:'Licitações (Aprofundamento)', duration:2,   area:'Direito Administrativo' }] },
    { day: 5,  tasks: [{ id:'10', title:'Regimes da Serventia',       duration:2.5, area:'Legislação Específica' },  { id:'11', title:'Concordância Verbal',         duration:1.5, area:'Língua Portuguesa' }] },
    { day: 6,  tasks: [{ id:'12', title:'Segurança de TI',            duration:2,   area:'Informática Básica' },     { id:'13', title:'Probabilidade Matemática',    duration:2,   area:'Raciocínio Lógico Matemático' }] },
    { day: 7,  tasks: [{ id:'14', title:'Simulado Geral e Revisão',   duration:4,   area:'Língua Portuguesa' }] },
    { day: 8,  tasks: [{ id:'15', title:'Garantias Constitucionais',  duration:2,   area:'Direito Constitucional' }, { id:'16', title:'Improbidade Administrativa',  duration:2,   area:'Direito Administrativo' }] },
    { day: 9,  tasks: [{ id:'17', title:'Redação e Tese',             duration:2,   area:'Língua Portuguesa' },      { id:'18', title:'Estatística Pura',            duration:2,   area:'Raciocínio Lógico Matemático' }] },
    { day: 10, tasks: [{ id:'19', title:'Direitos Políticos',         duration:1.5, area:'Direito Constitucional' }, { id:'20', title:'Bancos de Dados',             duration:1.5, area:'Informática Básica' }, { id:'21', title:'Poder Executivo', duration:1, area:'Direito Administrativo' }] },
  ],
};

/* ── Paletas e constantes ────────────────────────────────── */
const OCEAN_PALETTE = ['#004AAD', '#FF7000', '#FFBD00', '#0A192f', '#475569'];
const DAY_COLORS = ['#004AAD', '#FF7000', '#FFBD00', '#004AAD'];

/* ── Variantes framer-motion ───────────────────────────── */
const pageIn  = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } }, exit: { opacity: 0, y: -12, transition: { duration: 0.25 } } };
const fadeUp  = { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

/* ── Estilos compartilhados ─────────────────────────────── */
const inputStyle = { width: '100%', padding: '0.85rem 1.15rem', borderRadius: '16px', background: 'var(--bg-white)', border: '1.5px solid rgba(0, 74, 173, 0.12)', color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease' };
const labelStyle = { display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' };

/* ══════════════════════════════════════════════════
   HEATMAP — Estilo GitHub
   ══════════════════════════════════════════════════ */
function ConsistencyHeatmap({ completedDates }) {
  const WEEKS = 20;
  const containerRef = useRef(null);
  const [cellSize, setCellSize] = useState(14);

  // Sempre que o container redimensionar, recalcula o tamanho das células
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const calc = () => {
      const gap = 3;
      const w = el.clientWidth;
      const size = Math.min(11, Math.max(8, Math.floor((w - (WEEKS - 1) * gap) / WEEKS)));
      setCellSize(size);
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const today = new Date();
  const cells = [];
  for (let w = WEEKS - 1; w >= 0; w--) {
    const week = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - (w * 7 + d));
      const key = date.toISOString().split('T')[0];
      const count = completedDates[key] || 0;
      week.push({ date: key, count, label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) });
    }
    cells.push(week);
  }

  // Label dos meses (exibe o nome do mês na primeira semana de cada mês)
  const monthLabels = cells.map((week, wi) => {
    const first = new Date(week[0].date);
    const prev  = wi > 0 ? new Date(cells[wi - 1][0].date) : null;
    if (!prev || first.getMonth() !== prev.getMonth()) {
      return first.toLocaleDateString('pt-BR', { month: 'short' });
    }
    return '';
  });

  const getColor = (count) => {
    if (count === 0) return 'rgba(10, 25, 47, 0.1)';
    if (count === 1) return 'rgba(10, 25, 47, 0.1)';
    if (count === 2) return 'rgba(10, 25, 47, 0.1)';
    if (count === 3) return 'rgba(255, 107, 0, 0.1)';
    return 'var(--orange-alert)';
  };

  const gap = 3;

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {/* Rótulos de mês */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${WEEKS}, 1fr)`,
        gap: `0 ${gap}px`,
        marginBottom: '4px',
      }}>
        {monthLabels.map((label, wi) => (
          <div key={wi} style={{ fontSize: '0.62rem', color: 'var(--blue-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'clip' }}>
            {label}
          </div>
        ))}
      </div>

      {/* Grid de células — 7 linhas (dias) × WEEKS colunas (semanas) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${WEEKS}, 1fr)`,
        gridTemplateRows:    `repeat(7, ${cellSize}px)`,
        gap: `${gap}px`,
        width: '100%',
      }}>
        {/* Percorremos por dia-da-semana (linha) depois por semana (coluna) */}
        {Array.from({ length: 7 }, (_, d) =>
          cells.map((week, wi) => {
            const cell = week[d];
            return (
              <div
                key={`${wi}-${d}`}
                title={`${cell.label}: ${cell.count} tarefa(s)`}
                style={{
                  borderRadius: Math.max(2, cellSize * 0.22) + 'px',
                  background: getColor(cell.count),
                  border: cell.count > 0
                    ? '1px solid rgba(0, 74, 173, 0.1)'
                    : '1px solid rgba(0, 74, 173, 0.1)',
                  cursor: 'default',
                  transition: 'transform 0.12s ease, filter 0.12s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.35)';
                  e.currentTarget.style.filter = 'brightness(1.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.filter = 'none';
                }}
              />
            );
          })
        )}
      </div>

      {/* Legenda */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.8rem' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Menos</span>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{ width: cellSize * 0.85, height: cellSize * 0.85, borderRadius: '2px', background: getColor(i), flexShrink: 0 }} />
        ))}
        <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Mais</span>
      </div>
    </div>
  );

}

/* ══════════════════════════════════════════════════
   MODO FOCO — Pomodoro Oceânico
   ══════════════════════════════════════════════════ */
function OceanFocusMode({ task, onClose, onComplete }) {
  const WORK = 25 * 60;
  const [seconds, setSeconds] = useState(WORK);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState('focus'); // 'focus' | 'break'
  const ivRef = useRef(null);

  useEffect(() => {
    if (running) {
      ivRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(ivRef.current);
            setRunning(false);
            if (phase === 'focus') {
              setPhase('break');
              setSeconds(5 * 60);
            } else {
              setPhase('focus');
              setSeconds(WORK);
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(ivRef.current);
  }, [running, phase]);

  const reset = () => { clearInterval(ivRef.current); setRunning(false); setSeconds(WORK); setPhase('focus'); };
  const pad = n => String(n).padStart(2, '0');
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const total = phase === 'focus' ? WORK : 5 * 60;
  const pct = (seconds / total) * 100;
  const circumference = 2 * Math.PI * 90;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Fundo de ondas mais lento no modo foco */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
        <AerialOceanBG />
      </div>

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '480px', padding: '2rem' }}>
        {/* Fechar */}
        <button onClick={onClose} style={{ position: 'absolute', top: '-2rem', right: 0, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={22} />
        </button>

        {/* Badge de fase */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.3rem 0.9rem', borderRadius: '100px', marginBottom: '1.5rem',
          background: phase === 'focus' ? 'rgba(10, 25, 47, 0.1)' : 'rgba(255, 107, 0, 0.1)',
          border: `1px solid ${phase === 'focus' ? 'rgba(10, 25, 47, 0.1)' : 'rgba(255, 107, 0, 0.1)'}`,
          color: phase === 'focus' ? 'var(--blue-primary)' : 'var(--orange-alert)',
          fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
        }}>
          <Waves size={12} />
          {phase === 'focus' ? 'Foco Profundo' : 'Pausa — Respire'}
        </div>

        {/* Timer circular SVG */}
        <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto 2rem' }}>
          <svg width="220" height="220" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(0, 74, 173, 0.1)" strokeWidth="8" />
            <circle cx="110" cy="110" r="90" fill="none"
              stroke={phase === 'focus' ? 'var(--blue-primary)' : 'var(--orange-alert)'}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 10px ${phase === 'focus' ? 'var(--blue-primary)' : 'var(--orange-alert)'})` }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--blue-primary)', letterSpacing: '-2px', lineHeight: 1 }}>
              {pad(mins)}:{pad(secs)}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.3rem' }}>
              {phase === 'focus' ? 'concentração' : 'relaxamento'}
            </span>
          </div>
        </div>

        {/* Tarefa atual */}
        {task && (
          <div style={{ background: 'var(--bg-white)', border: '1px solid rgba(0, 74, 173, 0.1)', borderRadius: '12px', padding: '0.85rem 1.25rem', marginBottom: '1.75rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.2rem' }}>Tarefa em foco</p>
            <p style={{ color: 'var(--blue-primary)', fontWeight: 600 }}>{task.title}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>~{task.duration}h estimadas</p>
          </div>
        )}

        {/* Controles */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
          <button onClick={reset} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.7rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <RotateCcw size={18} />
          </button>
          <button onClick={() => setRunning(r => !r)}
            style={{
              background: running
                ? 'linear-gradient(135deg, #0a5e7a, #00c2e8)'
                : 'linear-gradient(135deg, #0077aa, #00d4ff)',
              border: 'none', borderRadius: '50%', width: '64px', height: '64px',
              cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(0, 74, 173, 0.1)',
            }}>
            {running ? <Pause size={24} /> : <Play size={24} />}
          </button>
          {task && (
            <button onClick={onComplete}
              style={{ background: 'rgba(255, 107, 0, 0.1)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: '10px', padding: '0.7rem 1.1rem', cursor: 'pointer', color: 'var(--blue-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600 }}>
              <Check size={16} /> Concluir
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Section Heading ─────────────────────────────────────── */
function OceanSectionHeading({ icon, bg, title, sub }) {
  return (
    <div style={{ marginBottom: '1.6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '14px', background: `linear-gradient(135deg, ${bg}, ${bg}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${bg}40` }}>
          {icon}
        </div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--blue-primary)', margin: 0, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.3px' }}>{title}</h2>
      </div>
      {sub && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', paddingLeft: '52px' }}>{sub}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   APP
   ══════════════════════════════════════════════════ */
function App() {
  // Suprime o warning do Recharts sobre width=-1 no primeiro render
  useEffect(() => {
    const orig = console.warn;
    console.warn = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('width(-1)')) return;
      orig(...args);
    };
    return () => { console.warn = orig; };
  }, []);

  const [appState, setAppState]           = useState('landing');
  const [file, setFile]                   = useState(null);
  const [hours, setHours]                 = useState(3);
  const [testDate, setTestDate]           = useState('');
  const [taskId, setTaskId]               = useState('');
  const [progress, setProgress]           = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [completionDates, setCompletionDates] = useState(() => {
    // Simula histórico dos últimos dias para o heatmap
    const dates = {};
    const today = new Date();
    [1, 2, 3, 4, 5, 8, 9, 12, 15, 16, 18, 22, 23].forEach(daysAgo => {
      const d = new Date(today); d.setDate(today.getDate() - daysAgo);
      const key = d.toISOString().split('T')[0];
      dates[key] = Math.floor(Math.random() * 4) + 1;
    });
    return dates;
  });
  const [isReplanning, setIsReplanning]   = useState(false);
  const [showCompletedDays, setShowCompletedDays] = useState(false);
  const [focusMode, setFocusMode]         = useState({ active: false, task: null });

  /* ── Demo / handlers ────────────────────────────────────── */
  const handleLoadDemo = () => { setDashboardData(MOCK_DASHBOARD_DATA); setAppState('dashboard'); };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) f.type === 'application/pdf' ? setFile(f) : alert('Envie um arquivo PDF do seu edital.');
  };
  const handleFileChange = (e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); };

  const handleUpload = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file); fd.append('hours_per_day', hours);
    if (testDate) fd.append('test_date', testDate);
    try {
      setAppState('processing'); setStatusMessage('Enviando edital...'); setProgress(5);
      const res = await axios.post(`${API_BASE_URL}/upload`, fd);
      setTaskId(res.data.task_id);
    } catch { alert('Erro ao enviar o edital.'); setAppState('upload'); }
  };

  useEffect(() => {
    let iv;
    if (appState === 'processing' && taskId) {
      iv = setInterval(async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/status/${taskId}`);
          setProgress(res.data.progress || 0);
          if (res.data.progress < 30) setStatusMessage('Mergulhando no edital...');
          else if (res.data.progress < 70) setStatusMessage('Agentes mapeando as correntes de conhecimento...');
          else setStatusMessage('Montando sua rota de navegação...');
          if (res.data.status === 'completed') {
            clearInterval(iv); setDashboardData(res.data.result);
            setTimeout(() => setAppState('dashboard'), 800);
          } else if (res.data.status === 'error') {
            clearInterval(iv); setStatusMessage('Erro: ' + res.data.message);
          }
        } catch {}
      }, 1000);
    }
    return () => clearInterval(iv);
  }, [appState, taskId]);

  /* ── Toggle tarefa com confetti ─────────────────────────── */
  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['var(--blue-primary)', 'var(--orange-alert)', 'var(--blue-primary)', '#F59E0B', 'var(--orange-alert)'],
      scalar: 0.85,
    });
  }, []);

  const toggleTask = useCallback((id) => {
    const s = new Set(completedTasks);
    if (!s.has(id)) {
      s.add(id);
      triggerConfetti();
      const today = new Date().toISOString().split('T')[0];
      setCompletionDates(prev => ({ ...prev, [today]: (prev[today] || 0) + 1 }));
    } else {
      s.delete(id);
    }
    setCompletedTasks(s);
  }, [completedTasks, triggerConfetti]);

  /* ── Foco concluir ──────────────────────────────────────── */
  const handleFocusComplete = () => {
    if (focusMode.task) { toggleTask(focusMode.task.id); }
    setFocusMode({ active: false, task: null });
  };

  const getProgress = () => {
    if (!dashboardData) return 0;
    const total = dashboardData.daily_plan.reduce((a, d) => a + d.tasks.length, 0);
    return total === 0 ? 0 : Math.round((completedTasks.size / total) * 100);
  };

  const handleReplan = async () => {
    setIsReplanning(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/replan`, {
        missed_tasks: [], remaining_days: dashboardData.total_days,
        hours_per_day: hours, current_plan: dashboardData.daily_plan,
      });
      alert(res.data.message);
    } catch {}
    setIsReplanning(false);
  };

  /* ── Dados derivados para gráficos ─────────────────────── */
  const getRadarData = () => {
    if (!dashboardData) return [];
    return dashboardData.knowledge_areas.map(ka => ({
      subject: ka.shortName || ka.name.split(' ')[0],
      Volume: Math.round((ka.total_hours / 30) * 10),
      Complexidade: (ka.complexity || 3) * 2,
    }));
  };

  const getBurnUpData = () => {
    if (!dashboardData) return [];
    const total = dashboardData.daily_plan.reduce((acc, d) => acc + d.tasks.length, 0);
    const days = dashboardData.total_days;
    const data = [];
    let real = completedTasks.size;
    for (let i = 0; i <= Math.min(days, 14); i++) {
      data.push({
        dia: `D${i + 1}`,
        Ideal: Math.round((total / days) * (i + 1)),
        Real: i <= 5 ? Math.min(Math.round(real * ((i + 1) / 5)), real) : undefined,
      });
    }
    return data;
  };

  /* ─────────────────────────────────────────────── */
  return (
    <>
      {/* ── Focus Mode Overlay ───────────────────── */}
      <AnimatePresence>
        {focusMode.active && (
          <OceanFocusMode
            task={focusMode.task}
            onClose={() => setFocusMode({ active: false, task: null })}
            onComplete={handleFocusComplete}
          />
        )}
      </AnimatePresence>

      {/* ── Background Orgânico — movido para dentro do main ────────── */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '55vw', height: '55vw', maxHeight: '600px', maxWidth: '600px', background: 'rgba(0, 74, 173, 0.07)', borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%', animation: 'blobM1 20s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', top: '-5%', right: '-8%', width: '45vw', height: '45vw', maxHeight: '500px', maxWidth: '500px', background: 'rgba(255, 112, 0, 0.06)', borderRadius: '45% 55% 50% 50% / 55% 45% 55% 45%', animation: 'blobM2 24s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', top: '35%', right: '-5%', width: '35vw', height: '35vw', maxHeight: '400px', maxWidth: '400px', background: 'rgba(255, 189, 0, 0.06)', borderRadius: '50% 50% 45% 55% / 40% 60% 50% 50%', animation: 'blobM3 22s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '50vw', height: '50vw', maxHeight: '550px', maxWidth: '550px', background: 'rgba(0, 74, 173, 0.06)', borderRadius: '55% 45% 60% 40% / 45% 55% 45% 55%', animation: 'blobM4 26s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', bottom: '-8%', right: '-6%', width: '42vw', height: '42vw', maxHeight: '480px', maxWidth: '480px', background: 'rgba(255, 112, 0, 0.06)', borderRadius: '40% 60% 55% 45% / 50% 50% 45% 55%', animation: 'blobM1 28s ease-in-out infinite alternate-reverse' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '20%', width: '30vw', height: '30vw', maxHeight: '350px', maxWidth: '350px', background: 'rgba(255, 189, 0, 0.05)', borderRadius: '50% 50% 40% 60% / 55% 45% 55% 45%', animation: 'blobM2 18s ease-in-out infinite alternate' }} />
      </div>
      <style>{`
        @keyframes blobM1 { 0% { transform: translate(0, 0) rotate(0deg); } 100% { transform: translate(30px, 40px) rotate(8deg); } }
        @keyframes blobM2 { 0% { transform: translate(0, 0) rotate(0deg); } 100% { transform: translate(-35px, -30px) rotate(-6deg); } }
        @keyframes blobM3 { 0% { transform: translate(0, 0) rotate(0deg); } 100% { transform: translate(20px, -35px) rotate(5deg); } }
        @keyframes blobM4 { 0% { transform: translate(0, 0) rotate(0deg); } 100% { transform: translate(-40px, 20px) rotate(-4deg); } }
      `}</style>

      {/* ── Navbar ───────────────────────────────── */}
      <header className="top-bar">
        <button onClick={() => setAppState('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <VibeVectorLogo />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {appState === 'dashboard' && (
            <>
              {/* Botão Modo Foco */}
              <button onClick={() => setFocusMode({ active: true, task: null })}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', borderRadius: '8px', background: 'rgba(10, 25, 47, 0.05)', border: '1px solid rgba(0, 74, 173, 0.05)', color: 'var(--blue-primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                <Timer size={14} /> Modo Foco
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600 }}>PROGRESSO</span>
                <div className="progress-circle" style={{ '--p': `${getProgress()}%` }}>
                  <span>{getProgress()}%</span>
                </div>
              </div>
            </>
          )}
          {appState !== 'dashboard' && (
            <button className="btn"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.82rem', background: 'var(--bg-white)', border: '1px solid var(--blue-primary)', color: 'var(--blue-primary)', boxShadow: 'none' }}
              onClick={() => setAppState('login')}>
              Entrar
            </button>
          )}
        </div>
      </header>

      {/* ── Skeleton CSS inline ──────────────────── */}
      <style>{`
        @keyframes skeletonPulse {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes oceanGradientMove {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* ── Main ─────────────────────────────────── */}
      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 1.5rem 6rem', width: '100%', position: 'relative', zIndex: 1 }}>

        {/* Formas orgânicas de fundo */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100vw', maxWidth: '1400px', height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: -1 }}>
          <div style={{ position: 'absolute', width: '600px', height: '600px', top: '-150px', left: '-150px', background: 'radial-gradient(ellipse, rgba(0,74,173,0.10) 0%, transparent 70%)', borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%', animation: 'blobMove1 22s ease-in-out infinite alternate' }} />
          <div style={{ position: 'absolute', width: '450px', height: '450px', top: '-50px', right: '-100px', background: 'radial-gradient(ellipse, rgba(255,112,0,0.09) 0%, transparent 70%)', borderRadius: '45% 55% 50% 50% / 55% 45% 55% 45%', animation: 'blobMove2 26s ease-in-out infinite alternate' }} />
          <div style={{ position: 'absolute', width: '350px', height: '350px', top: '35%', right: '-60px', background: 'radial-gradient(ellipse, rgba(255,189,0,0.08) 0%, transparent 70%)', borderRadius: '50% 50% 45% 55% / 40% 60% 50% 50%', animation: 'blobMove3 20s ease-in-out infinite alternate' }} />
          <div style={{ position: 'absolute', width: '500px', height: '500px', bottom: '-120px', left: '-80px', background: 'radial-gradient(ellipse, rgba(0,74,173,0.08) 0%, transparent 70%)', borderRadius: '55% 45% 60% 40% / 45% 55% 45% 55%', animation: 'blobMove4 28s ease-in-out infinite alternate' }} />
          <div style={{ position: 'absolute', width: '400px', height: '400px', bottom: '-100px', right: '-80px', background: 'radial-gradient(ellipse, rgba(255,112,0,0.08) 0%, transparent 70%)', borderRadius: '40% 60% 55% 45% / 50% 50% 45% 55%', animation: 'blobMove1 24s ease-in-out infinite alternate-reverse' }} />
          <div style={{ position: 'absolute', width: '300px', height: '300px', bottom: '10%', left: '25%', background: 'radial-gradient(ellipse, rgba(255,189,0,0.07) 0%, transparent 70%)', borderRadius: '50% 50% 40% 60% / 55% 45% 55% 45%', animation: 'blobMove2 18s ease-in-out infinite alternate' }} />
        </div>

        <style>{`
          @keyframes blobMove1 { 0% { transform: translate(0, 0) scale(1) rotate(0deg); } 100% { transform: translate(40px, 50px) scale(1.08) rotate(6deg); } }
          @keyframes blobMove2 { 0% { transform: translate(0, 0) scale(1) rotate(0deg); } 100% { transform: translate(-40px, -35px) scale(1.1) rotate(-5deg); } }
          @keyframes blobMove3 { 0% { transform: translate(0, 0) scale(1) rotate(0deg); } 100% { transform: translate(25px, -45px) scale(1.06) rotate(4deg); } }
          @keyframes blobMove4 { 0% { transform: translate(0, 0) scale(1) rotate(0deg); } 100% { transform: translate(-50px, 25px) scale(1.1) rotate(-3deg); } }
        `}</style>

        <AnimatePresence mode="wait">

          {/* ════ LANDING ═══════════════════════════ */}
          {appState === 'landing' && (
            <motion.div key="landing" variants={pageIn} initial="initial" animate="animate" exit="exit">
              <section style={{ textAlign: 'center', paddingTop: '5.5rem', paddingBottom: '6rem', position: 'relative' }}>

                <motion.div variants={fadeUp} initial="initial" animate="animate" style={{ marginBottom: '2rem' }}>
                  <VibeVectorLogoHero />
                </motion.div>

                <motion.h1 className="hero-title" variants={fadeUp} initial="initial" animate="animate" style={{ marginBottom: '1.5rem', color: 'var(--blue-primary)', textTransform: 'uppercase' }}>
                  PLANEJE. <br/>
                  <span style={{ color: 'var(--orange-alert)' }}>
                    ESTUDE. CONQUISTE.
                  </span>
                </motion.h1>

                <motion.p variants={fadeUp} initial="initial" animate="animate"
                  style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto 3rem', lineHeight: 1.75 }}>
                  Faça upload do PDF do seu edital e receba em minutos um cronograma inteligente — como uma correnteza que te leva direto à aprovação.
                </motion.p>

                <motion.div className="hero-buttons" variants={fadeUp} initial="initial" animate="animate"
                  style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button id="cta-start" className="btn" style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem' }} onClick={() => setAppState('login')}>
                    Conquiste sua vaga <ArrowRight size={18} />
                  </button>
                  <button id="cta-demo" className="btn"
                    style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem', background: 'transparent', border: '2px solid var(--blue-primary)', color: 'var(--blue-primary)', boxShadow: 'none' }}
                    onClick={handleLoadDemo}>
                    Ver demo grátis
                  </button>
                </motion.div>

                <motion.div variants={fadeUp} initial="initial" animate="animate"
                  style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center', marginTop: '3.5rem', flexWrap: 'wrap' }}>
                  {[{ value: '+3.400', label: 'Concurseiros' }, { value: '94%', label: 'Taxa de progresso' }, { value: '< 3min', label: 'Para gerar o plano' }].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--blue-primary)', lineHeight: 1 }}>{s.value}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{s.label}</p>
                    </div>
                  ))}
                </motion.div>
              </section>

              <div style={{ textAlign: 'center', margin: '0 0 4rem', opacity: 0.15 }}>
                <svg viewBox="0 0 800 40" style={{ width: '100%', maxWidth: '600px' }} fill="none">
                  <path d="M0,20 C100,40 200,0 300,20 C400,40 500,0 600,20 C700,40 800,10 800,20" stroke="var(--blue-primary)" strokeWidth="2" fill="none" />
                </svg>
              </div>

              <section style={{ marginBottom: '6rem', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '1040px', display: 'flex', flexDirection: 'column' }}>
                  <p style={{ textAlign: 'center', color: 'var(--orange-alert)', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '3rem' }}>O caminho mais fluido para a aprovação</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>

                    {/* Quadrante 1 - Branco */}
                    <motion.div className="glass-card" variants={fadeUp} initial="initial" animate="animate"
                      style={{ padding: '2rem', position: 'relative', overflow: 'hidden', borderTop: '3px solid var(--blue-primary)' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                        <Target size={24} color="var(--blue-primary)" />
                      </div>
                      <h3 style={{ color: 'var(--blue-primary)', fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.6rem' }}>Mapeamento Inteligente</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>Nossa IA decodifica o padrão da sua banca (Cespe, FCC, FGV) e desenha uma rota orgânica baseada na sua forma de aprender.</p>
                    </motion.div>

                    {/* Quadrante 2 - Laranja */}
                    <motion.div className="glass-card" variants={fadeUp} initial="initial" animate="animate"
                      style={{ padding: '2rem', position: 'relative', overflow: 'hidden', borderTop: '3px solid var(--orange-alert)' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--orange-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                        <Layers size={24} color="var(--orange-alert)" />
                      </div>
                      <h3 style={{ color: 'var(--blue-primary)', fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.6rem' }}>Curadoria Fluida</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>Aulas exatas e pílulas de conhecimento entregues no seu ritmo, eliminando atrito e desperdício de energia com materiais densos.</p>
                    </motion.div>

                    {/* Quadrante 3 - Amarelo */}
                    <motion.div className="glass-card" variants={fadeUp} initial="initial" animate="animate"
                      style={{ padding: '2rem', position: 'relative', overflow: 'hidden', borderTop: '3px solid var(--yellow-alert)' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--yellow-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                        <Waves size={24} color="var(--yellow-alert)" />
                      </div>
                      <h3 style={{ color: 'var(--blue-primary)', fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.6rem' }}>Ecossistema Vivo</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>Conforme você avança, o algoritmo ajusta intensidades. Um plano de estudos que respira, flexiona e cresce naturalmente com você.</p>
                    </motion.div>

                    {/* Quadrante 4 - Azul Escuro */}
                    <motion.div className="glass-card" variants={fadeUp} initial="initial" animate="animate"
                      style={{ padding: '2rem', position: 'relative', overflow: 'hidden', borderTop: '3px solid var(--blue-light)' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(0, 74, 173, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                        <Activity size={24} color="var(--blue-light)" />
                      </div>
                      <h3 style={{ color: 'var(--blue-primary)', fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.6rem' }}>Visão Clara</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>Dashboards precisos apontam o seu progresso diário como um mapa de calor, garantindo a sua curva crescente sem estresse.</p>
                    </motion.div>

                  </div>
                </div>
              </section>

              <section style={{ marginBottom: '4rem' }}>
                <h2 style={{ textAlign: 'center', fontSize: '1.55rem', fontWeight: 700, color: 'var(--blue-primary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Quem planejou, conquistou.</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2.25rem', fontSize: '0.88rem' }}>Histórias reais de quem usou o Concurseiro.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                  {[
                    { quote: '"Reduziu minha ansiedade ao zero. Ver o TSE Unificado quebrado em cartões diários fez eu finalmente parar de procrastinar."', author: 'Marcos T.', role: 'Aprovado — Analista Judiciário', initial: 'M', color: 'var(--blue-primary)' },
                    { quote: '"Tentava fechar a Receita Federal na força bruta. Com o Concurseiro recalibrando meu ciclo, ganhei horas de folga no fim de semana."', author: 'Carolina S.', role: 'Aprovada — Auditora Fiscal', initial: 'C', color: 'var(--blue-primary)' },
                  ].map((t, i) => (
                    <motion.div key={i} variants={fadeUp} initial="initial" animate="animate" className="glass-card" style={{ padding: '1.75rem' }}>
                      <div style={{ display: 'flex', gap: '2px', marginBottom: '0.9rem' }}>
                        {[...Array(5)].map((_, s) => <Star key={s} size={13} fill="#F59E0B" color="#F59E0B" />)}
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.75, fontStyle: 'italic', marginBottom: '1.4rem' }}>{t.quote}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: `${t.color}15`, border: `1px solid ${t.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: t.color, fontSize: '0.85rem' }}>{t.initial}</div>
                        <div>
                          <p style={{ color: 'var(--blue-primary)', fontWeight: 600, fontSize: '0.88rem', margin: 0 }}>{t.author}</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.76rem', margin: 0 }}>{t.role}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {/* ════ LOGIN ══════════════════════════════ */}
          {appState === 'login' && (
            <motion.div key="login" variants={pageIn} initial="initial" animate="animate" exit="exit"
              style={{ display: 'flex', justifyContent: 'center', paddingTop: '5rem' }}>
              <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <VibeVectorLogo />
                  <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--blue-primary)', margin: '0.9rem 0 0.2rem' }}>Mergulhe de volta</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Entre para navegar pelo seu cronograma.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div><label style={labelStyle}><Mail size={11} style={{ display: 'inline', marginRight: '4px' }} />E-mail</label>
                    <input id="login-email" type="email" placeholder="nome@exemplo.com" style={inputStyle} /></div>
                  <div><label style={labelStyle}><Lock size={11} style={{ display: 'inline', marginRight: '4px' }} />Senha</label>
                    <input id="login-password" type="password" placeholder="••••••••" style={inputStyle} /></div>
                  <button id="login-submit" className="btn" style={{ width: '100%', padding: '0.9rem', marginTop: '0.5rem' }} onClick={() => setAppState('upload')}>
                    Entrar na plataforma <ArrowRight size={16} />
                  </button>
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    Sem conta?{' '}
                    <span style={{ color: 'var(--blue-primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setAppState('upload')}>Criar gratuitamente</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ════ UPLOAD ═════════════════════════════ */}
          {appState === 'upload' && (
            <motion.div key="upload" variants={pageIn} initial="initial" animate="animate" exit="exit"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '3.5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
                <span className="feature-badge" style={{ marginBottom: '1.1rem', display: 'inline-flex' }}><UploadCloud size={13} /> Upload do Edital</span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--blue-primary)', marginTop: '1rem', marginBottom: '0.4rem', letterSpacing: '-0.5px' }}>Ancore seu edital aqui</h2>
                <p style={{ color: 'var(--text-muted)', maxWidth: '480px', fontSize: '0.9rem', lineHeight: 1.7 }}>Deixe a correnteza de IA trabalhar — em minutos seu plano de estudos estará pronto.</p>
              </div>
              <div className="glass-card" style={{ width: '100%', maxWidth: '660px', padding: '2rem' }}>
                <div className="file-drop-area" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
                  style={{ marginBottom: '1.5rem', background: file ? 'rgba(255, 107, 0, 0.1)' : undefined, borderColor: file ? 'rgba(255, 107, 0, 0.1)' : undefined }}>
                  {!file ? (
                    <>
                      <div style={{ marginBottom: '0.75rem' }}><UploadCloud size={38} color="var(--blue-primary)" style={{ opacity: 0.75 }} /></div>
                      <p style={{ color: 'var(--blue-primary)', fontWeight: 600, marginBottom: '0.35rem' }}>Arraste o PDF aqui</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>ou clique para selecionar</p>
                      <input type="file" id="file-upload" accept=".pdf" style={{ display: 'none' }} onChange={handleFileChange} />
                      <label htmlFor="file-upload" className="btn" style={{ padding: '0.55rem 1.4rem', fontSize: '0.82rem' }}>Selecionar arquivo</label>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255, 107, 0, 0.1)', border: '1px solid rgba(255, 112, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.7rem' }}>
                        <FileText size={26} color="#2dd4bf" />
                      </div>
                      <p style={{ color: 'var(--orange-alert)', fontWeight: 600, marginBottom: '0.2rem' }}>{file.name}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.9rem' }}>{(file.size / 1024 / 1024).toFixed(2)} MB — pronto para processar</p>
                      <button className="btn" onClick={() => setFile(null)}
                        style={{ padding: '0.35rem 0.9rem', fontSize: '0.78rem', background: 'transparent', border: '1px solid rgba(248,113,113,0.35)', color: 'var(--blue-primary)', boxShadow: 'none' }}>
                        Trocar arquivo
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={labelStyle}>Horas por dia</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,10,20,0.4)', padding: '0.55rem 0.9rem', borderRadius: '10px', border: '1px solid rgba(0, 74, 173, 0.1)' }}>
                      <input type="range" min="1" max="12" step="0.5" value={hours} onChange={(e) => setHours(parseFloat(e.target.value))} style={{ flex: 1 }} />
                      <span style={{ color: 'var(--blue-primary)', fontWeight: 700, minWidth: '36px', textAlign: 'right' }}>{hours}h</span>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Data da prova</label>
                    <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
                  </div>
                </div>
                <button id="upload-submit" className="btn" style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }} disabled={!file} onClick={handleUpload}>
                  <Cpu size={17} /> Gerar plano de estudos
                </button>
              </div>
            </motion.div>
          )}

          {/* ════ PROCESSING — Skeleton Screens ═════ */}
          {appState === 'processing' && (
            <motion.div key="processing" variants={pageIn} initial="initial" animate="animate" exit="exit"
              style={{ paddingTop: '3rem' }}>
              {/* Spinner central */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
                <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '3rem 2.5rem', textAlign: 'center' }}>
                  <div style={{ position: 'relative', width: '88px', height: '88px', margin: '0 auto 2.25rem' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                      style={{ position: 'absolute', inset: 0, border: '2.5px solid rgba(0, 74, 173, 0.12)', borderTopColor: 'var(--blue-primary)', borderRadius: '50%' }} />
                    <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                      style={{ position: 'absolute', inset: '14px', border: '2.5px solid rgba(255, 112, 0, 0.1)', borderTopColor: 'var(--orange-alert)', borderRadius: '50%' }} />
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                      style={{ position: 'absolute', inset: '28px', border: '2px solid rgba(0, 74, 173, 0.05)', borderTopColor: 'var(--blue-primary)', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.95rem', color: 'var(--blue-primary)' }}>{progress}%</div>
                  </div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--blue-primary)', marginBottom: '0.45rem' }}>Mergulhando no edital</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '2rem', minHeight: '1.4em' }}>{statusMessage}</p>
                  <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
                </div>
              </div>

              {/* Skeleton dos gráficos */}
              {progress > 20 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'center', marginBottom: '1.5rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Preparando seu painel...</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="glass-card" style={{ padding: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                        <Skeleton width={40} height={40} radius={10} />
                        <div style={{ flex: 1 }}>
                          <Skeleton height={10} style={{ marginBottom: '8px', width: '60%' }} />
                          <Skeleton height={20} style={{ width: '80%' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="glass-card" style={{ padding: '1.5rem', height: '220px' }}>
                      <Skeleton height={12} style={{ marginBottom: '16px', width: '40%' }} />
                      <Skeleton height={160} radius={12} />
                    </div>
                    <div className="glass-card" style={{ padding: '1.5rem', height: '220px' }}>
                      <Skeleton height={12} style={{ marginBottom: '16px', width: '50%' }} />
                      <Skeleton height={160} radius={12} />
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ════ DASHBOARD ══════════════════════════ */}
          {appState === 'dashboard' && dashboardData && (
            <motion.div key="dashboard" variants={stagger} initial="initial" animate="animate" style={{ paddingTop: '2.5rem' }}>

              {/* Stats cards */}
              <motion.div variants={fadeUp}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                {[
                  { icon: <Calendar size={19} color="var(--blue-primary)" />, bg: 'rgba(10, 25, 47, 0.1)', label: 'Duração total',  value: `${dashboardData.total_days} dias` },
                  { icon: <Clock    size={19} color="var(--orange-alert)" />, bg: 'rgba(255, 107, 0, 0.1)', label: 'Ritmo diário', value: `${dashboardData.daily_hours}h / dia` },
                  { icon: <TrendingUp size={19} color="var(--blue-primary)" />, bg: 'rgba(10, 25, 47, 0.05)', label: 'Total de horas', value: `${dashboardData.total_estimated_hours}h` },
                ].map((s, i) => (
                  <div key={i} className="glass-card" style={{ padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
                    <div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
                      <p style={{ color: 'var(--blue-primary)', fontSize: '1.25rem', fontWeight: 700 }}>{s.value}</p>
                    </div>
                  </div>
                ))}
                <div className="glass-card" style={{ padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <button className="btn"
                    style={{ background: 'transparent', border: '1px solid rgba(0, 74, 173, 0.1)', boxShadow: 'none', fontSize: '0.82rem', padding: '0.55rem 0.9rem', color: 'var(--blue-primary)' }}
                    onClick={handleReplan} disabled={isReplanning}>
                    <RefreshCw size={14} className={isReplanning ? 'spin-anim' : ''} />
                    {isReplanning ? 'Recalculando...' : 'Replanejar ciclo'}
                  </button>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textAlign: 'center', marginTop: '0.4rem' }}>Ajuste automático sem sobrecarga</p>
                </div>
              </motion.div>

              {/* ── Radar Chart + Burn-up ──────────── */}
              <motion.section variants={fadeUp} style={{ marginBottom: '3.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', minWidth: 0 }}>

                  {/* Radar: Complexidade × Volume */}
                  <div className="glass-card" style={{ padding: '1.5rem', minWidth: 0 }}>
                    <OceanSectionHeading icon={<Activity size={17} color="#fff" />} bg="rgba(0, 74, 173, 0.05)" title="Complexidade × Volume" sub="Priorize o que é difícil, não só longo" />
                    {/* Altura dinâmica: 44px por área + 60px de legenda, mínimo 260 */}
                    <div style={{ width: '100%', height: Math.max(260, getRadarData().length * 44 + 60) }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={getRadarData()}
                          margin={{ top: 16, right: 40, bottom: 16, left: 40 }}
                          outerRadius="65%"
                        >
                          <PolarGrid stroke="rgba(0, 74, 173, 0.12)" />
                          <PolarAngleAxis dataKey="subject"
                            tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                            tickLine={false}
                          />
                          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                          <Radar name="Volume" dataKey="Volume" stroke="var(--blue-primary)" fill="var(--blue-primary)" fillOpacity={0.18} strokeWidth={2} />
                          <Radar name="Complexidade" dataKey="Complexidade" stroke="var(--orange-alert)" fill="var(--orange-alert)" fillOpacity={0.18} strokeWidth={2} />
                          <Tooltip content={<RadarTooltip />} />
                          <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: '0.75rem', paddingTop: '8px' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Burn-up Chart */}
                  <div className="glass-card" style={{ padding: '1.5rem', minWidth: 0 }}>
                    <OceanSectionHeading icon={<TrendingUp size={17} color="#fff" />} bg="rgba(16,185,129,0.5)" title="Progresso vs. Prazo" sub="Ideal vs. Real — se cruzarem negativamente, replanejar" />
                    <div style={{ width: '100%', height: Math.max(260, getRadarData().length * 44 + 60) }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getBurnUpData()} margin={{ top: 10, right: 24, bottom: 10, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 74, 173, 0.1)" />
                          <XAxis dataKey="dia" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} stroke="#94a3b8" interval="preserveStartEnd" />
                          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} stroke="#94a3b8" width={32} />
                          <Tooltip contentStyle={{ backgroundColor: 'var(--bg-white)', border: '1px solid var(--blue-primary)', color: 'var(--blue-primary)', borderRadius: '10px' }} itemStyle={{ color: 'var(--blue-primary)', fontSize: '0.8rem' }} />
                          <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: '0.75rem', paddingTop: '8px' }} />
                          <Line type="monotone" dataKey="Ideal" stroke="var(--yellow-alert)" strokeWidth={2} strokeDasharray="5 3" dot={false} />
                          <Line type="monotone" dataKey="Real" stroke="var(--orange-alert)" strokeWidth={2.5} dot={{ fill: 'var(--orange-alert)', r: 4 }} connectNulls={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* ── Heatmap de Consistência ───────── */}
              <motion.section variants={fadeUp} style={{ marginBottom: '3.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <OceanSectionHeading icon={<Zap size={17} color="#fff" />} bg="rgba(245,158,11,0.5)" title="Consistência da Maré" sub="Seus dias de estudo — mantenha a sequência acesa" />
                  <ConsistencyHeatmap completedDates={completionDates} />
                  <div style={{ display: 'flex', gap: '2rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Dias ativos', value: Object.values(completionDates).filter(v => v > 0).length },
                      { label: 'Tarefas concluídas', value: completedTasks.size },
                      { label: 'Maior sequência', value: '5 dias' },
                    ].map((s, i) => (
                      <div key={i}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
                        <p style={{ color: 'var(--blue-primary)', fontWeight: 700, fontSize: '1.1rem' }}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>

              {/* ── Cursos Recomendados ───────────── */}
              {dashboardData.recommended_courses?.length > 0 && (
                <motion.section variants={fadeUp} style={{ marginBottom: '3.5rem' }}>
                  <OceanSectionHeading icon={<FileText size={17} color="#fff" />} bg="#007ab8" title="Curadoria estratégica" sub="Plataformas selecionadas com base no seu edital" />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.1rem' }}>
                    {dashboardData.recommended_courses.map((course, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                        className="glass-card" style={{ padding: '1.4rem', borderTop: `2px solid ${OCEAN_PALETTE[idx % OCEAN_PALETTE.length]}` }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: OCEAN_PALETTE[idx % OCEAN_PALETTE.length], letterSpacing: '1.2px', textTransform: 'uppercase' }}>{course.platform}</span>
                        <h4 style={{ color: 'var(--blue-primary)', fontSize: '0.97rem', fontWeight: 700, margin: '0.4rem 0 0.65rem', lineHeight: 1.3 }}>{course.title}</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', lineHeight: 1.65, marginBottom: '1.1rem' }}>{course.description}</p>
                        <button className="btn" style={{ width: '100%', padding: '0.55rem', fontSize: '0.8rem', background: 'transparent', border: `1px solid ${OCEAN_PALETTE[idx % OCEAN_PALETTE.length]}30`, color: OCEAN_PALETTE[idx % OCEAN_PALETTE.length], boxShadow: 'none' }}>
                          Acessar oferta <ArrowRight size={12} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* ── Scatter + Lista de áreas ──────── */}
              {dashboardData.knowledge_areas?.length > 0 && (() => {
                const dynamic = dashboardData.knowledge_areas.map(ka => {
                  let r = 0;
                  dashboardData.daily_plan.forEach(day => day.tasks.forEach(t => {
                    if (completedTasks.has(t.id) && t.area === ka.name) r += t.duration;
                  }));
                  return { ...ka, total_hours: Math.max(0, ka.total_hours - r) };
                }).filter(ka => ka.total_hours > 0);

                if (dynamic.length === 0) return (
                  <div style={{ textAlign: 'center', padding: '2rem', marginBottom: '3rem' }}>
                    <CheckCircle size={46} color="#2dd4bf" style={{ marginBottom: '0.75rem' }} />
                    <h3 style={{ color: 'var(--orange-alert)', fontSize: '1.4rem' }}>Tudo concluído! 🎉</h3>
                  </div>
                );

                // Tamanho dinâmico do scatter: 52px por área, mínimo 300
                const scatterH = Math.max(300, dynamic.length * 52);
                return (
                  <motion.section variants={fadeUp} style={{ marginBottom: '3.5rem', overflow: 'hidden' }}>
                    <OceanSectionHeading icon={<Compass size={17} color="#fff" />} bg="#0b7a6b" title="Visão holística" sub="Volume de estudo restante por área" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.1rem', alignItems: 'start', overflow: 'hidden' }}>

                      {/* Scatter — container explícito com px para não quebrar */}
                      <div className="glass-card" style={{ padding: '1.4rem', minWidth: 0 }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Complete dias e as bolhas murcham.</p>
                        <div style={{ width: '100%', height: scatterH }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                              <XAxis type="number" dataKey="x" hide domain={['dataMin - 20', 'dataMax + 20']} />
                              <YAxis type="number" dataKey="y" hide domain={['dataMin - 20', 'dataMax + 20']} />
                              <ZAxis type="number" dataKey="total_hours" range={[200, Math.max(200, dynamic.length > 8 ? 2000 : 4000)]} />
                              <Tooltip content={<ScatterTooltip />} cursor={false} />
                              <Scatter data={dynamic.map((ka, i) => {
                                const a = (i / dynamic.length) * Math.PI * 2;
                                const r = scatterH * 0.28;
                                return { ...ka, x: Math.cos(a) * r, y: Math.sin(a) * r };
                              })}>
                                {dynamic.map((_, idx) => (
                                  <Cell key={idx} fill={OCEAN_PALETTE[idx % OCEAN_PALETTE.length]} opacity={0.85}
                                    style={{ filter: `drop-shadow(0 0 8px ${OCEAN_PALETTE[idx % OCEAN_PALETTE.length]}99)` }} />
                                ))}
                              </Scatter>
                            </ScatterChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Lista de áreas — altura livre, scrollável */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: `${scatterH + 36}px`, overflowY: 'auto', minWidth: 0, paddingRight: '4px' }}>
                        {dynamic.map((ka, idx) => (
                          <div key={idx} className="compact-card" style={{ borderLeft: `3px solid ${OCEAN_PALETTE[idx % OCEAN_PALETTE.length]}`, flexShrink: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                              <h4 style={{ color: 'var(--blue-primary)', fontSize: '0.87rem', fontWeight: 700 }}>{ka.name}</h4>
                              <span style={{ color: OCEAN_PALETTE[idx % OCEAN_PALETTE.length], fontWeight: 700, fontSize: '0.78rem', flexShrink: 0, marginLeft: '0.5rem' }}>{ka.total_hours}h</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.55 }}>{ka.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.section>
                );
              })()}

              {/* ── Gantt Burn ────────────────────── */}
              {(() => {
                const gantt = dashboardData.daily_plan.map(day => {
                  const row = { name: `Dia ${day.day}`, _n: 0 };
                  day.tasks.forEach(t => { if (!completedTasks.has(t.id)) { row[t.title] = t.duration; row._n++; } });
                  return row;
                }).filter(r => r._n > 0);
                if (gantt.length === 0) return null;
                const allTasks = Array.from(new Set(dashboardData.daily_plan.flatMap(d => d.tasks.map(t => t.title))));
                // Altura dinâmica: 38px por linha + 80px de eixos/legenda, mínimo 280
                const ganttH = Math.max(280, gantt.length * 38 + 80);
                // Largura do YAxis adaptativa ao nome mais longo
                const yW = Math.min(90, Math.max(52, Math.max(...gantt.map(r => r.name.length)) * 7));
                return (
                  <motion.section variants={fadeUp} style={{ marginBottom: '3.5rem' }}>
                    <OceanSectionHeading icon={<BarChart2 size={17} color="#fff" />} bg="#1a5276" title="Progresso mapeado" sub="Volume restante por dia" />
                    <div className="glass-card" style={{ padding: '1.5rem', minWidth: 0 }}>
                      {/* Legend separada do gráfico para não ser cortada */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', marginBottom: '0.75rem' }}>
                        {allTasks.map((t, i) => (
                          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: OCEAN_PALETTE[i % OCEAN_PALETTE.length], flexShrink: 0 }} />
                            {t}
                          </div>
                        ))}
                      </div>
                      <div style={{ width: '100%', height: ganttH }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart layout="vertical" data={gantt} margin={{ top: 4, right: 20, left: 4, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 74, 173, 0.1)" horizontal={false} />
                            <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                            <YAxis dataKey="name" type="category" stroke="#94a3b8" width={yW} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-white)', border: '1px solid var(--blue-primary)', color: 'var(--blue-primary)', borderRadius: '10px' }} itemStyle={{ color: 'var(--blue-primary)', fontSize: '0.8rem' }} />
                            {allTasks.map((t, i) => <Bar key={t} dataKey={t} stackId="a" fill={OCEAN_PALETTE[i % OCEAN_PALETTE.length]} radius={[0, 3, 3, 0]} />)}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </motion.section>
                );
              })()}

              {/* ── Checklist ────────────────────── */}
              <motion.section variants={fadeUp}>
                <OceanSectionHeading icon={<CheckCircle size={17} color="#fff" />} bg="#005f8a" title="Checklist diário" sub="Clique em ▶ para modo foco, ou marque diretamente" />
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {[{ label: 'Pendentes', v: false, c: 'var(--blue-primary)' }, { label: 'Concluídos', v: true, c: 'var(--orange-alert)' }].map(tab => (
                    <button key={tab.label} onClick={() => setShowCompletedDays(tab.v)}
                      style={{ padding: '0.45rem 1.1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, border: showCompletedDays === tab.v ? `1px solid ${tab.c}35` : '1px solid rgba(0, 74, 173, 0.1)', background: showCompletedDays === tab.v ? `${tab.c}0e` : 'transparent', color: showCompletedDays === tab.v ? tab.c : 'var(--text-muted)', transition: 'all 0.2s ease' }}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.1rem', alignItems: 'start' }}>
                  {dashboardData.daily_plan.map((day, idx) => {
                    const allDone = day.tasks.every(t => completedTasks.has(t.id));
                    if (showCompletedDays && !allDone) return null;
                    if (!showCompletedDays && allDone) return null;
                    const acc = DAY_COLORS[idx % DAY_COLORS.length];
                    return (
                      <motion.div key={day.day} whileHover={{ y: -4, scale: 1.01 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.04 }}
                        style={{ background: 'var(--bg-white)', backdropFilter: 'blur(24px)', border: `1px solid ${acc}18`, borderTop: `2px solid ${allDone ? 'var(--orange-alert)' : acc}`, borderRadius: '16px', padding: '1.15rem', opacity: allDone ? 0.55 : 1, transition: 'opacity 0.3s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem', paddingBottom: '0.65rem', borderBottom: `1px solid ${acc}12` }}>
                          <span style={{ color: 'var(--blue-primary)', fontWeight: 700 }}>Dia {day.day}</span>
                          {allDone ? <CheckCircle size={16} color="var(--orange-alert)" /> : <AlertCircle size={16} color={acc} style={{ opacity: 0.6 }} />}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                          {day.tasks.map(task => {
                            const done = completedTasks.has(task.id);
                            return (
                              <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.6rem 0.7rem', borderRadius: '8px', background: done ? 'rgba(255, 107, 0, 0.1)' : 'rgba(10, 25, 47, 0.1)', border: `1px solid ${done ? 'rgba(255, 107, 0, 0.1)' : 'transparent'}`, transition: 'all 0.2s ease', opacity: done ? 0.6 : 1 }}>
                                {/* Checkbox */}
                                <div onClick={() => toggleTask(task.id)} className={`checkbox-custom ${done ? 'checked' : ''}`} style={{ marginTop: '2px', cursor: 'pointer', flexShrink: 0 }}>
                                  {done && <Check size={12} color="#fff" />}
                                </div>
                                {/* Texto */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.3, color: done ? 'var(--text-muted)' : 'var(--blue-primary)', textDecoration: done ? 'line-through' : 'none' }}>{task.title}</span>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '0.15rem', fontWeight: 500 }}>
                                    <Clock size={9} /> ~{task.duration}h
                                  </span>
                                </div>
                                {/* Botão foco */}
                                {!done && (
                                  <button onClick={() => setFocusMode({ active: true, task })}
                                    title="Entrar em modo foco"
                                    style={{ background: 'rgba(10, 25, 47, 0.05)', border: '1px solid rgba(0, 74, 173, 0.05)', borderRadius: '6px', padding: '3px 6px', cursor: 'pointer', color: 'var(--blue-primary)', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                                    <Play size={10} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer style={{ textAlign: 'center', padding: '2rem 1.5rem', borderTop: '1px solid rgba(0,0,0,0.06)', color: 'var(--text-muted)', fontSize: '0.76rem', position: 'relative', zIndex: 1 }}>
        © {new Date().getFullYear()} Concurseiro — PLANEJE. ESTUDE. CONQUISTE.
      </footer>
    </>
  );
}

export default App;
