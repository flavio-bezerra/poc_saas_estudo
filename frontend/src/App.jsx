import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, FileText, Check, Clock, Calendar, RefreshCw,
  CheckCircle, AlertCircle, BarChart2, Compass, Cpu, Lock,
  Mail, TrendingUp, Star, ArrowRight, Layers, Target, Waves
} from 'lucide-react';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend, Cell
} from 'recharts';
import './index.css';

const API_BASE_URL = 'http://localhost:8000/api';

/* ══════════════════════════════════════════════════
   AERIAL OCEAN VIEW — ondas vistas de cima
   Linhas sinusoidais densas simulando textura
   de oceano em visão aérea / drone
   ══════════════════════════════════════════════════ */

// Gera o path de uma onda sinusoidal horizontal
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
  const VW = 1600;
  const VH = 900;

  // Swell primário — ondas largas e suaves (vento ao largo)
  const primarySwell = Array.from({ length: 14 }, (_, i) => ({
    y: 30 + i * 64,
    amp: 18 + (i % 3) * 9,
    wl: 380 + (i % 4) * 60,
    phase: (i * 55) % 220,
    strokeW: i % 5 === 0 ? 1.8 : 1,
    color: i % 4 === 0
      ? 'rgba(0,212,255,0.16)'
      : i % 4 === 2
        ? 'rgba(45,212,191,0.10)'
        : 'rgba(0,170,210,0.09)',
  }));

  // Swell secundário — ondas médias em ângulo leve (~-12°)
  const secondarySwell = Array.from({ length: 20 }, (_, i) => ({
    y: 10 + i * 46,
    amp: 9 + (i % 3) * 5,
    wl: 210 + (i % 3) * 55,
    phase: (i * 33) % 180,
    strokeW: 0.7,
    color: i % 3 === 0
      ? 'rgba(0,200,240,0.08)'
      : 'rgba(0,150,200,0.05)',
  }));

  // Ripples — pequenas ondulações de superfície
  const ripples = Array.from({ length: 32 }, (_, i) => ({
    y: 5 + i * 29,
    amp: 4 + (i % 2) * 3,
    wl: 110 + (i % 4) * 30,
    phase: (i * 19) % 120,
    strokeW: 0.5,
    color: 'rgba(0,212,255,0.04)',
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>

      {/* ── Ripples — camada base ── */}
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid slice"
        className="aerial-ripple"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        {ripples.map((w, i) => (
          <path
            key={i}
            d={wavePath(w.y, w.amp, w.wl, w.phase)}
            fill="none"
            stroke={w.color}
            strokeWidth={w.strokeW}
          />
        ))}
      </svg>

      {/* ── Swell secundário — ligeiramente rotacionado ── */}
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid slice"
        className="aerial-secondary"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <g transform={`rotate(-10, ${VW / 2}, ${VH / 2})`}>
          {secondarySwell.map((w, i) => (
            <path
              key={i}
              d={wavePath(w.y, w.amp, w.wl, w.phase)}
              fill="none"
              stroke={w.color}
              strokeWidth={w.strokeW}
            />
          ))}
        </g>
      </svg>

      {/* ── Swell primário — camada principal ── */}
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid slice"
        className="aerial-primary"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        {primarySwell.map((w, i) => (
          <path
            key={i}
            d={wavePath(w.y, w.amp, w.wl, w.phase)}
            fill="none"
            stroke={w.color}
            strokeWidth={w.strokeW}
            strokeLinecap="round"
          />
        ))}
      </svg>

    </div>
  );
};

/* ── Logo ─────────────────────────────────────────────────── */
const VibeVectorLogo = () => (
  <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ filter: 'drop-shadow(0 0 12px rgba(0,212,255,0.6))' }}>
    <rect width="100" height="100" rx="22" fill="url(#logo_ocean)" />
    <path d="M28 35 L50 68 L72 35" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M50 68 L80 25" stroke="#00d4ff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="logo_ocean" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#004e7c" />
        <stop offset="0.5" stopColor="#007ab8" />
        <stop offset="1" stopColor="#00c2e8" />
      </linearGradient>
    </defs>
  </svg>
);

/* ── Tooltip do Gráfico ──────────────────────────────────── */
function CustomTooltip({ active, payload }) {
  if (active && payload?.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        padding: '0.75rem 1rem',
        background: 'rgba(2,12,24,0.95)',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: '10px',
        backdropFilter: 'blur(16px)',
      }}>
        <p style={{ color: '#00d4ff', fontWeight: 700, marginBottom: '0.2rem' }}>{data.name}</p>
        <p style={{ color: '#e2e8f0', fontSize: '0.82rem' }}>{data.total_hours}h restantes</p>
      </div>
    );
  }
  return null;
}

/* ── Mock Data ───────────────────────────────────────────── */
const MOCK_DASHBOARD_DATA = {
  total_estimated_hours: 120,
  daily_hours: 4,
  total_days: 30,
  knowledge_areas: [
    { name: "Direito Constitucional",       description: "Princípios, direitos e garantias essenciais, além de organização do estado.", total_hours: 20 },
    { name: "Direito Administrativo",       description: "Atos, poderes, administração pública e a nova lei de licitações.", total_hours: 25 },
    { name: "Língua Portuguesa",            description: "Interpretação profunda de textos e forte domínio de análise sintática.", total_hours: 30 },
    { name: "Raciocínio Lógico Matemático", description: "Lógica proposicional, análises combinatórias e probabilidade estatística.", total_hours: 15 },
    { name: "Informática Básica",           description: "Redes, segurança, conceitos virais de internet e banco de dados corporativo.", total_hours: 10 },
    { name: "Legislação Específica",        description: "Regimentos estaduais, lei orgânica, direitos das autarquias locais.", total_hours: 20 },
  ],
  recommended_courses: [
    { title: "Série Pro: Carreiras Jurídicas",    platform: "Estratégia Concursos", description: "Material denso de jurisprudência com simulados focados na banca." },
    { title: "Assinatura Ilimitada Plus",          platform: "Gran Cursos",          description: "Centenas de videoaulas com professores especialistas por carreira." },
    { title: "Projeto Focus",                      platform: "Direção Concursos",    description: "PDFs diretos e mapas mentais ágeis sem poluição de conteúdo." },
    { title: "Plataforma Ilimitada de Questões",   platform: "QConcursos",           description: "Banco dinâmico com milhões de questões filtradas pelo seu edital." },
  ],
  daily_plan: [
    { day: 1,  tasks: [{ id:"1",  title:"Constituição Org.",          duration:2,   completed:true,  area:"Direito Constitucional" },      { id:"2",  title:"Ortografia",                  duration:2,   completed:true,  area:"Língua Portuguesa" }] },
    { day: 2,  tasks: [{ id:"3",  title:"Atos Administrativos",       duration:1.5, completed:false, area:"Direito Administrativo" },      { id:"4",  title:"Windows/Linux",              duration:1,   completed:false, area:"Informática Básica" },       { id:"5", title:"Lógica", duration:1.5, completed:false, area:"Raciocínio Lógico Matemático" }] },
    { day: 3,  tasks: [{ id:"6",  title:"Licitações Lei",             duration:3,   completed:false, area:"Direito Administrativo" },      { id:"7",  title:"Excel Avançado",             duration:1,   completed:false, area:"Informática Básica" }] },
    { day: 4,  tasks: [{ id:"8",  title:"Sintaxe da Língua",          duration:2,   completed:false, area:"Língua Portuguesa" },           { id:"9",  title:"Licitações (Aprofundamento)",duration:2,   completed:false, area:"Direito Administrativo" }] },
    { day: 5,  tasks: [{ id:"10", title:"Regimes da Serventia",       duration:2.5, completed:false, area:"Legislação Específica" },       { id:"11", title:"Concordância Verbal",        duration:1.5, completed:false, area:"Língua Portuguesa" }] },
    { day: 6,  tasks: [{ id:"12", title:"Segurança de TI",            duration:2,   completed:false, area:"Informática Básica" },          { id:"13", title:"Probabilidade Matemática",   duration:2,   completed:false, area:"Raciocínio Lógico Matemático" }] },
    { day: 7,  tasks: [{ id:"14", title:"Simulado Geral e Revisão",   duration:4,   completed:false, area:"Língua Portuguesa" }] },
    { day: 8,  tasks: [{ id:"15", title:"Garantias Constitucionais",  duration:2,   completed:false, area:"Direito Constitucional" },      { id:"16", title:"Improbidade Administrativa", duration:2,   completed:false, area:"Direito Administrativo" }] },
    { day: 9,  tasks: [{ id:"17", title:"Redação e Tese",             duration:2,   completed:false, area:"Língua Portuguesa" },           { id:"18", title:"Estatística Pura",           duration:2,   completed:false, area:"Raciocínio Lógico Matemático" }] },
    { day: 10, tasks: [{ id:"19", title:"Direitos Políticos",         duration:1.5, completed:false, area:"Direito Constitucional" },      { id:"20", title:"Bancos de Dados",            duration:1.5, completed:false, area:"Informática Básica" },       { id:"21", title:"Poder Executivo", duration:1, completed:false, area:"Direito Administrativo" }] },
  ],
};

/* ── Cores oceânicas das matérias ────────────────────────── */
const OCEAN_PALETTE = ['#00d4ff', '#10B981', '#A855F7', '#F59E0B', '#F43F5E', '#3B82F6'];
const DAY_COLORS    = ['#00C2E8', '#34D399', '#C084FC', '#FBBF24', '#FB7185'];

/* ── Variantes de animação ───────────────────────────────── */
const pageIn  = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } }, exit: { opacity: 0, y: -12, transition: { duration: 0.25 } } };
const fadeUp  = { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

/* ── Input & Label styles compartilhados ────────────────── */
const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '10px',
  background: 'rgba(0,10,20,0.5)',
  border: '1px solid rgba(0,212,255,0.1)',
  color: '#ffffff',
  fontSize: '0.9rem',
  fontFamily: 'Outfit, sans-serif',
};
const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  color: '#cbd5e1',
  fontSize: '0.78rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
};

/* ══════════════════════════════════════════════════
   APP
   ══════════════════════════════════════════════════ */
function App() {
  const [appState, setAppState]                 = useState('landing');
  const [file, setFile]                         = useState(null);
  const [hours, setHours]                       = useState(3);
  const [testDate, setTestDate]                 = useState('');
  const [taskId, setTaskId]                     = useState('');
  const [progress, setProgress]                 = useState(0);
  const [statusMessage, setStatusMessage]       = useState('');
  const [dashboardData, setDashboardData]       = useState(null);
  const [completedTasks, setCompletedTasks]     = useState(new Set());
  const [isReplanning, setIsReplanning]         = useState(false);
  const [showCompletedDays, setShowCompletedDays] = useState(false);

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
    fd.append('file', file);
    fd.append('hours_per_day', hours);
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

  const toggleTask = (id) => {
    const s = new Set(completedTasks);
    s.has(id) ? s.delete(id) : s.add(id);
    setCompletedTasks(s);
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

  /* ─────────────────────────────────────────────── */
  return (
    <>
      {/* ── Background — Visão Aérea Oceânica ──── */}
      <div className="bg-fluid">
        <AerialOceanBG />
      </div>

      {/* ── Navigation ───────────────────────────── */}
      <header className="top-bar">
        <button
          onClick={() => setAppState('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <VibeVectorLogo />
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
            Vibe<span style={{ color: '#00d4ff' }}>Study</span>
          </span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {appState === 'dashboard' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ color: '#cbd5e1', fontSize: '0.78rem', fontWeight: 600 }}>PROGRESSO</span>
              <div className="progress-circle" style={{ '--p': `${getProgress()}%` }}>
                <span>{getProgress()}%</span>
              </div>
            </div>
          )}
          {appState !== 'dashboard' && (
            <button
              className="btn"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.82rem', background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)', boxShadow: 'none' }}
              onClick={() => setAppState('login')}
            >
              Entrar
            </button>
          )}
        </div>
      </header>

      {/* ── Main ─────────────────────────────────── */}
      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 1.5rem 6rem', width: '100%', position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">

          {/* ════ LANDING ════════════════════════════ */}
          {appState === 'landing' && (
            <motion.div key="landing" variants={pageIn} initial="initial" animate="animate" exit="exit">

              {/* Hero */}
              <section style={{ textAlign: 'center', paddingTop: '5.5rem', paddingBottom: '6rem', position: 'relative' }}>

                {/* Glow submerso atrás do título */}
                <div style={{
                  position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
                  width: '600px', height: '300px',
                  background: 'radial-gradient(ellipse at center, rgba(0,180,220,0.1) 0%, transparent 70%)',
                  pointerEvents: 'none', filter: 'blur(40px)',
                }} />

                {/* Badge */}
                <motion.div variants={fadeUp} initial="initial" animate="animate" style={{ marginBottom: '1.75rem' }}>
                  <span className="feature-badge">
                    <Waves size={13} /> Navegue rumo à aprovação
                  </span>
                </motion.div>

                {/* Título */}
                <motion.h1
                  className="hero-title"
                  variants={fadeUp} initial="initial" animate="animate"
                  style={{ marginBottom: '1.5rem' }}
                >
                  Seu edital virou<br />
                  <span style={{
                    background: 'linear-gradient(135deg, #00d4ff 0%, #2dd4bf 45%, #38bdf8 80%, #00d4ff 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'oceanGradientMove 4s linear infinite',
                  }}>
                    sua rota de passagem.
                  </span>
                </motion.h1>

                {/* Subtítulo */}
                <motion.p
                  variants={fadeUp} initial="initial" animate="animate"
                  style={{ color: '#e2e8f0', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto 3rem', lineHeight: 1.75 }}
                >
                  Faça upload do PDF do seu edital e receba em minutos um cronograma
                  inteligente — como uma correnteza que te leva direto à aprovação.
                </motion.p>

                {/* CTAs */}
                <motion.div
                  className="hero-buttons"
                  variants={fadeUp} initial="initial" animate="animate"
                  style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
                >
                  <button
                    id="cta-start" className="btn"
                    style={{ padding: '0.9rem 2.25rem', fontSize: '1rem' }}
                    onClick={() => setAppState('login')}
                  >
                    Começar agora <ArrowRight size={16} />
                  </button>
                  <button
                    id="cta-demo" className="btn"
                    style={{
                      padding: '0.9rem 2.25rem', fontSize: '1rem',
                      background: 'transparent',
                      border: '1px solid rgba(0,212,255,0.25)',
                      color: '#7ee8ff', boxShadow: 'none',
                    }}
                    onClick={handleLoadDemo}
                  >
                    Ver demo grátis
                  </button>
                </motion.div>

                {/* Mini stats */}
                <motion.div
                  variants={fadeUp} initial="initial" animate="animate"
                  style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center', marginTop: '3.5rem', flexWrap: 'wrap' }}
                >
                  {[
                    { value: '+3.400', label: 'Concurseiros' },
                    { value: '94%',    label: 'Taxa de progresso' },
                    { value: '< 3min', label: 'Para gerar o plano' },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#00d4ff', lineHeight: 1 }}>{s.value}</p>
                      <p style={{ color: '#cbd5e1', fontSize: '0.8rem', marginTop: '0.25rem' }}>{s.label}</p>
                    </div>
                  ))}
                </motion.div>
              </section>

              {/* Wave divider visual */}
              <div style={{ textAlign: 'center', margin: '0 0 4rem', opacity: 0.15 }}>
                <svg viewBox="0 0 800 40" style={{ width: '100%', maxWidth: '600px' }} fill="none">
                  <path d="M0,20 C100,40 200,0 300,20 C400,40 500,0 600,20 C700,40 800,10 800,20" stroke="#00d4ff" strokeWidth="2" fill="none" />
                </svg>
              </div>

              {/* Features */}
              <section style={{ marginBottom: '5rem' }}>
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '2.5rem' }}>
                  Como funciona
                </p>
                <motion.div
                  variants={stagger} initial="initial" animate="animate"
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}
                >
                  {[
                    {
                      icon: <Target size={22} color="#00d4ff" />, bg: 'rgba(0,212,255,0.07)',
                      border: 'rgba(0,212,255,0.2)', accent: '#00d4ff',
                      title: 'Foco no que a banca cobra',
                      desc: 'Nossa IA decodifica o padrão da sua banca (Cespe, FCC, FGV) e mapeia os pontos com maior incidência histórica para o seu cargo.',
                    },
                    {
                      icon: <Layers size={22} color="#2dd4bf" />, bg: 'rgba(45,212,191,0.07)',
                      border: 'rgba(45,212,191,0.2)', accent: '#2dd4bf',
                      title: 'Curadoria de cursos direcionada',
                      desc: 'Recomendamos automaticamente as aulas certas nas maiores plataformas, filtradas para o seu edital e perfíl de banca.',
                    },
                    {
                      icon: <Cpu size={22} color="#38bdf8" />, bg: 'rgba(56,189,248,0.07)',
                      border: 'rgba(56,189,248,0.2)', accent: '#38bdf8',
                      title: 'Cronograma vivo e adaptável',
                      desc: 'Conforme você avança, o algoritmo ajusta densidades. Um plano que flui com você até o dia da prova.',
                    },
                  ].map((f, i) => (
                    <motion.div key={i} variants={fadeUp} className="glass-card"
                      style={{ padding: '1.75rem', borderTop: `2px solid ${f.border}` }}>
                      <div style={{
                        width: '46px', height: '46px', borderRadius: '12px',
                        background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '1.25rem', border: `1px solid ${f.border}`,
                      }}>
                        {f.icon}
                      </div>
                      <h3 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '0.65rem' }}>{f.title}</h3>
                      <p style={{ color: '#e2e8f0', fontSize: '0.88rem', lineHeight: 1.7 }}>{f.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </section>

              {/* Social Proof */}
              <section style={{ marginBottom: '4rem' }}>
                <h2 style={{ textAlign: 'center', fontSize: '1.55rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>
                  Quem navegou, chegou à margem.
                </h2>
                <p style={{ textAlign: 'center', color: '#cbd5e1', marginBottom: '2.25rem', fontSize: '0.88rem' }}>
                  Histórias reais de quem usou o VibeStudy.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                  {[
                    {
                      quote: '"Reduziu minha ansiedade ao zero. Ver o TSE Unificado quebrado em cartões diários fez eu finalmente parar de procrastinar."',
                      author: 'Marcos T.', role: 'Aprovado — Analista Judiciário', initial: 'M', color: '#00d4ff',
                    },
                    {
                      quote: '"Tentava fechar a Receita Federal na força bruta. Com o VibeStudy recalibrando meu ciclo, ganhei horas de folga no fim de semana."',
                      author: 'Carolina S.', role: 'Aprovada — Auditora Fiscal', initial: 'C', color: '#2dd4bf',
                    },
                  ].map((t, i) => (
                    <motion.div key={i} variants={fadeUp} initial="initial" animate="animate"
                      className="glass-card" style={{ padding: '1.75rem' }}>
                      <div style={{ display: 'flex', gap: '2px', marginBottom: '0.9rem' }}>
                        {[...Array(5)].map((_, s) => <Star key={s} size={13} fill="#00d4ff" color="#00d4ff" />)}
                      </div>
                      <p style={{ color: '#e2e8f0', fontSize: '0.88rem', lineHeight: 1.75, fontStyle: 'italic', marginBottom: '1.4rem' }}>
                        {t.quote}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: `${t.color}15`, border: `1px solid ${t.color}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, color: t.color, fontSize: '0.85rem',
                        }}>
                          {t.initial}
                        </div>
                        <div>
                          <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.88rem', margin: 0 }}>{t.author}</p>
                          <p style={{ color: '#cbd5e1', fontSize: '0.76rem', margin: 0 }}>{t.role}</p>
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
                  <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#ffffff', margin: '0.9rem 0 0.2rem' }}>
                    Mergulhe de volta
                  </h2>
                  <p style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Entre para navegar pelo seu cronograma.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div>
                    <label style={labelStyle}><Mail size={11} style={{ display:'inline', marginRight:'4px' }} />E-mail</label>
                    <input id="login-email" type="email" placeholder="nome@exemplo.com" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}><Lock size={11} style={{ display:'inline', marginRight:'4px' }} />Senha</label>
                    <input id="login-password" type="password" placeholder="••••••••" style={inputStyle} />
                  </div>
                  <button id="login-submit" className="btn"
                    style={{ width:'100%', padding:'0.9rem', marginTop:'0.5rem' }}
                    onClick={() => setAppState('upload')}>
                    Entrar na plataforma <ArrowRight size={16} />
                  </button>
                  <p style={{ textAlign:'center', color:'#94a3b8', fontSize:'0.78rem' }}>
                    Sem conta?{' '}
                    <span style={{ color:'#00d4ff', cursor:'pointer', fontWeight:600 }} onClick={() => setAppState('upload')}>
                      Criar gratuitamente
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ════ UPLOAD ═════════════════════════════ */}
          {appState === 'upload' && (
            <motion.div key="upload" variants={pageIn} initial="initial" animate="animate" exit="exit"
              style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingTop:'3.5rem' }}>
              <div style={{ textAlign:'center', marginBottom:'2.25rem' }}>
                <span className="feature-badge" style={{ marginBottom:'1.1rem', display:'inline-flex' }}>
                  <UploadCloud size={13} /> Upload do Edital
                </span>
                <h2 style={{ fontSize:'2rem', fontWeight:800, color:'#ffffff', marginTop:'1rem', marginBottom:'0.4rem', letterSpacing:'-0.5px' }}>
                  Ancore seu edital aqui
                </h2>
                <p style={{ color:'#cbd5e1', maxWidth:'480px', fontSize:'0.9rem', lineHeight:1.7 }}>
                  Deixe a correnteza de IA trabalhar — em minutos seu plano de estudos estará pronto.
                </p>
              </div>

              <div className="glass-card" style={{ width:'100%', maxWidth:'660px', padding:'2rem' }}>
                {/* Drop Zone */}
                <div className="file-drop-area"
                  onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
                  style={{
                    marginBottom:'1.5rem',
                    background: file ? 'rgba(45,212,191,0.04)' : undefined,
                    borderColor: file ? 'rgba(45,212,191,0.35)' : undefined,
                  }}>
                  {!file ? (
                    <>
                      <div style={{ marginBottom:'0.75rem' }}>
                        <UploadCloud size={38} color="#00d4ff" style={{ opacity:0.75 }} />
                      </div>
                      <p style={{ color:'#ffffff', fontWeight:600, marginBottom:'0.35rem' }}>Arraste o PDF aqui</p>
                      <p style={{ color:'#cbd5e1', fontSize:'0.82rem', marginBottom:'1.25rem' }}>ou clique para selecionar</p>
                      <input type="file" id="file-upload" accept=".pdf" style={{ display:'none' }} onChange={handleFileChange} />
                      <label htmlFor="file-upload" className="btn" style={{ padding:'0.55rem 1.4rem', fontSize:'0.82rem' }}>
                        Selecionar arquivo
                      </label>
                    </>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                      <div style={{
                        width:'52px', height:'52px', borderRadius:'14px',
                        background:'rgba(45,212,191,0.1)', border:'1px solid rgba(45,212,191,0.2)',
                        display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'0.7rem',
                      }}>
                        <FileText size={26} color="#2dd4bf" />
                      </div>
                      <p style={{ color:'#2dd4bf', fontWeight:600, marginBottom:'0.2rem' }}>{file.name}</p>
                      <p style={{ color:'#cbd5e1', fontSize:'0.78rem', marginBottom:'0.9rem' }}>
                        {(file.size/1024/1024).toFixed(2)} MB — pronto para processar
                      </p>
                      <button className="btn" onClick={() => setFile(null)}
                        style={{ padding:'0.35rem 0.9rem', fontSize:'0.78rem', background:'transparent', border:'1px solid rgba(248,113,113,0.35)', color:'#f87171', boxShadow:'none' }}>
                        Trocar arquivo
                      </button>
                    </div>
                  )}
                </div>

                {/* Config */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.1rem', marginBottom:'1.5rem' }}>
                  <div>
                    <label style={labelStyle}>Horas por dia</label>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', background:'rgba(0,10,20,0.4)', padding:'0.55rem 0.9rem', borderRadius:'10px', border:'1px solid rgba(0,212,255,0.08)' }}>
                      <input type="range" min="1" max="12" step="0.5" value={hours}
                        onChange={(e) => setHours(parseFloat(e.target.value))} style={{ flex:1 }} />
                      <span style={{ color:'#00d4ff', fontWeight:700, minWidth:'36px', textAlign:'right' }}>{hours}h</span>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Data da prova</label>
                    <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)}
                      style={{ ...inputStyle, colorScheme:'dark' }} />
                  </div>
                </div>

                <button id="upload-submit" className="btn"
                  style={{ width:'100%', padding:'0.9rem', fontSize:'1rem' }}
                  disabled={!file} onClick={handleUpload}>
                  <Cpu size={17} /> Gerar plano de estudos
                </button>
              </div>
            </motion.div>
          )}

          {/* ════ PROCESSING ═════════════════════════ */}
          {appState === 'processing' && (
            <motion.div key="processing" variants={pageIn} initial="initial" animate="animate" exit="exit"
              style={{ display:'flex', justifyContent:'center', paddingTop:'5rem' }}>
              <div className="glass-card" style={{ maxWidth:'440px', width:'100%', padding:'3.5rem 2.5rem', textAlign:'center' }}>
                {/* Spinner oceânico */}
                <div style={{ position:'relative', width:'88px', height:'88px', margin:'0 auto 2.25rem' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat:Infinity, duration:3, ease:'linear' }}
                    style={{ position:'absolute', inset:0, border:'2.5px solid rgba(0,212,255,0.12)', borderTopColor:'#00d4ff', borderRadius:'50%' }} />
                  <motion.div animate={{ rotate: -360 }} transition={{ repeat:Infinity, duration:2, ease:'linear' }}
                    style={{ position:'absolute', inset:'14px', border:'2.5px solid rgba(45,212,191,0.12)', borderTopColor:'#2dd4bf', borderRadius:'50%' }} />
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat:Infinity, duration:1.2, ease:'linear' }}
                    style={{ position:'absolute', inset:'28px', border:'2px solid rgba(56,189,248,0.15)', borderTopColor:'#38bdf8', borderRadius:'50%' }} />
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.95rem', color:'#00d4ff' }}>
                    {progress}%
                  </div>
                </div>

                <h2 style={{ fontSize:'1.35rem', fontWeight:700, color:'#ffffff', marginBottom:'0.45rem' }}>
                  Mergulhando no edital
                </h2>
                <p style={{ color:'#cbd5e1', fontSize:'0.88rem', marginBottom:'2rem', minHeight:'1.4em' }}>
                  {statusMessage}
                </p>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width:`${progress}%` }} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ════ DASHBOARD ══════════════════════════ */}
          {appState === 'dashboard' && dashboardData && (
            <motion.div key="dashboard" variants={stagger} initial="initial" animate="animate" style={{ paddingTop:'2.5rem' }}>

              {/* Stats */}
              <motion.div variants={fadeUp}
                style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'1rem', marginBottom:'2.5rem' }}>
                {[
                  { icon:<Calendar size={19} color="#00d4ff" />, bg:'rgba(0,212,255,0.08)', label:'Duração total',  value:`${dashboardData.total_days} dias` },
                  { icon:<Clock    size={19} color="#2dd4bf" />, bg:'rgba(45,212,191,0.08)', label:'Ritmo diário',  value:`${dashboardData.daily_hours}h / dia` },
                  { icon:<TrendingUp size={19} color="#38bdf8" />, bg:'rgba(56,189,248,0.08)', label:'Total de horas', value:`${dashboardData.total_estimated_hours}h` },
                ].map((s, i) => (
                  <div key={i} className="glass-card" style={{ padding:'1.1rem 1.25rem', display:'flex', alignItems:'center', gap:'0.9rem' }}>
                    <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {s.icon}
                    </div>
                    <div>
                      <p style={{ color:'#94a3b8', fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>{s.label}</p>
                      <p style={{ color:'#ffffff', fontSize:'1.25rem', fontWeight:700 }}>{s.value}</p>
                    </div>
                  </div>
                ))}
                <div className="glass-card" style={{ padding:'1.1rem 1.25rem', display:'flex', flexDirection:'column', justifyContent:'center' }}>
                  <button className="btn"
                    style={{ background:'transparent', border:'1px solid rgba(0,212,255,0.18)', boxShadow:'none', fontSize:'0.82rem', padding:'0.55rem 0.9rem', color:'#7ee8ff' }}
                    onClick={handleReplan} disabled={isReplanning}>
                    <RefreshCw size={14} className={isReplanning ? 'spin-anim' : ''} />
                    {isReplanning ? 'Recalculando...' : 'Replanejar ciclo'}
                  </button>
                  <p style={{ color:'#94a3b8', fontSize:'0.72rem', textAlign:'center', marginTop:'0.4rem' }}>Ajuste automático sem sobrecarga</p>
                </div>
              </motion.div>

              {/* Cursos Recomendados */}
              {dashboardData.recommended_courses?.length > 0 && (
                <motion.section variants={fadeUp} style={{ marginBottom:'3.5rem' }}>
                  <OceanSectionHeading icon={<FileText size={17} color="white" />} bg="#007ab8" title="Curadoria estratégica" sub="Plataformas selecionadas com base no seu edital" />
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'1.1rem' }}>
                    {dashboardData.recommended_courses.map((course, idx) => (
                      <motion.div key={idx} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:idx*0.08 }}
                        className="glass-card" style={{ padding:'1.4rem', borderTop:`2px solid ${OCEAN_PALETTE[idx % OCEAN_PALETTE.length]}` }}>
                        <span style={{ fontSize:'0.68rem', fontWeight:700, color:OCEAN_PALETTE[idx % OCEAN_PALETTE.length], letterSpacing:'1.2px', textTransform:'uppercase' }}>
                          {course.platform}
                        </span>
                        <h4 style={{ color:'#ffffff', fontSize:'0.97rem', fontWeight:700, margin:'0.4rem 0 0.65rem', lineHeight:1.3 }}>{course.title}</h4>
                        <p style={{ color:'#e2e8f0', fontSize:'0.83rem', lineHeight:1.65, marginBottom:'1.1rem' }}>{course.description}</p>
                        <button className="btn"
                          style={{ width:'100%', padding:'0.55rem', fontSize:'0.8rem', background:'transparent', border:`1px solid ${OCEAN_PALETTE[idx % OCEAN_PALETTE.length]}30`, color:OCEAN_PALETTE[idx % OCEAN_PALETTE.length], boxShadow:'none' }}>
                          Acessar oferta <ArrowRight size={12} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Visão Holística */}
              {dashboardData.knowledge_areas?.length > 0 && (() => {
                const dynamic = dashboardData.knowledge_areas.map(ka => {
                  let r = 0;
                  dashboardData.daily_plan.forEach(day => day.tasks.forEach(t => {
                    if (completedTasks.has(t.id) && t.area === ka.name) r += t.duration;
                  }));
                  return { ...ka, total_hours: Math.max(0, ka.total_hours - r) };
                }).filter(ka => ka.total_hours > 0);

                if (dynamic.length === 0) return (
                  <div style={{ textAlign:'center', padding:'2rem', marginBottom:'3rem' }}>
                    <CheckCircle size={46} color="#2dd4bf" style={{ marginBottom:'0.75rem' }} />
                    <h3 style={{ color:'#2dd4bf', fontSize:'1.4rem' }}>Tudo concluído! 🎉</h3>
                  </div>
                );

                return (
                  <motion.section variants={fadeUp} style={{ marginBottom:'3.5rem' }}>
                    <OceanSectionHeading icon={<Compass size={17} color="white" />} bg="#0b7a6b" title="Visão holística" sub="Volume de estudo restante por área" />
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(290px, 1fr))', gap:'1.1rem' }}>
                      <div className="glass-card" style={{ padding:'1.4rem', minHeight:'320px', display:'flex', flexDirection:'column' }}>
                        <p style={{ color:'#cbd5e1', fontSize:'0.8rem', marginBottom:'0.5rem' }}>Complete dias e as bolhas murcham.</p>
                        <div style={{ flex:1 }}>
                          <ResponsiveContainer width="100%" height={270}>
                            <ScatterChart margin={{ top:30, right:30, bottom:30, left:30 }}>
                              <XAxis type="number" dataKey="x" hide domain={['dataMin - 15','dataMax + 15']} />
                              <YAxis type="number" dataKey="y" hide domain={['dataMin - 15','dataMax + 15']} />
                              <ZAxis type="number" dataKey="total_hours" range={[0, 5000]} />
                              <Tooltip content={<CustomTooltip />} cursor={false} />
                              <Scatter data={dynamic.map((ka, i) => {
                                const a = (i / dynamic.length) * Math.PI * 2;
                                return { ...ka, x: Math.cos(a) * 25, y: Math.sin(a) * 25 };
                              })}>
                                {dynamic.map((_, idx) => (
                                  <Cell key={idx} fill={OCEAN_PALETTE[idx % OCEAN_PALETTE.length]} opacity={0.82}
                                    style={{ filter:`drop-shadow(0 0 8px ${OCEAN_PALETTE[idx % OCEAN_PALETTE.length]}99)` }} />
                                ))}
                              </Scatter>
                            </ScatterChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem', maxHeight:'320px', overflowY:'auto' }}>
                        {dynamic.map((ka, idx) => (
                          <div key={idx} className="glass-card"
                            style={{ padding:'1rem 1.15rem', borderLeft:`3px solid ${OCEAN_PALETTE[idx % OCEAN_PALETTE.length]}` }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.2rem' }}>
                              <h4 style={{ color:'#ffffff', fontSize:'0.87rem', fontWeight:700 }}>{ka.name}</h4>
                              <span style={{ color:OCEAN_PALETTE[idx % OCEAN_PALETTE.length], fontWeight:700, fontSize:'0.78rem' }}>{ka.total_hours}h</span>
                            </div>
                            <p style={{ color:'#cbd5e1', fontSize:'0.78rem', lineHeight:1.55 }}>{ka.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.section>
                );
              })()}

              {/* Gantt */}
              {(() => {
                const gantt = dashboardData.daily_plan.map(day => {
                  const row = { name:`Dia ${day.day}`, _n:0 };
                  day.tasks.forEach(t => { if (!completedTasks.has(t.id)) { row[t.title] = t.duration; row._n++; } });
                  return row;
                }).filter(r => r._n > 0);
                if (gantt.length === 0) return null;
                const allTasks = Array.from(new Set(dashboardData.daily_plan.flatMap(d => d.tasks.map(t => t.title))));
                return (
                  <motion.section variants={fadeUp} style={{ marginBottom:'3.5rem' }}>
                    <OceanSectionHeading icon={<BarChart2 size={17} color="white" />} bg="#1a5276" title="Progresso mapeado" sub="Volume restante por dia" />
                    <div className="glass-card" style={{ padding:'1.5rem', height:'360px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={gantt} margin={{ top:8, right:20, left:8, bottom:8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.04)" horizontal={false} />
                          <XAxis type="number" stroke="#94a3b8" tick={{ fontSize:11, fill:'#cbd5e1' }} />
                          <YAxis dataKey="name" type="category" stroke="#94a3b8" width={60} tick={{ fontSize:11, fill:'#e2e8f0' }} />
                          <Tooltip contentStyle={{ backgroundColor:'rgba(2,12,24,0.95)', border:'1px solid rgba(0,212,255,0.2)', borderRadius:'10px' }} itemStyle={{ color:'#ffffff', fontSize:'0.8rem' }} />
                          <Legend wrapperStyle={{ paddingTop:'0.75rem', fontSize:'0.75rem', color:'#e2e8f0' }} />
                          {allTasks.map((t, i) => (
                            <Bar key={t} dataKey={t} stackId="a" fill={OCEAN_PALETTE[i % OCEAN_PALETTE.length]} radius={[0,3,3,0]} />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.section>
                );
              })()}

              {/* Checklist */}
              <motion.section variants={fadeUp}>
                <OceanSectionHeading icon={<CheckCircle size={17} color="white" />} bg="#005f8a" title="Checklist diário" sub="Marque as tarefas para atualizar seu progresso" />

                <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem' }}>
                  {[{ label:'Pendentes', v:false, c:'#00d4ff' }, { label:'Concluídos', v:true, c:'#2dd4bf' }].map(tab => (
                    <button key={tab.label} onClick={() => setShowCompletedDays(tab.v)}
                      style={{
                        padding:'0.45rem 1.1rem', borderRadius:'8px', cursor:'pointer', fontSize:'0.82rem', fontWeight:600,
                        border: showCompletedDays === tab.v ? `1px solid ${tab.c}35` : '1px solid rgba(0,212,255,0.08)',
                        background: showCompletedDays === tab.v ? `${tab.c}0e` : 'transparent',
                        color: showCompletedDays === tab.v ? tab.c : '#94a3b8',
                        transition:'all 0.2s ease',
                      }}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:'1.1rem', alignItems:'start' }}>
                  {dashboardData.daily_plan.map((day, idx) => {
                    const allDone = day.tasks.every(t => completedTasks.has(t.id));
                    if (showCompletedDays && !allDone) return null;
                    if (!showCompletedDays && allDone) return null;
                    const acc = DAY_COLORS[idx % DAY_COLORS.length];
                    return (
                      <motion.div key={day.day}
                        whileHover={{ y:-4, scale:1.01 }}
                        initial={{ opacity:0, scale:0.95 }}
                        animate={{ opacity:1, scale:1 }}
                        transition={{ delay:idx*0.04 }}
                        style={{
                          background:'rgba(4,20,38,0.72)',
                          backdropFilter:'blur(24px)',
                          border:`1px solid ${acc}18`,
                          borderTop:`2px solid ${allDone ? '#2dd4bf' : acc}`,
                          borderRadius:'16px',
                          padding:'1.15rem',
                          opacity: allDone ? 0.55 : 1,
                          transition:'opacity 0.3s ease',
                        }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.9rem', paddingBottom:'0.65rem', borderBottom:`1px solid ${acc}12` }}>
                          <span style={{ color:'#ffffff', fontWeight:700 }}>Dia {day.day}</span>
                          {allDone ? <CheckCircle size={16} color="#2dd4bf" /> : <AlertCircle size={16} color={acc} style={{ opacity:0.6 }} />}
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.45rem' }}>
                          {day.tasks.map(task => {
                            const done = completedTasks.has(task.id);
                            return (
                              <div key={task.id} onClick={() => toggleTask(task.id)}
                                style={{
                                  display:'flex', alignItems:'flex-start', gap:'0.6rem',
                                  padding:'0.6rem 0.7rem', borderRadius:'8px', cursor:'pointer',
                                  background: done ? 'rgba(45,212,191,0.04)' : 'rgba(0,212,255,0.02)',
                                  border:`1px solid ${done ? 'rgba(45,212,191,0.14)' : 'transparent'}`,
                                  transition:'all 0.2s ease',
                                  opacity: done ? 0.6 : 1,
                                }}>
                                <div className={`checkbox-custom ${done ? 'checked' : ''}`} style={{ marginTop:'2px' }}>
                                  {done && <Check size={12} color="white" />}
                                </div>
                                <div style={{ flex:1 }}>
                                  <span style={{
                                    display:'block', fontSize:'0.85rem', fontWeight:500, lineHeight:1.3,
                                    color: done ? '#cbd5e1' : '#f8fafc',
                                    textDecoration: done ? 'line-through' : 'none',
                                  }}>
                                    {task.title}
                                  </span>
                                  <span style={{ display:'flex', alignItems:'center', gap:'3px', color:'#94a3b8', fontSize:'0.72rem', marginTop:'0.15rem' }}>
                                    <Clock size={9} /> ~{task.duration}h
                                  </span>
                                </div>
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

      {/* Footer */}
      <footer style={{
        textAlign:'center', padding:'2rem 1.5rem',
        borderTop:'1px solid rgba(0,212,255,0.06)',
        color:'#94a3b8', fontSize:'0.76rem',
        position:'relative', zIndex:1,
      }}>
        © {new Date().getFullYear()} VibeStudy — Tecnologia a serviço da sua aprovação.
      </footer>

      {/* Ocean gradient keyframe inline */}
      <style>{`
        @keyframes oceanGradientMove {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </>
  );
}

/* ── Section Heading oceanico ───────────────────────────── */
function OceanSectionHeading({ icon, bg, title, sub }) {
  return (
    <div style={{ marginBottom:'1.4rem' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'0.7rem', marginBottom:'0.2rem' }}>
        <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          {icon}
        </div>
        <h2 style={{ fontSize:'1.35rem', fontWeight:700, color:'#ffffff', margin:0 }}>{title}</h2>
      </div>
      {sub && <p style={{ color:'#94a3b8', fontSize:'0.82rem', paddingLeft:'46px' }}>{sub}</p>}
    </div>
  );
}

export default App;
