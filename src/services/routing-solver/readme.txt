1. Prepare Python app

Assume your structure:

/home/ubuntu/routing-solver/
 ├── main.py
 ├── requirements.txt
 
✅ Install dependencies
cd /home/ubuntu/routing-solver

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

Typical requirements.txt:

fastapi
uvicorn
ortools
▶️ 2. Test manually first
venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000

Test:

curl http://localhost:8000/solve

👉 Must respond (even error is fine)

⚙️ 3. Create systemd service
sudo nano /etc/systemd/system/routing-solver.service
✍️ Paste this
[Unit]
Description=Routing Solver (Python OR-Tools)
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/routing-solver

# 👇 IMPORTANT: use venv python
ExecStart=/home/ubuntu/routing-solver/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000

Restart=always
RestartSec=5

# optional env
Environment=PYTHONUNBUFFERED=1

# logs
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
🔄 4. Reload systemd
sudo systemctl daemon-reload
▶️ 5. Start service
sudo systemctl start routing-solver
🔁 6. Enable on boot
sudo systemctl enable routing-solver
🔍 7. Check status
sudo systemctl status routing-solver

You want:

Active: active (running)
📜 8. Logs
journalctl -u routing-solver -f
🔗 9. Connect from your Node worker
ROUTING_API_URL=http://127.0.0.1:8000/solve
🧠 Production improvements (highly recommended)
✅ 1. Add timeout in Node
await fetch(url, {
  method: 'POST',
  body: JSON.stringify({ matrix }),
  headers: { 'Content-Type': 'application/json' },
  signal: AbortSignal.timeout(5000),
});
✅ 2. Limit worker concurrency
concurrency: 2 // prevent overload
✅ 3. Add rate limiting (you mentioned earlier)

You can combine with:

MAPBOX_RATE_LIMIT=10
🚨 Common issues
❌ Service starts but crashes

Check:

journalctl -u routing-solver -n 50
❌ Module not found (ortools)

You forgot:

pip install ortools
❌ Works manually but not as service

👉 Wrong Python path

Fix:

which python
which uvicorn

Use venv paths

🧠 Final architecture
API (NestJS)
   ↓
BullMQ
   ↓
Routing Worker
   ↓
Python Solver (systemd service)
   ↓
DB updated






Run in production (IMPORTANT)

⚠️ Do NOT use app.run() in production

Use gunicorn:

gunicorn -w 2 -b 0.0.0.0:8000 app:app
⚙️ systemd (updated for production)
ExecStart=/home/ubuntu/routing-solver/venv/bin/gunicorn \
  -w 2 \
  -b 0.0.0.0:8000 \
  app:app