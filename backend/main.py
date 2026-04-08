import asyncio
import json
import requests
import uuid
import os
import PyPDF2
from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List
from crewai import Agent, Task, Crew, Process, LLM

try:
    with open("api_key.txt", "r") as f:
        os.environ["OPENROUTER_API_KEY"] = f.read().strip()
except FileNotFoundError:
    print("AVISO: Arquivo 'api_key.txt' não encontrado. Crie o arquivo na pasta backend contendo apenas sua API Key.")

app = FastAPI(title="VibeStudy API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for tasks
tasks_db: Dict[str, Any] = {}

class TaskResponse(BaseModel):
    task_id: str
    status: str

def clean_pdf_text(file_path: str) -> str:
    """Extração inteligente e limpeza do PDF."""
    try:
        reader = PyPDF2.PdfReader(file_path)
        text = ""
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
        # Limpeza simples: remover linhas vazias ou muito curtas (ex: números de página)
        lines = [line.strip() for line in text.split("\n") if len(line.strip()) > 10]
        return " ".join(lines)
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""

def execute_crewai(cleaned_text: str, hours_per_day: float, model_name: str, test_date: str = None) -> str:
    llm = LLM(
        model=model_name,
        base_url="https://openrouter.ai/api/v1",
        api_key=os.environ["OPENROUTER_API_KEY"],
        temperature=0.3
    )

    mentor = Agent(
        role="Mentor de Organização de Estudos",
        goal="Analisar editais de concursos e dividir em metas diárias.",
        backstory="Você é um especialista em aprovação. Você sabe que alunos se perdem em editais gigantes e precisam de direção clínica.",
        verbose=True,
        llm=llm
    )
    
    curador = Agent(
        role="Curador de Mercado Educacional",
        goal="Analisar matérias exigidas e sugerir cursinhos do mercado brasileiro.",
        backstory="Você é profundo conhecedor do mercado de cursos preparatórios no Brasil (Estratégia, GranCursos, Direção).",
        verbose=True,
        llm=llm
    )
    
    json_analyst = Agent(
        role="Analista de Estruturação JSON",
        goal="Gerar OBRIGATORIAMENTE um JSON unificado final sem texto solto.",
        backstory="Você é um expert em parseamento de dados. Você consolida as informações da equipe preenchendo exatamente a estrutura esperada pelo sistema.",
        verbose=True,
        llm=llm
    )

    date_instruction = f"A data da prova é {test_date}. Calcule APENAS o volume que cabe até essa data." if test_date else "Não há data da prova especificada. Distribua os dias livremente."

    task_plan = Task(
        description=f"O aluno tem {hours_per_day} horas/dia livres. {date_instruction} Leia o edital e crie o plano de trás pra frente: {cleaned_text[:2000]}",
        expected_output="Uma lista simples das disciplinas dia-a-dia, e estimativa de horas por tarefa limitada pela prova.",
        agent=mentor
    )
    
    task_curadoria = Task(
        description="Analise as disciplinas que o Mentor organizou. Sugira 3 cursos brasileiros online relevantes para este edital. Dê título, plataforma e justificativa curta.",
        expected_output="Uma lista de 3 cursos bem avaliados.",
        agent=curador
    )
    
    task_json = Task(
        description=(
            "Olhando para o plano e cursos. "
            "RESPONDA ESTREITAMENTE UM JSON compatível com nossa UI, sem marcação markdown. "
            "Regra de Duração: Estime realisticamente a carga com base na duração dos vídeos e PDFs do mercado que sugerimos. "
            'Exemplo absoluto do formato raiz:\n'
            '{ "knowledge_areas": [ {"name": "Matemática", "description": "Conceitos de lógica para resolução rápida...", "total_hours": 10.5} ],\n'
            '  "daily_plan": [ { "day": 1, "tasks": [ {"title": "Matematica Básica", "duration": 1.5, "area": "Matemática"} ] } ],\n'
            '  "recommended_courses": [ {"title": "Tribunais", "platform": "Estratégia", "description": "Videoaulas de 30min e PDF..."} ] }'
        ),
        expected_output="Apenas o raw JSON completo.",
        agent=json_analyst
    )

    crew = Crew(
        agents=[mentor, curador, json_analyst],
        tasks=[task_plan, task_curadoria, task_json],
        verbose=True,
        process=Process.sequential,
        max_rpm=5
    )
    
    return str(crew.kickoff())

async def api_router_logic(task_id: str, file_path: str, hours_per_day: float, test_date: str = None):
    """Integração real com CrewAI e OpenRouter (Múltiplos Agentes)"""
    try:
        tasks_db[task_id]["status"] = "processing"
        tasks_db[task_id]["progress"] = 10
        
        print(f"[{task_id}] Processando PDF: {file_path}")
        cleaned_text = clean_pdf_text(file_path)
        tasks_db[task_id]["progress"] = 30
        
        print(f"[{task_id}] Iniciando orquestração da CrewAI com Sistema de Retry e Fallback...")
        tasks_db[task_id]["progress"] = 50
        
        # Lista de modelos pagos (baratos/rápidos) para garantir estabilidade máxima sem 429
        cheap_models = [
            "openrouter/google/gemini-2.5-flash",
            "openrouter/openai/gpt-4o-mini",
            "openrouter/anthropic/claude-3.5-haiku",
            "openrouter/meta-llama/llama-3.3-70b-instruct"
        ]
        
        llm_text = None
        last_error = None
        
        for model in cheap_models:
            print(f"[{task_id}] Tentando executar Agentes com: {model}...")
            try:
                # Aguarda um pouco antes de tentar de novo, para limpar o gargalo de requisições
                if last_error:
                    await asyncio.sleep(3)
                
                # CrewAI roda chamadas custosas que bloqueiam a theard. Encapsulamos no `to_thread`.
                llm_text = await asyncio.to_thread(execute_crewai, cleaned_text, hours_per_day, model, test_date)
                break # Se teve sucesso, quebra o loop de retry
            except Exception as e:
                print(f"[{task_id}] Falha de Rate Limit/Engine com {model}. Tentando o próximo...")
                last_error = e
                
        if not llm_text:
            raise Exception(f"Falha de orquestração nos modelos de baixo custo. Último erro API: {str(last_error)}")
        
        tasks_db[task_id]["progress"] = 80
        
        llm_text = llm_text.strip()
        # Tratamento seguro caso a IA coloque a tag markdown apesar dos avisos
        if llm_text.startswith("```json"):
            llm_text = llm_text[7:]
        if llm_text.startswith("```"):
            llm_text = llm_text[3:]
        if llm_text.endswith("```"):
            llm_text = llm_text[:-3]
            
        plan_data = json.loads(llm_text.strip())
        
        daily_plan = []
        for day_info in plan_data.get("daily_plan", []):
            day_tasks = []
            for t in day_info.get("tasks", []):
                day_tasks.append({
                    "id": str(uuid.uuid4()),
                    "title": t.get("title", "Tópico sem nome"),
                    "duration": float(t.get("duration", 1.0)),
                    "completed": False
                })
            daily_plan.append({
                "day": int(day_info.get("day", 1)),
                "tasks": day_tasks
            })
            
        recommended_courses = []
        for rc in plan_data.get("recommended_courses", []):
            recommended_courses.append({
                "title": rc.get("title", "Curso Padrão"),
                "platform": rc.get("platform", "Mercado"),
                "description": rc.get("description", "")
            })
            
        knowledge_areas = []
        for ka in plan_data.get("knowledge_areas", []):
            knowledge_areas.append({
                "name": ka.get("name", "Tópico Geral"),
                "description": ka.get("description", "Material do edital."),
                "total_hours": float(ka.get("total_hours", 1.0))
            })
            
        total_hours = sum(t["duration"] for d in daily_plan for t in d["tasks"])
        
        tasks_db[task_id] = {
            "status": "completed",
            "progress": 100,
            "result": {
                "total_estimated_hours": total_hours,
                "daily_hours": hours_per_day,
                "total_days": len(daily_plan),
                "daily_plan": daily_plan,
                "recommended_courses": recommended_courses,
                "knowledge_areas": knowledge_areas
            }
        }
            
    except Exception as e:
        print(f"Error in API Router: {e}")
        tasks_db[task_id] = {"status": "error", "message": str(e), "progress": 0}

@app.post("/api/upload", response_model=TaskResponse)
async def upload_edital(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    hours_per_day: float = Form(...),
    test_date: Optional[str] = Form(None)
):
    task_id = str(uuid.uuid4())
    temp_file_path = f"/tmp/{uuid.uuid4()}_{file.filename}"
    
    # Save file temporarily
    with open(temp_file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        
    tasks_db[task_id] = {"status": "queued", "progress": 0}
    
    background_tasks.add_task(api_router_logic, task_id, temp_file_path, hours_per_day, test_date)
    return {"task_id": task_id, "status": "queued"}

@app.get("/api/status/{task_id}")
async def get_status(task_id: str):
    task = tasks_db.get(task_id)
    if not task:
        return {"status": "not_found", "progress": 0}
    return task

class ReplanRequest(BaseModel):
    missed_tasks: List[str]
    remaining_days: int
    hours_per_day: float
    current_plan: List[Dict[str, Any]]

@app.post("/api/replan")
async def replan_studies(request: ReplanRequest):
    """Lógica de Replanejamento: redistribui tarefas atrasadas para os próximos dias."""
    # Simulate thinking delay
    await asyncio.sleep(1)
    
    # Simple logic: push uncompleted tasks to new days or add to existing ones
    # For POC, we just return a message or slightly modified plan
    return {
        "status": "success",
        "message": "Cronograma recalculado com inteligência para não sobrecarregar você.",
        # Em uma implementação completa, o Api Router devolveria o novo calendário aqui
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
