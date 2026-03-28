#!/bin/sh

# Fail the build if any command fails
set -e

echo "Starting ci_post_clone.sh for TradersAI..."

# 1. Xcode Cloud executes scripts from the ci_scripts directory. 
# We need to navigate up to the root of your React Native project.
cd ../../

# 2. Install Node.js (Homebrew is pre-installed on Xcode Cloud)
echo "Installing Node.js..."
export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
brew install node

# 3. Install Yarn (Optional: If you use npm, you can skip this and run 'npm install' below)
echo "Installing Yarn..."
npm install -g yarn

# 4. Install project dependencies
echo "Installing project dependencies..."
yarn install # Change to 'npm install' if that is your preferred package manager

# 5. Navigate back to the iOS folder to install Pods
cd ios

# 6. Install CocoaPods
echo "Installing CocoaPods..."
pod install

echo "ci_post_clone.sh completed successfully!"