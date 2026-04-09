@echo off
echo ==============================================
echo Iniciando VibeStudy (Frontend + Backend)
echo ==============================================

set "PROJECT_DIR=%~dp0"

echo.
echo [1/2] Iniciando o Backend (API FastAPI)...
cd /d "%PROJECT_DIR%backend"
start "VibeStudy" cmd /k "call .venv\Scripts\activate && python main.py"

echo.
echo [2/2] Iniciando o Frontend...
cd /d "%PROJECT_DIR%frontend"
start "VibeStudy" cmd /k "npm run dev"

echo.
echo Ambientes sendo iniciados em janelas separadas.
echo A janela principal sera fechada automaticamente...
timeout /t 3 /nobreak > nul
exit
