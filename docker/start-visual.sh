#!/usr/bin/env bash
set -euo pipefail
export DISPLAY=${DISPLAY:-:99}
cleanup(){ pkill -f chromium || true; pkill -f websockify || true; pkill -f x11vnc || true; pkill -f fluxbox || true; pkill -f Xvfb || true; pkill -f vite || true; }
trap cleanup EXIT INT TERM
Xvfb "$DISPLAY" -screen 0 1280x900x24 -ac +extension RANDR >/tmp/xvfb.log 2>&1 &
for i in $(seq 1 30); do xdpyinfo -display "$DISPLAY" >/dev/null 2>&1 && break; sleep 1; done
fluxbox >/tmp/fluxbox.log 2>&1 &
x11vnc -display "$DISPLAY" -forever -shared -nopw -rfbport 5900 -localhost >/tmp/x11vnc.log 2>&1 &
websockify --web=/usr/share/novnc 0.0.0.0:6080 localhost:5900 >/tmp/novnc.log 2>&1 &
npm run dev -- --host 0.0.0.0 >/tmp/vite.log 2>&1 &
for i in $(seq 1 60); do curl -fsS http://127.0.0.1:8080 >/dev/null 2>&1 && break; sleep 1; done
chromium --no-sandbox --disable-dev-shm-usage --disable-gpu --no-first-run --no-default-browser-check --kiosk --window-size=1280,900 http://127.0.0.1:8080 >/tmp/chromium.log 2>&1 &
echo 'ExpediCheck visual pronto: http://localhost:6080/vnc.html?autoconnect=1&resize=scale'
while true; do sleep 5; done
