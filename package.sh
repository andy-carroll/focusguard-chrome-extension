#!/bin/bash

# Create dist directory if it doesn't exist
mkdir -p dist

# Create a temporary directory for packaging
TEMP_DIR=$(mktemp -d)

# Copy necessary files to temp directory
cp manifest.json $TEMP_DIR/
cp background.js $TEMP_DIR/
cp blocked.html $TEMP_DIR/
cp options.html $TEMP_DIR/
cp options.js $TEMP_DIR/
cp popup.html $TEMP_DIR/
cp popup.js $TEMP_DIR/

# Copy icons directory
cp -r icons $TEMP_DIR/

# Create ZIP file
VERSION=$(grep '"version"' manifest.json | cut -d'"' -f4)
ZIP_FILE="focusguard-v$VERSION.zip"

# Navigate to temp directory and create zip
(cd $TEMP_DIR && zip -r ../$ZIP_FILE ./*)

# Move zip to dist directory
mv $TEMP_DIR/../$ZIP_FILE dist/

# Clean up
rm -rf $TEMP_DIR

echo "Created package: dist/$ZIP_FILE"

# Create a list of files included in the package
echo "\nFiles included in the package:"
unzip -l "dist/$ZIP_FILE" | awk 'NR > 3 && NF > 3 {print $4}'

echo "\nPackage created successfully in dist/$ZIP_FILE"
