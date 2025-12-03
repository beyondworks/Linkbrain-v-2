#!/bin/bash

# Kill any existing dev server
pkill -f "vite" || true

# Clear node modules cache
rm -rf node_modules/.vite

# Start fresh dev server
echo "🚀 Starting dev server with fresh cache..."
npm run dev
