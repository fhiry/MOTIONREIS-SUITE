#!/bin/bash

# Move to the directory where the script is located
cd "$(dirname "$0")"

echo "====================================================="
echo "        INSTALLING MOTIONREIS PLUGIN (MAC)           "
echo "====================================================="
echo ""

# 1. Enable PlayerDebugMode so unsigned plugins can run
echo "[1/2] Enabling Adobe PlayerDebugMode..."
for i in {11..18}; do
    defaults write com.adobe.CSXS.$i PlayerDebugMode 1
done
killall cfprefsd >/dev/null 2>&1
echo "      Done!"

# 2. Clean up old conflicting installations and cache
echo "[2/3] Cleaning up old conflicting installations & cache..."
rm -rf "$HOME/Library/Application Support/Adobe/CEP/extensions/com.motionreis.master"
rm -rf "$HOME/Library/Application Support/Adobe/CEP/extensions/motionreis"
rm -rf "$HOME/Library/Caches/CSXS"
echo "      Done!"

# 3. Copy the plugin folder to the CEP extensions directory
echo "[3/3] Syncing files to Adobe CEP directory (Safe Overwrite)..."
EXT_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions/com.motionreis.suite"

# Create directory if it doesn't exist
mkdir -p "$EXT_DIR"

# Use rsync to copy everything EXCEPT the 'data' folder and installer scripts.
# This ensures that your saved presets/settings in the destination are never lost,
# while the code is perfectly updated/overwritten.
rsync -a --exclude='data' --exclude='INSTALL MAC.command' --exclude='INSTALL WINDOWS.bat' --exclude='.git' --exclude='dev_scripts' "./" "$EXT_DIR/"

echo "      Done!"
echo ""
echo "====================================================="
echo " INSTALLATION COMPLETE! "
echo "====================================================="
echo "Please restart After Effects if it's open."
echo "You can launch the plugin via: Window > Extensions > Motionreis Master"
echo ""
echo "Press any key to close this window..."
