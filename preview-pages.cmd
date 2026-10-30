@echo off
setlocal EnableExtensions
title Opportunity AI - previa local do site estatico

rem ---------------------------------------------------------------------------
rem  Previa local do site estatico (mesmo visual do GitHub Pages), sem GitHub,
rem  sem hospedagem e sem npx. Funciona tambem chamado do PowerShell.
rem
rem  Duplo clique neste arquivo OU, no PowerShell:
rem     .\preview-pages.cmd
rem
rem  O que ele faz:
rem    1. confere Node e npm;
rem    2. instala as dependencias se node_modules nao existir;
rem    3. gera o build estatico com basePath /opportunity-site;
rem    4. sobe o servidor em http://127.0.0.1:4400/opportunity-site/ e abre o
rem       navegador.
rem ---------------------------------------------------------------------------

cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado no PATH. Instale o Node 20 ou superior.
  pause
  exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
  echo [ERRO] npm nao encontrado no PATH.
  pause
  exit /b 1
)

rem Next 16 exige Node 20 ou superior. Node antigo gera erro confuso no build.
for /f "tokens=1 delims=." %%v in ('node -p "process.versions.node"') do set NODE_MAJOR=%%v
if not defined NODE_MAJOR set NODE_MAJOR=0
if %NODE_MAJOR% LSS 20 (
  echo [ERRO] Node %NODE_MAJOR% encontrado. O Next 16 exige Node 20 ou superior.
  echo        Instale a versao LTS em https://nodejs.org e abra este arquivo de novo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [1/3] Instalando dependencias ^(npm ci^)...
  call npm ci
  if errorlevel 1 (
    echo [ERRO] npm ci falhou.
    pause
    exit /b 1
  )
) else (
  echo [1/3] node_modules ja existe - pulando instalacao.
)

echo.
echo [2/3] Gerando build estatico ^(npm run build:pages^)...
call npm run build:pages
if errorlevel 1 (
  echo [ERRO] o build falhou - leia a mensagem acima.
  pause
  exit /b 1
)

echo.
echo [3/3] Subindo a previa em http://127.0.0.1:4400/opportunity-site/
echo       Ctrl+C nesta janela encerra o servidor.
echo.
call npm run preview:pages

pause
exit /b 0
