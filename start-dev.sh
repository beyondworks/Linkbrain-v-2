#!/bin/bash

# Kill any existing processes
pkill -9 -f "npm run dev" 2>/dev/null || true
pkill -9 -f "vite" 2>/dev/null || true
sleep 1

echo "🚀 Starting development environment..."
echo "   - Vite: http://localhost:3000 (frontend)"
echo "   - API:  http://localhost:3005/api/analyze (backend)"

# Start Vite on port 3000
npm run dev 2>&1 | sed 's/^/[VITE] /' &

# Start Vercel Functions on port 3005 (using Express)
PORT=3005 node --require dotenv/config node_modules/.bin/vercel dev 2>&1 | sed 's/^/[API] /' &

wait
