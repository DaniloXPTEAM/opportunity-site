@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cd /d "%~dp0"

rem ===========================================================================
rem  VALIDACAO DA KIRANA COM O GATEWAY/MODELO REAIS  (rodar no Windows)
rem
rem  O que este arquivo faz:
rem    1. confere o Node;
rem    2. confere se o site DINAMICO esta no ar em http://127.0.0.1:3200
rem       (sobe em outra janela se preciso, sem matar nada);
rem    3. opcionalmente roda o homologar.bat do repositorio da Kirana, se a
rem       variavel KIRANA_DIR estiver definida (aprova o Gateway real);
rem    4. roda node testes\validar-kirana-real.mjs, que mede o caminho
rem       navegador -> site -> Kirana -> gateway -> modelo -> navegador;
rem    5. grava JSON e log em homologacao-site\ (sem segredos).
rem
rem  Antes de rodar, em janelas separadas:
rem    - Gateway real ligado (o mesmo de sempre; NAO criar outro);
rem    - Kirana real: node src\server.js  (na pasta dela, .env com a chave do
rem      Gateway e KIRANA_GATEWAY_API_KEY);
rem    - site: npm ci  &&  npm run build   (uma vez);
rem      o .env.local com KIRANA_URL apontando para a Kirana local.
rem
rem  Uso:
rem    VALIDAR-KIRANA-REAL.cmd              -> recusa a acao (nao cria pedido)
rem    VALIDAR-KIRANA-REAL.cmd --aprovar    -> aprova (cria solicitacao REAL)
rem    set KIRANA_DIR=C:\caminho\da\kirana  -> roda tambem homologar.bat
rem ===========================================================================

echo ===========================================================================
echo  VALIDACAO REAL DA KIRANA - %DATE% %TIME%
echo ===========================================================================
echo.

rem ------------------------- 1. Node ---------------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo [erro] Node.js nao encontrado. Instale Node 20 LTS ou superior.
  pause
  exit /b 1
)
for /f "delims=" %%v in ('node -v') do set "NODE_V=%%v"
for /f "tokens=1 delims=." %%a in ("!NODE_V:v=!") do set "NODE_MAJOR=%%a"
if !NODE_MAJOR! LSS 20 (
  echo [erro] Node !NODE_V! e antigo. Use Node 20 ou superior.
  pause
  exit /b 1
)
echo [1/5] Node !NODE_V! ok

if not exist "homologacao-site" mkdir "homologacao-site"
for /f "tokens=1-4 delims=/:. " %%a in ("%DATE% %TIME%") do set "STAMP=%%d%%b%%c-%%a"
set "LOG=homologacao-site\validacao-%STAMP%.txt"
echo      log: %LOG%

rem ------------------------- 2. site dinamico no ar -------------------------
echo.
echo [2/5] Site dinamico em http://127.0.0.1:3200
node -e "fetch('http://127.0.0.1:3200/api/kirana/status',{signal:AbortSignal.timeout(4000)}).then(function(r){process.exit(r.ok?0:1)}).catch(function(){process.exit(1)})" >nul 2>nul
if errorlevel 1 (
  if not exist ".next\BUILD_ID" (
    echo      build ausente - rodando "npm run build" ^(pode levar 2 minutos^)...
    call npm run build
    if errorlevel 1 (
      echo [erro] o build falhou. Leia a saida acima.
      pause
      exit /b 1
    )
  )
  echo      nao esta no ar; abrindo em outra janela...
  start "Opportunity AI - site dinamico" cmd /k "cd /d "%CD%" && node_modules\.bin\next start -p 3200"
  set "PRONTO=0"
  for /l %%i in (1,1,45) do (
    if "!PRONTO!"=="0" (
      node -e "fetch('http://127.0.0.1:3200/api/kirana/status',{signal:AbortSignal.timeout(2000)}).then(function(r){process.exit(r.ok?0:1)}).catch(function(){process.exit(1)})" >nul 2>nul
      if not errorlevel 1 (
        set "PRONTO=1"
      ) else (
        timeout /t 2 >nul
      )
    )
  )
  if "!PRONTO!"=="0" (
    echo [erro] o site nao respondeu em 90s. Veja a janela "site dinamico".
    pause
    exit /b 1
  )
)
echo      site respondendo em /api/kirana/status

rem ------------------------- 3. Kirana: homologar.bat -----------------------
echo.
if defined KIRANA_DIR (
  if exist "%KIRANA_DIR%\homologar.bat" (
    echo [3/5] Repositorio da Kirana em %KIRANA_DIR%
    echo      rodando homologar.bat ^(aprova o Gateway REAL^)...
    pushd "%KIRANA_DIR%"
    call homologar.bat
    set "HOMOLOG=%ERRORLEVEL%"
    popd
    if not "!HOMOLOG!"=="0" (
      echo      [aviso] homologar.bat terminou com codigo !HOMOLOG!.
      echo              A validacao do site continua, mas confira as etapas dele.
    )
  ) else (
    echo [3/5] KIRANA_DIR definida, mas homologar.bat nao existe la - pulando.
  )
) else (
  echo [3/5] KIRANA_DIR nao definida - pulando o homologar.bat da Kirana.
  echo      Opcional:  set KIRANA_DIR=C:\caminho\da\kirana
)

rem ------------------------- 4. validacao do caminho completo --------------
echo.
echo [4/5] Navegador -> site -> Kirana -> gateway -> modelo -> navegador
node testes\validar-kirana-real.mjs http://127.0.0.1:3200 --out "homologacao-site\kirana-real-%STAMP%.json" %*
set "CODIGO=%ERRORLEVEL%"
echo.
echo [5/5] Codigo de saida: %CODIGO%
echo        0 = aprovado com modelo real
echo        1 = alguma etapa falhou
echo        2 = dependencia ausente ^(site, Kirana ou Playwright^)
echo        3 = REPROVADO: gateway simulado detectado ^(nao e homologacao real^)

echo.
echo Anexe ao relatorio:
echo   homologacao-site\kirana-real-%STAMP%.json
echo   %LOG%
echo.
echo Nada foi publicado. O site oficial e o Gateway nao foram tocados.
pause
exit /b %CODIGO%
