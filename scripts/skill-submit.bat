@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1

:: Skills for Workers — Skill Submit Script (Windows)
::
:: Usage:
::   skill-submit.bat <skill-directory>

if "%~1"=="" goto :show_usage
if "%~1"=="-h" goto :show_usage
if "%~1"=="--help" goto :show_usage

set "SKILL_DIR=%~1"

:: Validate directory
if not exist "%SKILL_DIR%\" (
    echo [ERROR] 디렉토리를 찾을 수 없습니다: %SKILL_DIR%
    exit /b 1
)

:: Check SKILL.md
if not exist "%SKILL_DIR%\SKILL.md" (
    echo [ERROR] SKILL.md를 찾을 수 없습니다. 올바른 스킬 디렉토리인지 확인하세요.
    exit /b 1
)

:: Extract skill name from frontmatter using PowerShell
set "SKILL_NAME="
for /f "usebackq" %%N in (`powershell -Command "$c = Get-Content '%SKILL_DIR%\SKILL.md' -Raw; if ($c -match '(?m)^name:\s*(.+)') { $Matches[1].Trim() }"`) do (
    set "SKILL_NAME=%%N"
)

if not defined SKILL_NAME (
    echo [ERROR] SKILL.md에서 name 필드를 찾을 수 없습니다.
    echo [ERROR] frontmatter에 'name: your-skill-name'이 포함되어야 합니다.
    exit /b 1
)

echo [INFO] 스킬 이름: !SKILL_NAME!

:: Build zip using PowerShell
set "OUTPUT_FILE=!SKILL_NAME!-submit.zip"
echo [INFO] 패키징 중...

:: Get absolute path of skill directory
for %%F in ("%SKILL_DIR%") do set "SKILL_DIR_ABS=%%~fF"
for %%F in ("%SKILL_DIR%") do set "SKILL_DIR_NAME=%%~nxF"
for %%F in ("%SKILL_DIR%") do set "SKILL_DIR_PARENT=%%~dpF"

:: Create zip excluding unwanted files
powershell -Command ^
    "$src = '%SKILL_DIR_ABS%';" ^
    "$tmp = Join-Path $env:TEMP ('skill-submit-' + (Get-Random));" ^
    "New-Item -ItemType Directory -Path $tmp -Force | Out-Null;" ^
    "$dest = Join-Path $tmp '%SKILL_DIR_NAME%';" ^
    "Copy-Item -Path $src -Destination $dest -Recurse;" ^
    "Get-ChildItem -Path $dest -Recurse -Include 'node_modules','.jobs' -Directory | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue;" ^
    "Get-ChildItem -Path $dest -Recurse -Include '.DS_Store','council.config.yaml','*.skill','*.zip','.gitkeep' -File | Remove-Item -Force -ErrorAction SilentlyContinue;" ^
    "Compress-Archive -Path $dest -DestinationPath '%OUTPUT_FILE%' -Force;" ^
    "Remove-Item -Path $tmp -Recurse -Force"

if errorlevel 1 (
    echo [ERROR] 패키징 실패.
    exit /b 1
)

echo [INFO] 패키징 완료: %OUTPUT_FILE%
echo.
echo ══════════════════════════════════════
echo   스킬 제출 방법
echo ══════════════════════════════════════
echo.
echo   방법 1 (권장^): 개발자에게 %OUTPUT_FILE% 전달
echo            → PR로 레포에 추가
echo.
echo   방법 2: Google Drive 'Skills for Workers ^> submissions'
echo            폴더에 %OUTPUT_FILE% 업로드
echo.
echo ══════════════════════════════════════
echo.
exit /b 0

:show_usage
echo Skills for Workers — 스킬 제출 스크립트
echo.
echo Usage:
echo   %~nx0 ^<skill-directory^>
echo.
echo 스킬 디렉토리를 zip으로 패키징하고 제출 방법을 안내합니다.
exit /b 0
