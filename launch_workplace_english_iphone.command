#!/bin/zsh
cd "$(dirname "$0")"
IP="$(ipconfig getifaddr en0 || ipconfig getifaddr en1)"
PORT=8765
echo "Open this URL on your iPhone Safari:"
echo "http://$IP:$PORT/workplace_english_app.html"
echo
echo "Keep this window open while using the app on iPhone."
python3 -m http.server "$PORT" --bind 0.0.0.0
