#!/bin/bash

# Exit on any error
set -e

# Define the source folder and output file
SOURCE_FOLDER="dist"
ARCHIVE_NAME="dist_v2.tar.gz"

# Check if the source folder exists
if [ ! -d "$SOURCE_FOLDER" ]; then
  echo "Error: Folder '$SOURCE_FOLDER' does not exist."
  exit 1
fi

# Create the tar.gz archive
echo "Creating archive $ARCHIVE_NAME from $SOURCE_FOLDER/..."
tar -czf "$ARCHIVE_NAME" "$SOURCE_FOLDER"

echo "Archive created successfully."
