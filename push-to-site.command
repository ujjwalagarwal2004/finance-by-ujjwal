#!/bin/bash
# Double-click this file to publish the latest articles to your live website.

cd "$(dirname "$0")"

echo "📦 Pushing latest articles to Finance by Ujjwal..."
git add articles.json
git commit -m "New article: $(date '+%Y-%m-%d')"
git push origin main

echo ""
echo "✅ Done! Your site will update in about 60 seconds."
echo "   Visit: https://$(git remote get-url origin | sed 's/.*github.com[:/]//' | sed 's/\.git//' | awk -F'/' '{print $1}').github.io/$(git remote get-url origin | sed 's/.*github.com[:/]//' | sed 's/\.git//' | awk -F'/' '{print $2}')/"
echo ""
read -p "Press Enter to close..."
