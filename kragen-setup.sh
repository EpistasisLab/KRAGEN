#!/bin/bash

# Function to log messages
log() {
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] $1"
}

# Function to handle errors
handle_error() {
    log "Error: $1"
    exit 1
}

# Function to prompt user for validation
validate_step() {
    read -p "Would you like to continue? (y/n): " choice
    if [[ $choice =~ ^[Yy]$ ]]; then
        return 0
    else
        handle_error "User exited. Please fix any issues before proceeding."
    fi
}

# pause final message and wait for user to press enter to exit
pause() {
    read -p "Press [Enter] key to exit..." fackEnterKey
}

centered_log() {
    local message="$1"
    local width="$2"
    
    # Calculate padding
    local padding=$(( ($width - ${#message}) / 2 ))
    
    # Print centered message
    local centered_message=$(printf "%${padding}s%s%${padding}s\n" " " "$message" " ")
    
    # Use log function to print centered message
    log "$centered_message"
}

# Check if test.csv is provided
if [ -z "$1" ]; then
    handle_error "Usage: ./kragen.sh <csv_filename>"
fi

# Check if config/kragen.env file exists
if [ ! -f "config/kragen.env" ]; then
    handle_error "Please make sure the config/kragen.env file exists with the correct environmental variables."
fi

length=100

# Log start of the script
log "$(printf '*%.0s' $(seq "$length"))"
centered_log "Starting the data processing script." "$length"
log "$(printf '*%.0s' $(seq "$length"))"

log ""

# Step 0: Check environmental variables
log "$(printf '*%.0s' $(seq "$length"))"
centered_log "Before proceeding, ensure that all environmental variables in config/kragen.env are correct." "$length"
log "$(printf '*%.0s' $(seq "$length"))"
validate_step

# Load environmental variables
source config/kragen.env

# Step 1: Convert
log "$(printf '*%.0s' $(seq "$length"))"
centered_log "Executing Step 1: Convert" "$length"
log "$(printf '*%.0s' $(seq "$length"))"
# docker compose run kragen convert "$1" || handle_error "Step 1 failed."
python src/kragen.py convert "$1" || handle_error "Step 1 failed."
log "$(printf '*%.0s' $(seq "$length"))"
centered_log "Step 1: Convert complete" "$length"
centered_log "Output: $CONVERT_OUTPUT_DIR/$CONVERT_OUTPUT_FILENAME" "$length"
log "$(printf '*%.0s' $(seq "$length"))"
validate_step

# Step 2: Parse
log "$(printf '*%.0s' $(seq "$length"))"
centered_log "Executing Step 2: Parse" "$length"
log "$(printf '*%.0s' $(seq "$length"))"
# docker compose run kragen parse || handle_error "Step 2 failed."
python src/kragen.py parse || handle_error "Step 2 failed."
log "$(printf '*%.0s' $(seq "$length"))"
centered_log "Step 2: Parse complete" "$length"
centered_log "Output: $OUTPUT_DIR" "$length"
log "$(printf '*%.0s' $(seq "$length"))"
validate_step

# Step 3: Vectorize
log "$(printf '*%.0s' $(seq "$length"))"
centered_log "Executing Step 3: Vectorize" "$length"
log "$(printf '*%.0s' $(seq "$length"))"
# docker compose run kragen vectorize || handle_error "Step 3 failed."
python src/kragen.py vectorize || handle_error "Step 3 failed."
log "$(printf '*%.0s' $(seq "$length"))"
centered_log "Step 3: Vectorize complete" "$length"
centered_log "Output: $OUTPUT_DIR_FOR_EMBEDDING" "$length"
log "$(printf '*%.0s' $(seq "$length"))"
validate_step

# Step 4: Tokenize
log "$(printf '*%.0s' $(seq "$length"))"
centered_log "Executing Step 4: Tokenize" "$length"
log "$(printf '*%.0s' $(seq "$length"))"
# docker compose run kragen tokenize || handle_error "Step 4 failed."
python src/kragen.py tokenize || handle_error "Step 4 failed."
log "$(printf '*%.0s' $(seq "$length"))"
centered_log "Step 4: Tokenize complete" "$length"
centered_log "Output: $OUTPUT_DIR_FOR_ADDING_TOKEN_INFO" "$length"
log "$(printf '*%.0s' $(seq "$length"))"
validate_step

# Step 5: Upload
log "$(printf '*%.0s' $(seq "$length"))"
centered_log "Executing Step 5: Upload" "$length"
log "$(printf '*%.0s' $(seq "$length"))"
# docker compose run kragen upload || handle_error "Step 5 failed."
python src/kragen.py upload || handle_error "Step 5 failed."
log "$(printf '*%.0s' $(seq "$length"))"
centered_log "Step 5: Upload complete" "$length"
centered_log "Check the vector database" "$length"
# TODO: Add the query command to output the number of objects uploaded.
log "$(printf '*%.0s' $(seq "$length"))"
validate_step

# Log successful completion
log "$(printf '*%.0s' $(seq "$length"))"
centered_log "All steps completed successfully" "$length"
log "$(printf '*%.0s' $(seq "$length"))"
pause
