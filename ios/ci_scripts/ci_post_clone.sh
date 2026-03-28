#!/bin/sh

# Fail the build if any command fails
set -e

echo "Starting ci_post_clone.sh for TradersAI..."

# 1. Navigate up to the root of your React Native project
cd ../../

# 2. Install Node.js
echo "Installing Node.js..."
export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
brew install node

# 3. Install Yarn
echo "Installing Yarn..."
npm install -g yarn

# 4. Install project dependencies
echo "Installing project dependencies..."
yarn install

# 5. Navigate back to the iOS folder
cd ios

# 6. Fix Podfile.lock mismatch and install CocoaPods
echo "Fixing Podfile.lock mismatch and installing CocoaPods..."
rm -f Podfile.lock
pod install --repo-update

echo "ci_post_clone.sh completed successfully!"