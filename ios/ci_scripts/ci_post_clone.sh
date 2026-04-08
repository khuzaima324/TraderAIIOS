# /Users/khuzaima/Desktop/TradersiOS/ios/ci_scripts/ci_post_clone.sh
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

# 5. HOTFIX for Xcode 16 / iOS 18 SDK (expo-device TARGET_OS_SIMULATOR bug)
echo "Applying Xcode 16 patch for expo-device using Node..."
node -e '
const fs = require("fs");
const file = "node_modules/expo-device/ios/UIDevice.swift";
if (fs.existsSync(file)) {
  let code = fs.readFileSync(file, "utf8");
  // Using a regex to catch the phrasing regardless of spaces or tabs
  const regex = /return\s+TARGET_OS_SIMULATOR\s*!=\s*0/g;
  
  if (regex.test(code)) {
    const fix = "#if targetEnvironment(simulator)\n      return true\n    #else\n      return false\n    #endif";
    code = code.replace(regex, fix);
    fs.writeFileSync(file, code);
    console.log("Patched UIDevice.swift successfully.");
  } else {
    console.log("TARGET_OS_SIMULATOR not found. It may already be patched.");
  }
} else {
  console.log("UIDevice.swift not found. Skipping patch.");
}
'

# 6. Navigate back to the iOS folder
cd ios

# 7. Fix Podfile.lock mismatch and install CocoaPods
echo "Fixing Podfile.lock mismatch and installing CocoaPods..."
rm -f Podfile.lock
pod install --repo-update

echo "ci_post_clone.sh completed successfully!"