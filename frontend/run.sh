#!/usr/bin/env bash
# Install dependencies and start the app

echo "Installing dependencies..."
npm install

echo "Starting the app..."
echo "Choose platform:"
echo "1) Android"
echo "2) iOS"
echo "3) Web"
echo "Enter choice (1/2/3):"
read choice

case $choice in
  1)
    npm run android
    ;;
  2)
    npm run ios
    ;;
  3)
    npm run web
    ;;
  *)
    echo "Invalid choice"
    ;;
esac
