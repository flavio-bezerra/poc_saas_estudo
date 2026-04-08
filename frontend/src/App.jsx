import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Check, Clock, Calendar, RefreshCw, CheckCircle, AlertCircle, BarChart2, Anchor, ShieldCheck, Compass, Cpu, Droplet, Lock, Mail } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend, Cell } from 'recharts';
import './index.css';

const API_BASE_URL = 'http://localhost:8000/api';

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-card" style={{ padding: '1rem', border: '1px solid var(--primary-color)' }}>
        <p style={{ color: '#bae6fd', fontWeight: 'bold' }}>{data.name}</p>
        <p style={{ color: '#fff', fontSize: '0.875rem', marginTop: '0.5rem' }}>{data.total_hours} horas recomendadas</p>
      </div>
    );
  }
  return null;
}

const MOCK_DASHBOARD_DATA = {
  total_estimated_hours: 120,
  daily_hours: 4,
  total_days: 30,
  knowledge_areas: [
    { name: "Direito Constitucional", description: "Princípios, direitos e garantias essenciais, além de organização do estado.", total_hours: 20 },
    { name: "Direito Administrativo", description: "Atos, poderes, administração pública e a nova lei de licitações.", total_hours: 25 },
    { name: "Língua Portuguesa", description: "Interpretação profunda de textos e forte domínio de análise sintática.", total_hours: 30 },
    { name: "Raciocínio Lógico Matemático", description: "Lógica proposicional, análises combinatórias e probabilidade estatística.", total_hours: 15 },
    { name: "Informática Básica", description: "Redes, segurança, conceitos virais de internet e banco de dados corporativo.", total_hours: 10 },
    { name: "Legislação Específica", description: "Regimentos estaduais, lei orgânica, direitos das autarquias locais.", total_hours: 20 }
  ],
  recommended_courses: [
    { title: "Série Pro: Carreiras Jurídicas", platform: "Estratégia Concursos", description: "Material denso de jurisprudência." },
    { title: "Assinatura Ilimitada Plus", platform: "Gran Cursos", description: "Centenas de matrizes de cursos em vídeo." },
    { title: "Projeto Focus (Direto ao ponto)", platform: "Direção Concursos", description: "PDFs diretos e mapas mentais ágeis sem poluição." },
    { title: "Plataforma Ilimitada de Questões", platform: "QConcursos", description: "Banco dinâmico com mais de milhões de testes baseados no seu edital." }
  ],
  daily_plan: [
    { day: 1, tasks: [ { id: "1", title: "Constituição Org.", duration: 2, completed: true, area: "Direito Constitucional" }, { id: "2", title: "Ortografia", duration: 2, completed: true, area: "Língua Portuguesa" } ] },
    { day: 2, tasks: [ { id: "3", title: "Atos Administrativos", duration: 1.5, completed: false, area: "Direito Administrativo" }, { id: "4", title: "Windows/Linux", duration: 1, completed: false, area: "Informática Básica" }, { id: "5", title: "Lógica", duration: 1.5, completed: false, area: "Raciocínio Lógico Matemático" } ] },
    { day: 3, tasks: [ { id: "6", title: "Licitações Lei", duration: 3, completed: false, area: "Direito Administrativo" }, { id: "7", title: "Excel Avançado", duration: 1, completed: false, area: "Informática Básica" } ] },
    { day: 4, tasks: [ { id: "8", title: "Sintaxe da Língua", duration: 2, completed: false, area: "Língua Portuguesa" }, { id: "9", title: "Licitações (Aprofundamento)", duration: 2, completed: false, area: "Direito Administrativo" } ] },
    { day: 5, tasks: [ { id: "10", title: "Regimes da Serventia", duration: 2.5, completed: false, area: "Legislação Específica" }, { id: "11", title: "Concordância Verbal", duration: 1.5, completed: false, area: "Língua Portuguesa" } ] },
    { day: 6, tasks: [ { id: "12", title: "Segurança de TI", duration: 2, completed: false, area: "Informática Básica" }, { id: "13", title: "Probabilidade Matemática", duration: 2, completed: false, area: "Raciocínio Lógico Matemático" } ] },
    { day: 7, tasks: [ { id: "14", title: "Simulado Geral e Revisão", duration: 4, completed: false, area: "Língua Portuguesa" } ] },
    { day: 8, tasks: [ { id: "15", title: "Garantias Constitucionais", duration: 2, completed: false, area: "Direito Constitucional" }, { id: "16", title: "Improbidade Administrativa", duration: 2, completed: false, area: "Direito Administrativo" } ] },
    { day: 9, tasks: [ { id: "17", title: "Redação e Tese", duration: 2, completed: false, area: "Língua Portuguesa" }, { id: "18", title: "Estatística Pura", duration: 2, completed: false, area: "Raciocínio Lógico Matemático" } ] },
    { day: 10, tasks: [ { id: "19", title: "Direitos Políticos", duration: 1.5, completed: false, area: "Direito Constitucional" }, { id: "20", title: "Bancos de Dados", duration: 1.5, completed: false, area: "Informática Básica" }, { id: "21", title: "Poder Executivo", duration: 1, completed: false, area: "Direito Administrativo" } ] }
  ]
};

function App() {
  const [appState, setAppState] = useState('landing'); // landing, login, upload, processing, dashboard
  const [file, setFile] = useState(null);
  const [hours, setHours] = useState(3);
  const [testDate, setTestDate] = useState('');
  const [taskId, setTaskId] = useState('');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [isReplanning, setIsReplanning] = useState(false);
  const [showCompletedDays, setShowCompletedDays] = useState(false);

  const handleLoadDemo = () => {
    setDashboardData(MOCK_DASHBOARD_DATA);
    setAppState('dashboard');
  };

  // Upload View handlers
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        alert("Por favor, envie um arquivo PDF do seu edital.");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('hours_per_day', hours);
    if (testDate) {
      formData.append('test_date', testDate);
    }

    try {
      setAppState('processing');
      setStatusMessage('Enviando edital...');
      setProgress(5);
      
      const response = await axios.post(`${API_BASE_URL}/upload`, formData);
      setTaskId(response.data.task_id);
    } catch (error) {
      console.error(error);
      alert('Erro ao enviar o edital.');
      setAppState('upload');
    }
  };

  // Processing View Polling
  useEffect(() => {
    let interval;
    if (appState === 'processing' && taskId) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/status/${taskId}`);
          setProgress(res.data.progress || 0);
          
          if (res.data.progress < 30) setStatusMessage('Limpando PDF e extraindo conteúdo chave...');
          else if (res.data.progress < 70) setStatusMessage('Orquestrando com IA: dividindo tópicos e estimando tempos...');
          else if (res.data.progress < 100) setStatusMessage('Montando seu cronograma ideal...');

          if (res.data.status === 'completed') {
            clearInterval(interval);
            setDashboardData(res.data.result);
            setTimeout(() => setAppState('dashboard'), 800);
          } else if (res.data.status === 'error') {
            clearInterval(interval);
            setStatusMessage('Erro no processamento. ' + res.data.message);
          }
        } catch (error) {
          console.error(error);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [appState, taskId]);

  // Dashboard handlers
  const toggleTask = (taskIdStr) => {
    const newSelected = new Set(completedTasks);
    if (newSelected.has(taskIdStr)) {
      newSelected.delete(taskIdStr);
    } else {
      newSelected.add(taskIdStr);
    }
    setCompletedTasks(newSelected);
  };

  const getOverallProgress = () => {
    if (!dashboardData) return 0;
    const totalTasks = dashboardData.daily_plan.reduce((acc, day) => acc + day.tasks.length, 0);
    if (totalTasks === 0) return 0;
    return Math.round((completedTasks.size / totalTasks) * 100);
  };

  const handleReplan = async () => {
    setIsReplanning(true);
    try {
      // Simulate replan api call
      const res = await axios.post(`${API_BASE_URL}/replan`, {
        missed_tasks: [],
        remaining_days: dashboardData.total_days,
        hours_per_day: hours,
        current_plan: dashboardData.daily_plan
      });
      alert(res.data.message);
    } catch (err) {
      console.error(err);
    }
    setIsReplanning(false);
  };

  return (
    <>
      <div className="bg-fluid"></div>
      <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
      <header className="top-bar" style={{ borderRadius: appState === 'dashboard' ? '0 0 16px 16px' : '0', marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', margin: 0 }}>
          <div style={{ background: 'var(--primary-color)', padding: '0.5rem', borderRadius: '8px' }}>
            <FileText size={20} color="white" />
          </div>
          Vibe<span style={{ color: 'var(--primary-color)' }}>Study</span>
        </h1>
        {appState === 'dashboard' && (
          <div className="progress-circle" style={{ '--p': `${getOverallProgress()}%` }}>
            <span>{getOverallProgress()}%</span>
          </div>
        )}
      </header>

      <main style={{ padding: '0 2rem 2rem' }}>
        <AnimatePresence mode="wait">
          {appState === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6rem' }}
            >
              {/* Hero Section */}
              <div style={{ textAlign: 'center', paddingTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', padding: '0.5rem 1rem', borderRadius: '100px', marginBottom: '2rem', color: '#38bdf8', fontWeight: 'bold' }}>
                  <Droplet size={16} /> Fluxo de Aprendizado Otimizado
                </div>
                <h2 style={{ fontSize: '4.5rem', fontWeight: 900, marginBottom: '1.5rem', color: 'white', lineHeight: 1.1, letterSpacing: '-1px' }}>
                  Navegue pelo seu Edital <br/>
                  <span style={{ 
                    background: 'linear-gradient(to right, #38bdf8, #34d399, #818cf8)', 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 40px rgba(56,189,248,0.3)'
                  }}>Como uma Onda.</span>
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '1.25rem', maxWidth: '750px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
                  A VibeStudy transforma o caos de páginas densas e leis secas em uma correnteza clara de metas diárias. 
                  Confiável, analítica e guiada por uma frota de Inteligências Artificiais.
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button 
                    className="btn" 
                    style={{ padding: '1.25rem 3rem', fontSize: '1.1rem', background: 'linear-gradient(135deg, #0284c7, #3b82f6)' }}
                    onClick={() => setAppState('login')}
                  >
                    Acessar Plataforma
                  </button>
                  <button 
                    className="btn" 
                    style={{ padding: '1.25rem 3rem', fontSize: '1.1rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8', boxShadow: 'none' }}
                    onClick={handleLoadDemo}
                  >
                    Testar Demo Aberto
                  </button>
                </div>
              </div>

              {/* Trust & Features Section */}
              <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <h3 style={{ textAlign: 'center', fontSize: '2rem', color: 'white', marginBottom: '3rem' }}>A Tecnologia por Trás da Fluidez</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                  
                  <div className="glass-card day-card" style={{ padding: '2rem', borderTop: '2px solid #38bdf8' }}>
                    <div style={{ background: 'rgba(56, 189, 248, 0.1)', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                      <Compass size={32} color="#38bdf8" />
                    </div>
                    <h4 style={{ fontSize: '1.3rem', color: 'white', marginBottom: '1rem' }}>Sempre no Norte Correto</h4>
                    <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Os editais de aprovação são vastos e confusos. Nossa inteligência encontra a bússola exata, cruzando sua carga horária com as matérias que representam o maior peso estatístico da banca.</p>
                  </div>

                  <div className="glass-card day-card" style={{ padding: '2rem', borderTop: '2px solid #34d399' }}>
                    <div style={{ background: 'rgba(52, 211, 153, 0.1)', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                      <Anchor size={32} color="#34d399" />
                    </div>
                    <h4 style={{ fontSize: '1.3rem', color: 'white', marginBottom: '1rem' }}>Ancoragem no Mercado</h4>
                    <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Não basta ter um cronograma vazio. O VibeStudy procura ativamente os melhores cursinhos focados na sua área de concurso (Estratégia, Gran, Direção) e recomenda os materiais magnos que cobrem o seu edital perfeitamente.</p>
                  </div>

                  <div className="glass-card day-card" style={{ padding: '2rem', borderTop: '2px solid #a78bfa' }}>
                    <div style={{ background: 'rgba(167, 139, 250, 0.1)', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                      <ShieldCheck size={32} color="#a78bfa" />
                    </div>
                    <h4 style={{ fontSize: '1.3rem', color: 'white', marginBottom: '1rem' }}>Segurança & Privacidade</h4>
                    <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Todas as informações enviadas e calculadas via API Neural obedecem a padrões rigorosos. Seu estilo de vida e dados de tempo são expurgados da rede neural após a geração do micro-cronograma final.</p>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {appState === 'login' && (
            <motion.div 
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}
            >
              <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '3rem 2.5rem' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'white', textAlign: 'center' }}>
                  Acesse o Mar.
                </h2>
                <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '3rem' }}>Conecte-se para mergulhar no seu cronograma.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#bae6fd', fontWeight: 600, marginBottom: '0.5rem' }}>
                      <Mail size={16} /> E-mail Profissional
                    </label>
                    <input type="email" placeholder="nome@exemplo.com" style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', fontSize: '1rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#bae6fd', fontWeight: 600, marginBottom: '0.5rem' }}>
                      <Lock size={16} /> Senha Segura
                    </label>
                    <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', fontSize: '1rem' }} />
                  </div>
                  <button 
                    className="btn" 
                    style={{ padding: '1.25rem', fontSize: '1.1rem', background: 'linear-gradient(135deg, #0284c7, #3b82f6)', marginTop: '1rem' }}
                    onClick={() => setAppState('upload')}
                  >
                    Mergulhar
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {appState === 'upload' && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '2rem' }}
            >
              <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', color: 'white', textAlign: 'center' }}>
                Área de <span style={{ color: 'var(--primary-color)' }}>Ancoragem</span>
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', textAlign: 'center', marginBottom: '3rem' }}>
                Faça o upload do documento bruto do seu edital de concurso. Nossa rede de Agentes de IA vai mastigar e converter em plano focado.
              </p>

              {/* Upload Engine Box */}
              <div className="glass-card" style={{ width: '100%', maxWidth: '750px', padding: '2.5rem', position: 'relative', border: '1px solid rgba(56, 189, 248, 0.3)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(56, 189, 248, 0.1)' }}>
                <div style={{ position: 'absolute', top: '-1px', left: '10%', width: '80%', height: '2px', background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)' }}></div>
                
                <div 
                  className="file-drop-area"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  style={{ marginBottom: '2rem', background: file ? 'rgba(56, 189, 248, 0.05)' : 'rgba(0,0,0,0.2)' }}
                >
                  {!file ? (
                    <>
                      <UploadCloud size={48} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
                      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.3rem' }}>Ancore seu Edital em PDF aqui</h3>
                      <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>E deixe a maré da IA organizar tudo.</p>
                      <input 
                        type="file" 
                        id="file-upload" 
                        accept=".pdf" 
                        style={{ display: 'none' }} 
                        onChange={handleFileChange}
                      />
                      <label htmlFor="file-upload" className="btn" style={{ background: 'var(--primary-color)', color: '#fff', padding: '0.75rem 2rem' }}>
                        Navegar Arquivos
                      </label>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ background: 'rgba(5, 150, 105, 0.1)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1rem', boxShadow: '0 0 20px var(--success-glow)' }}>
                        <FileText size={40} color="var(--success-color)" />
                      </div>
                      <h3 style={{ color: 'var(--success-color)', fontSize: '1.2rem' }}>{file.name}</h3>
                      <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0.5rem 0 1.5rem' }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB - Preparado para extração
                      </p>
                      <button className="btn" style={{ background: 'transparent', border: '1px solid var(--danger-color)', color: 'var(--danger-color)', boxShadow: 'none', padding: '0.5rem 1rem' }} onClick={() => setFile(null)}>
                        Trocar Arquivo
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', textAlign: 'left' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#bae6fd', fontWeight: 600, fontSize: '0.9rem' }}>Horas Livres por Dia</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <input 
                        type="range" min="1" max="12" step="0.5" value={hours} 
                        onChange={(e) => setHours(parseFloat(e.target.value))}
                        style={{ flex: 1, accentColor: 'var(--primary-color)' }}
                      />
                      <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '1.1rem', minWidth: '40px', textAlign: 'right' }}>{hours}h</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#bae6fd', fontWeight: 600, fontSize: '0.9rem' }}>Data da Prova (Opcional)</label>
                    <input 
                      type="date"
                      value={testDate}
                      onChange={(e) => setTestDate(e.target.value)}
                      style={{ 
                        width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', 
                        border: '1px solid rgba(255,255,255,0.05)', color: 'white', fontSize: '0.95rem',
                        fontFamily: 'inherit', colorScheme: 'dark'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                  <button 
                    className="btn" 
                    style={{ flex: 1, padding: '1.25rem', fontSize: '1.1rem', background: 'linear-gradient(135deg, #0284c7, #3b82f6)' }}
                    disabled={!file}
                    onClick={handleUpload}
                  >
                    <Cpu size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> 
                    Processar VibeStudy
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {appState === 'processing' && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="glass-card"
              style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center', padding: '4rem 2rem' }}
            >
              <div style={{ display: 'inline-block', position: 'relative', marginBottom: '2rem' }}>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  style={{ 
                    width: '80px', height: '80px', 
                    borderRadius: '50%', 
                    border: '4px solid rgba(59, 130, 246, 0.2)',
                    borderTopColor: 'var(--primary-color)'
                  }}
                />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {progress}%
                </div>
              </div>
              
              <h2 style={{ marginBottom: '0.5rem' }}>Analisando Edital</h2>
              <p style={{ color: '#94a3b8' }}>{statusMessage}</p>
              
              <div className="progress-bar-container" style={{ marginTop: '2rem', background: 'rgba(0,0,0,0.3)' }}>
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </motion.div>
          )}

          {appState === 'dashboard' && dashboardData && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                    <Calendar color="var(--primary-color)" />
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Duração Total</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{dashboardData.total_days} dias</div>
                  </div>
                </div>
                
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                    <Clock color="var(--success-color)" />
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Ritmo</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{dashboardData.daily_hours}h / dia</div>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <button 
                    className="btn" 
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)' }}
                    onClick={handleReplan}
                    disabled={isReplanning}
                  >
                    <RefreshCw size={18} className={isReplanning ? "spin-anim" : ""} />
                    {isReplanning ? "Recalculando..." : "Caiu no atraso? Replanejar"}
                  </button>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', textAlign: 'center' }}>
                    Ajuste automático para evitar sobrecarga.
                  </p>
                </div>
              </div>
              {/* Recommended Courses Section (Moved up for Monetization Business Core) */}
              {dashboardData.recommended_courses && dashboardData.recommended_courses.length > 0 && (
                <div style={{ marginTop: '0rem', marginBottom: '4rem' }}>
                  <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--primary-color)', padding: '0.5rem', borderRadius: '12px', boxShadow: '0 0 15px var(--primary-color)' }}>
                      <FileText size={24} color="white" />
                    </div>
                    Curadoria Estratégica Inversa (O Core)
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '2rem', marginTop: '-0.5rem' }}>
                    Baseado no seu edital, estas são as plataformas que indicamos pra fechar a grade.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {dashboardData.recommended_courses.map((course, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="glass-card" 
                        key={idx} 
                        style={{ borderTop: '4px solid #38bdf8', position: 'relative', overflow: 'hidden' }}
                      >
                        <div style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(56, 189, 248, 0.2)', padding: '0.5rem 1rem', borderBottomLeftRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', color: '#e0f2fe' }}>
                          RECOMENDADO
                        </div>
                        <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#e0f2fe', paddingRight: '4rem' }}>{course.title}</h4>
                        <p style={{ color: '#38bdf8', fontWeight: 'bold', marginBottom: '1rem', fontSize: '0.875rem' }}>{course.platform}</p>
                        <p style={{ color: '#cbd5e1', lineHeight: 1.5, fontSize: '0.95rem' }}>{course.description}</p>
                        
                        <button className="btn" style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem', fontSize: '0.9rem', background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}>
                          Acessar Oferta
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              {/* Visão Holística Section */}
              {dashboardData.knowledge_areas && dashboardData.knowledge_areas.length > 0 && (() => {
                const dynamicKnowledgeAreas = dashboardData.knowledge_areas.map(ka => {
                  let hoursReduced = 0;
                  dashboardData.daily_plan.forEach(day => {
                    day.tasks.forEach(t => {
                       // Se a tarefa foi completa, reduzimos o volume da bolha equivalente à duração dela
                       if (completedTasks.has(t.id) && t.area === ka.name) {
                          hoursReduced += t.duration;
                       }
                    });
                  });
                  return { ...ka, total_hours: Math.max(0, ka.total_hours - hoursReduced) };
                }).filter(ka => ka.total_hours > 0);

                if (dynamicKnowledgeAreas.length === 0) {
                  return (
                    <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
                      <h2 style={{ fontSize: '2rem', color: '#34d399' }}>Visão Holística Zerada! Você completou tudo! 🎉</h2>
                    </div>
                  );
                }

                return (
                  <div style={{ marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ background: 'var(--success-color)', padding: '0.5rem', borderRadius: '12px' }}>
                        <Calendar size={24} color="white" />
                      </div>
                      Visão Holística (Remanescente)
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                      
                      {/* Bubble Chart */}
                      <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ color: '#38bdf8', marginBottom: '1rem' }}>Volume Faltante (Conhecimento Alvo)</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>Complete dias e veja as bolhas murcharem sumindo conforme adquire conhecimento!</p>
                        <div style={{ flex: 1, position: 'relative' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 50, right: 50, bottom: 50, left: 50 }}>
                              <XAxis type="number" dataKey="x" name="peso_x" hide domain={['dataMin - 15', 'dataMax + 15']} />
                              <YAxis type="number" dataKey="y" name="peso_y" hide domain={['dataMin - 15', 'dataMax + 15']} />
                              <ZAxis type="number" dataKey="total_hours" range={[0, 6000]} name="horas" />
                              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                              <Scatter 
                                name="Matérias" 
                                data={dynamicKnowledgeAreas.map((ka, i) => {
                                  const angle = (i / dynamicKnowledgeAreas.length) * Math.PI * 2;
                                  return { 
                                    ...ka, 
                                    x: Math.cos(angle) * (20 + Math.random() * 10), 
                                    y: Math.sin(angle) * (20 + Math.random() * 10) 
                                  };
                                })} 
                              >
                                {dynamicKnowledgeAreas.map((entry, index) => {
                                  const colors = ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#a78bfa', '#2dd4bf'];
                                  return (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={colors[index % colors.length]} 
                                      opacity={0.85} 
                                      style={{ filter: `drop-shadow(0px 0px 12px ${colors[index % colors.length]}66)` }}
                                    />
                                  );
                                })}
                              </Scatter>
                            </ScatterChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Descriptions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {dynamicKnowledgeAreas.map((ka, idx) => (
                          <div key={idx} className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
                            <h4 style={{ color: '#10b981', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{ka.name}</h4>
                            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5 }}>{ka.description}</p>
                            <div style={{ marginTop: '0.75rem', color: '#38bdf8', fontWeight: 'bold', fontSize: '0.8rem' }}>
                              Falta: {ka.total_hours}H
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* Gantt / Cronograma Visual Chart */}
              {(() => {
                const ganttData = dashboardData.daily_plan.map(day => {
                  const row = { name: `Dia ${day.day}`, activeTasksCount: 0 };
                  day.tasks.forEach(t => {
                    if (!completedTasks.has(t.id)) {
                       row[t.title] = t.duration;
                       row.activeTasksCount++;
                    }
                  });
                  return row;
                }).filter(r => r.activeTasksCount > 0);
                
                if (ganttData.length === 0) return null;

                const allTasks = Array.from(new Set(dashboardData.daily_plan.flatMap(d => d.tasks.map(t => t.title))));
                const colors = ['#38bdf8', '#10b981', '#6366f1', '#f43f5e', '#f59e0b', '#8b5cf6'];

                return (
                  <div style={{ marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ background: '#6366f1', padding: '0.5rem', borderRadius: '12px' }}>
                        <BarChart2 size={24} color="white" />
                      </div>
                      Restante Mapeado (Progresso Gantt)
                    </h2>
                    <div className="glass-card" style={{ height: '400px', width: '100%', padding: '1rem' }}>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Esse gráfico retrai e queima o volume listado todos os dias concluídos.</p>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={ganttData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                          <XAxis type="number" stroke="#94a3b8" />
                          <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#38bdf8', borderRadius: '8px' }} 
                            itemStyle={{ color: '#fff' }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          {allTasks.map((title, i) => (
                            <Bar key={title} dataKey={title} stackId="a" fill={colors[i % colors.length]} radius={[0, 4, 4, 0]} />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })()}

              <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', marginTop: '2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 Seu Checklist Diário Prático
              </h2>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button 
                  onClick={() => setShowCompletedDays(false)}
                  style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', background: !showCompletedDays ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid ' + (!showCompletedDays ? 'transparent' : 'rgba(255,255,255,0.1)'), fontWeight: 'bold', transition: 'all 0.2s' }}>
                  Pendentes
                </button>
                <button 
                  onClick={() => setShowCompletedDays(true)}
                  style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', background: showCompletedDays ? 'var(--success-color)' : 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid ' + (showCompletedDays ? 'transparent' : 'rgba(255,255,255,0.1)'), fontWeight: 'bold', transition: 'all 0.2s' }}>
                  Arquivados (Concluídos)
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
                {dashboardData.daily_plan.map((day, idx) => {
                  const allDayTasksCompleted = day.tasks.every(t => completedTasks.has(t.id));
                  
                  // Lógica de Abas
                  if (showCompletedDays && !allDayTasksCompleted) return null;
                  if (!showCompletedDays && allDayTasksCompleted) return null;
                  
                  const postitColors = [
                    'rgba(56, 189, 248, 0.1)', 
                    'rgba(52, 211, 153, 0.1)', 
                    'rgba(167, 139, 250, 0.1)', 
                    'rgba(251, 113, 133, 0.1)', 
                    'rgba(250, 204, 21, 0.1)'   
                  ];
                  const borderColors = ['#38bdf8', '#34d399', '#a78bfa', '#fb7185', '#facc15'];
                  const colorIdx = idx % postitColors.length;

                  return (
                    <motion.div 
                      whileHover={{ scale: 1.02, y: -5 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      key={day.day}
                      style={{ 
                        background: postitColors[colorIdx], 
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${borderColors[colorIdx]}40`,
                        borderTop: `4px solid ${allDayTasksCompleted ? 'var(--success-color)' : borderColors[colorIdx]}`,
                        borderRadius: '0 0.5rem 0.5rem 0.5rem', 
                        padding: '1.5rem',
                        boxShadow: `0 4px 6px -1px rgba(0,0,0,0.1), 3px -3px 0px ${borderColors[colorIdx]}20`,
                        position: 'relative',
                        opacity: allDayTasksCompleted ? 0.6 : 1
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: -1, right: -1, width: 0, height: 0,
                        borderBottom: `20px solid ${borderColors[colorIdx]}40`,
                        borderRight: '20px solid transparent'
                      }} />
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: `1px dashed ${borderColors[colorIdx]}80`, paddingBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 'bold' }}>
                          Dia {day.day}
                        </h3>
                        {allDayTasksCompleted ? <CheckCircle color="var(--success-color)" size={24} /> : <AlertCircle color={borderColors[colorIdx]} size={24} />}
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {day.tasks.map(task => {
                          const isDone = completedTasks.has(task.id);
                          return (
                            <div 
                              key={task.id} 
                              onClick={() => toggleTask(task.id)}
                              style={{ 
                                display: 'flex', flexDirection: 'column',
                                cursor: 'pointer',
                                background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px',
                                opacity: isDone ? 0.5 : 1, transition: 'all 0.2s ease',
                                borderLeft: `3px solid ${isDone ? 'var(--success-color)' : borderColors[colorIdx]}`
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <div className={`checkbox-custom ${isDone ? 'checked' : ''}`} style={{ flexShrink: 0, marginTop: '2px' }}>
                                  {isDone && <Check size={16} color="white" />}
                                </div>
                                <span style={{ fontWeight: 500, fontSize: '0.95rem', textDecoration: isDone ? 'line-through' : 'none', color: isDone ? '#94a3b8' : '#e2e8f0', lineHeight: 1.3 }}>
                                  {task.title}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.5rem', marginLeft: '1.75rem' }}>
                                <Clock size={12} />
                                ~{task.duration}h
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )
                })}
              </div>


            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <style>{`
        .spin-anim {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
    </>
  );
}

export default App;
