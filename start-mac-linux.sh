#!/bin/sh
cd "$(dirname "$0")"
if command -v node >/dev/null 2>&1; then (sleep 1; (open http://localhost:8080 || xdg-open http://localhost:8080) >/dev/null 2>&1) & node tools/serve.mjs 8080
elif command -v python3 >/dev/null 2>&1; then (sleep 1; (open http://localhost:8080 || xdg-open http://localhost:8080) >/dev/null 2>&1) & python3 -m http.server 8080
else echo "Node.js or Python 3 is required"; fi
