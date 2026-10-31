@echo off
setlocal
cd /d "%~dp0"
if not exist "next-shadcn-ui\node_modules" (
  pushd next-shadcn-ui
  call npm ci
  if errorlevel 1 exit /b 1
  popd
)
if not exist "next-components-styling\node_modules" (
  pushd next-components-styling
  call npm ci
  if errorlevel 1 exit /b 1
  popd
)
start "Lab 11 - Dashboard" cmd /k "cd /d ""%~dp0next-shadcn-ui"" && npm run dev"
start "Lab 11 - Styling" cmd /k "cd /d ""%~dp0next-components-styling"" && npm run dev -- --port 3001"
echo Dashboard: http://localhost:3000/dashboard
echo Styling:   http://localhost:3001/styling
