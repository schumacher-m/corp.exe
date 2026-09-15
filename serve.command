#!/bin/bash
cd "$(dirname "$0")"
echo "corp.exe — serving $(pwd)"
echo "Open http://127.0.0.1:8765/"
echo "(Leave this window open.)"
python3 -m http.server 8765
