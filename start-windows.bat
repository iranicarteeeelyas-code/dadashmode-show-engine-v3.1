@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul && (start "" http://localhost:8080 & node tools\serve.mjs 8080 & goto :eof)
where python >nul 2>nul && (start "" http://localhost:8080 & python -m http.server 8080 & goto :eof)
echo Node.js or Python is required. Install Node.js from https://nodejs.org and run again.
pause
