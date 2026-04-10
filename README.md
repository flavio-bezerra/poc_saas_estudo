# 📚 Plataforma Inteligente de Estudos com IA

<div align="center">

  ![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=white)
  ![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=for-the-badge&logo=fastapi&logoColor=white)
  ![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-8.0.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)

  **Uma aplicação SaaS moderna para otimização de estudos usando Inteligência Artificial**
</div>

![vibestudy](vibestudy.gif)

## 🎯 Sobre o Projeto

VibeStudy é uma plataforma inovadora que utiliza IA para transformar materiais de estudo em PDF em conteúdo interativo e personalizado. Desenvolvida para estudantes e concurseiros, a aplicação oferece análise inteligente de documentos, geração de resumos, questões e insights personalizados.

!

### ✨ Principais Funcionalidades

- 📄 **Upload e Processamento de PDFs** - Extração inteligente de conteúdo de documentos
- 🤖 **Análise com IA** - Processamento usando modelos avançados via OpenRouter API
- 📊 **Visualizações Interativas** - Gráficos e métricas de progresso com Recharts
- 🎨 **Interface Moderna** - Design responsivo com animações Framer Motion
- ⚡ **Performance Otimizada** - Frontend com Vite e backend assíncrono com FastAPI
- 🔄 **Processamento em Background** - Tasks assíncronas para análise de documentos

## 🏗️ Arquitetura

```
poc_saas_estudo/
├── backend/                 # API FastAPI
│   ├── main.py             # Servidor principal e endpoints
│   ├── requirements.txt    # Dependências Python
│   ├── api_key.txt        # Chave API OpenRouter (não versionada)
│   └── test_req.py        # Scripts de teste
│
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── App.jsx        # Componente principal
│   │   ├── App.css        # Estilos da aplicação
│   │   ├── main.jsx       # Entry point React
│   │   └── assets/        # Recursos estáticos
│   ├── public/            # Arquivos públicos
│   ├── package.json       # Dependências Node.js
│   └── vite.config.js     # Configuração Vite
│
├── iniciar_projeto.bat    # Script de inicialização Windows
└── README.md             # Este arquivo
```

## 🚀 Tecnologias Utilizadas

### Backend

- **FastAPI** - Framework web moderno e rápido para APIs
- **PyPDF2** - Extração de texto de arquivos PDF
- **CrewAI** - Orquestração de agentes de IA
- **OpenRouter API** - Acesso a modelos de linguagem avançados
- **Uvicorn** - Servidor ASGI de alta performance

### Frontend

- **React 19** - Biblioteca para construção de interfaces
- **Vite** - Build tool e dev server ultra-rápido
- **Framer Motion** - Animações fluidas e interativas
- **Recharts** - Visualização de dados e gráficos
- **Axios** - Cliente HTTP para comunicação com API
- **Lucide React** - Ícones modernos e customizáveis
- **Canvas Confetti** - Efeitos visuais de celebração

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ e npm/yarn
- Python 3.8+
- Chave de API do OpenRouter

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/poc_saas_estudo.git
cd poc_saas_estudo
```

### 2. Configure o Backend

```bash
# Navegue para o diretório backend
cd backend

# Crie um ambiente virtual (recomendado)
python -m venv venv

# Ative o ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Configure sua API Key
echo "sua-chave-openrouter-aqui" > api_key.txt
```

### 3. Configure o Frontend

```bash
# Navegue para o diretório frontend
cd ../frontend

# Instale as dependências
npm install
# ou
yarn install
```

## 🎮 Como Usar

### Iniciar o projeto completo (Windows)

```bash
# Na raiz do projeto
iniciar_projeto.bat
```

### Ou iniciar manualmente:

#### Backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm run dev
# ou
yarn dev
```

A aplicação estará disponível em:

- Frontend: http://localhost:5173
- API Backend: http://localhost:8000
- Documentação API: http://localhost:8000/docs

## 🔧 Configuração

### API Key OpenRouter

1. Obtenha uma chave em [OpenRouter](https://openrouter.ai/)
2. Crie o arquivo `backend/api_key.txt`
3. Cole sua chave no arquivo (apenas a chave, sem espaços)

### Variáveis de Ambiente (Opcional)

Você pode configurar a API key via variável de ambiente:

```bash
export OPENROUTER_API_KEY="sua-chave-aqui"
```

## 📱 Funcionalidades Detalhadas

### Upload de Documentos

- Suporte para arquivos PDF
- Extração inteligente de texto
- Limpeza e preprocessamento automático

### Análise com IA

- Geração de resumos executivos
- Criação de questões de estudo
- Identificação de conceitos-chave
- Sugestões de aprofundamento

### Dashboard Interativo

- Visualização de progresso
- Métricas de desempenho
- Gráficos interativos
- Animações e feedback visual

## 🛠️ Desenvolvimento

### Estrutura de Componentes React

```jsx
App.jsx
├── AerialOceanBG (Background animado)
├── VibeVectorLogo (Componente de logo)
├── Dashboard Principal
│   ├── Upload de Arquivos
│   ├── Status de Processamento
│   ├── Visualizações de Dados
│   └── Resultados da Análise
```

### Endpoints da API

- `POST /api/upload` - Upload e processamento de PDF
- `GET /api/task/{task_id}` - Status da tarefa
- `GET /api/results/{task_id}` - Resultados da análise

## 🧪 Testes

```bash
# Backend
cd backend
python test_req.py

# Frontend
cd frontend
npm run lint
```

## 📈 Roadmap

- [ ] Suporte para mais formatos de arquivo (DOCX, TXT)
- [ ] Sistema de autenticação e usuários
- [ ] Histórico de análises
- [ ] Export de resultados (PDF, JSON)
- [ ] Modo offline
- [ ] App mobile (React Native)
- [ ] Integração com LMS (Moodle, Canvas)
- [ ] Gamificação e badges

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

  ⭐ Se este projeto te ajudou, considere dar uma estrela!

</div>
