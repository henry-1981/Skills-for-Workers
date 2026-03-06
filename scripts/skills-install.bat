@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1

:: Skills for Workers — Install Script (Windows)
::
:: Usage:
::   skills-install.bat <skills-zip>
::   skills-install.bat <skills-zip> --all        skip optional prompts
::   skills-install.bat <skills-zip> --required    required only

set "SKILLS_DIR=%USERPROFILE%\.claude\skills"
set "TEMP_EXTRACT="
set "MODE=interactive"
set "ZIP_FILE="

:: Parse arguments
:parse_args
if "%~1"=="" goto :check_args
if "%~1"=="-h" goto :show_usage
if "%~1"=="--help" goto :show_usage
if "%~1"=="--all" (
    set "MODE=all"
    shift
    goto :parse_args
)
if "%~1"=="--required" (
    set "MODE=required"
    shift
    goto :parse_args
)
if "%ZIP_FILE%"=="" (
    set "ZIP_FILE=%~1"
    shift
    goto :parse_args
)
echo [ERROR] 인자가 너무 많습니다.
goto :show_usage

:check_args
if "%ZIP_FILE%"=="" goto :show_usage
if not exist "%ZIP_FILE%" (
    echo [ERROR] 파일을 찾을 수 없습니다: %ZIP_FILE%
    exit /b 1
)

echo.
echo ══════════════════════════════════════
echo   Skills for Workers — 설치 시작
echo ══════════════════════════════════════
echo.

:: Get absolute path
for %%F in ("%ZIP_FILE%") do set "ZIP_FILE=%%~fF"
for %%F in ("%ZIP_FILE%") do set "ZIP_DIR=%%~dpF"

:: SHA256 verification
set "VERSION_FILE=%ZIP_DIR%version.json"
if exist "%VERSION_FILE%" (
    call :verify_sha256
    if errorlevel 1 exit /b 1
) else (
    echo [WARN] version.json을 찾을 수 없습니다. 무결성 검증을 건너뜁니다.
)

:: Unzip to temp directory
set "TEMP_EXTRACT=%TEMP%\skills-install-%RANDOM%"
echo [INFO] 압축 해제 중...
powershell -Command "Expand-Archive -Path '%ZIP_FILE%' -DestinationPath '%TEMP_EXTRACT%' -Force" 2>nul
if errorlevel 1 (
    echo [ERROR] 압축 해제 실패. PowerShell 5.1 이상이 필요합니다.
    goto :cleanup
)

:: Check manifest.json
if not exist "%TEMP_EXTRACT%\manifest.json" (
    echo [ERROR] manifest.json을 찾을 수 없습니다. 올바른 배포 zip인지 확인하세요.
    goto :cleanup
)

:: Check skills directory
if not exist "%TEMP_EXTRACT%\skills\" (
    echo [ERROR] skills\ 디렉토리를 찾을 수 없습니다.
    goto :cleanup
)

:: Ensure target directory exists
if not exist "%SKILLS_DIR%" mkdir "%SKILLS_DIR%"

:: Parse manifest and install skills
set "INSTALLED=0"
set "UPDATED=0"
set "SKIPPED=0"
set "INSTALL_NAMES="

:: Use PowerShell to parse manifest and output skill info
for /f "usebackq tokens=1-4 delims=|" %%A in (`powershell -Command "$m = Get-Content '%TEMP_EXTRACT%\manifest.json' | ConvertFrom-Json; foreach ($s in $m.skills) { Write-Output ('{0}|{1}|{2}|{3}' -f $s.name, $s.description, $s.dept, $s.required) }"`) do (
    set "SKILL_NAME=%%A"
    set "SKILL_DESC=%%B"
    set "SKILL_DEPT=%%C"
    set "SKILL_REQ=%%D"
    call :process_skill
)

:: Summary
echo.
echo ══════════════════════════════════════
echo   설치 완료
echo ══════════════════════════════════════
if defined INSTALL_NAMES echo !INSTALL_NAMES!
echo.
echo   새로 설치: !INSTALLED!개
echo   업데이트:  !UPDATED!개
echo   건너뜀:    !SKIPPED!개
echo.
echo   설치 경로: %SKILLS_DIR%
echo ══════════════════════════════════════
echo.

goto :cleanup_ok

:: --- Subroutines ---

:process_skill
set "SRC=%TEMP_EXTRACT%\skills\!SKILL_NAME!"
set "DEST=%SKILLS_DIR%\!SKILL_NAME!"

if not exist "!SRC!\" (
    echo [WARN] !SKILL_NAME!: zip에 포함되지 않음, 건너뜀
    goto :eof
)

:: Check if destination exists
set "DEST_EXISTS=0"
if exist "!DEST!\" set "DEST_EXISTS=1"

:: Compute diff (compare directory hashes)
set "HAS_DIFF=1"
if !DEST_EXISTS!==1 (
    call :compute_hash "!SRC!" SRC_HASH
    call :compute_hash "!DEST!" DEST_HASH
    if "!SRC_HASH!"=="!DEST_HASH!" set "HAS_DIFF=0"
)

set "SHOULD_INSTALL=0"

if /i "!SKILL_REQ!"=="True" (
    :: Required skill
    if !DEST_EXISTS!==0 (
        set "SHOULD_INSTALL=1"
    ) else if !HAS_DIFF!==1 (
        if "!MODE!"=="interactive" (
            echo.
            echo [INFO] !SKILL_NAME! (필수^) — 변경 사항이 있습니다.
            set /p "REPLY=  업데이트할까요? [Y/n] "
            if /i "!REPLY!"=="n" goto :skip_skill
            set "SHOULD_INSTALL=1"
        ) else (
            set "SHOULD_INSTALL=1"
        )
    ) else (
        goto :skip_skill
    )
) else (
    :: Optional skill
    if "!MODE!"=="required" goto :skip_skill

    if !DEST_EXISTS!==0 (
        if "!MODE!"=="interactive" (
            set "DEPT_LABEL="
            if not "!SKILL_DEPT!"=="all" set "DEPT_LABEL= (!SKILL_DEPT!)"
            echo.
            set /p "REPLY=  !SKILL_NAME!!DEPT_LABEL! — !SKILL_DESC! 설치할까요? [y/N] "
            if /i "!REPLY!"=="y" (
                set "SHOULD_INSTALL=1"
            ) else (
                goto :skip_skill
            )
        ) else if "!MODE!"=="all" (
            set "SHOULD_INSTALL=1"
        )
    ) else if !HAS_DIFF!==1 (
        if "!MODE!"=="interactive" (
            echo.
            echo [INFO] !SKILL_NAME! (선택^) — 변경 사항이 있습니다.
            set /p "REPLY=  업데이트할까요? [Y/n] "
            if /i "!REPLY!"=="n" goto :skip_skill
            set "SHOULD_INSTALL=1"
        ) else if "!MODE!"=="all" (
            set "SHOULD_INSTALL=1"
        )
    ) else (
        goto :skip_skill
    )
)

if !SHOULD_INSTALL!==1 (
    call :install_skill_fn
    goto :eof
)
goto :skip_skill

:skip_skill
set /a SKIPPED+=1
goto :eof

:install_skill_fn
:: Preserve council.config.yaml
set "PRESERVED_CONFIG="
if exist "!DEST!\council.config.yaml" (
    set "PRESERVED_CONFIG=%TEMP%\council-config-%RANDOM%.yaml"
    copy "!DEST!\council.config.yaml" "!PRESERVED_CONFIG!" >nul 2>&1
)

:: Remove existing
if exist "!DEST!\" rmdir /s /q "!DEST!" >nul 2>&1

:: Copy skill
xcopy "!SRC!" "!DEST!\" /e /i /q >nul 2>&1

:: Restore preserved config
if defined PRESERVED_CONFIG (
    if exist "!PRESERVED_CONFIG!" (
        copy "!PRESERVED_CONFIG!" "!DEST!\council.config.yaml" >nul 2>&1
        del "!PRESERVED_CONFIG!" >nul 2>&1
    )
)

:: Run npm install if package.json exists
if exist "!DEST!\package.json" (
    where npm >nul 2>&1
    if not errorlevel 1 (
        pushd "!DEST!"
        npm install --production --silent >nul 2>&1
        if errorlevel 1 echo [WARN] !SKILL_NAME!: npm install 실패
        popd
    ) else (
        echo [WARN] !SKILL_NAME!: npm이 설치되어 있지 않습니다. extended 모드를 사용하려면 Node.js를 설치하세요.
    )
)

if !DEST_EXISTS!==1 (
    if !HAS_DIFF!==1 (
        set /a UPDATED+=1
    ) else (
        set /a INSTALLED+=1
    )
) else (
    set /a INSTALLED+=1
)
set "INSTALL_NAMES=!INSTALL_NAMES!  √ !SKILL_NAME!!LF!"
goto :eof

:compute_hash
:: Compute composite hash for a directory using PowerShell
set "HASH_DIR=%~1"
set "HASH_VAR=%~2"
for /f "usebackq" %%H in (`powershell -Command "$files = Get-ChildItem -Path '%HASH_DIR%' -Recurse -File | Sort-Object FullName; $stream = [System.IO.MemoryStream]::new(); foreach ($f in $files) { $bytes = [System.IO.File]::ReadAllBytes($f.FullName); $stream.Write($bytes, 0, $bytes.Length) }; $stream.Position = 0; $hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash($stream); $stream.Dispose(); ($hash | ForEach-Object { $_.ToString('x2') }) -join ''"`) do (
    set "%HASH_VAR%=%%H"
)
goto :eof

:verify_sha256
:: Extract expected hash from version.json
for /f "usebackq" %%H in (`powershell -Command "(Get-Content '%VERSION_FILE%' | ConvertFrom-Json).sha256"`) do (
    set "EXPECTED_HASH=%%H"
)
if not defined EXPECTED_HASH (
    echo [WARN] version.json에 sha256 필드가 없습니다.
    exit /b 0
)

:: Compute actual hash
for /f "usebackq" %%H in (`powershell -Command "(Get-FileHash -Path '%ZIP_FILE%' -Algorithm SHA256).Hash.ToLower()"`) do (
    set "ACTUAL_HASH=%%H"
)

if /i not "!EXPECTED_HASH!"=="!ACTUAL_HASH!" (
    echo [ERROR] SHA256 불일치!
    echo [ERROR]   예상: !EXPECTED_HASH!
    echo [ERROR]   실제: !ACTUAL_HASH!
    echo [ERROR] 파일이 손상되었거나 변조되었을 수 있습니다. 다시 다운로드해 주세요.
    exit /b 1
)
echo [INFO] SHA256 검증 통과
exit /b 0

:show_usage
echo Skills for Workers — 설치 스크립트
echo.
echo Usage:
echo   %~nx0 ^<skills-zip^>
echo   %~nx0 ^<skills-zip^> --all        전체 설치
echo   %~nx0 ^<skills-zip^> --required   required만 설치
exit /b 1

:cleanup
if defined TEMP_EXTRACT (
    if exist "%TEMP_EXTRACT%\" rmdir /s /q "%TEMP_EXTRACT%" >nul 2>&1
)
exit /b 1

:cleanup_ok
if defined TEMP_EXTRACT (
    if exist "%TEMP_EXTRACT%\" rmdir /s /q "%TEMP_EXTRACT%" >nul 2>&1
)
exit /b 0
