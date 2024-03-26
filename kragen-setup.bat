@echo off

rem Function to log messages
:log
echo [%date% %time%] %1
goto :eof

rem Function to handle errors
:handle_error
call :log "Error: %1"
exit /b 1

rem Function to prompt user for validation
:validate_step
set /p choice="Would you like to continue? (y/n): "
if /i "%choice%"=="y" (
    exit /b 0
) else (
    call :handle_error "User exited. Please fix any issues before proceeding."
)

rem Function to pause and wait for user to press enter to exit
:pause
set /p dummy=Press [Enter] key to exit...
goto :eof

rem Function to print centered message
:centered_log
setlocal enabledelayedexpansion
set message=%1
set width=%2
set /a padding=(%width% - !message!:~0,1)
set /a padding=!padding! / 2
set "spaces=                                             "
echo !spaces:~0,!padding!!message!!spaces:~0,!padding!
endlocal
goto :eof

rem Main script starts here

rem Check if test.csv is provided
if "%~1"=="" (
    call :handle_error "Usage: %~nx0 <csv_filename>"
)

rem Check if config/kragen.env file exists
if not exist "config\kragen.env" (
    call :handle_error "Please make sure the config\kragen.env file exists with the correct environmental variables."
)

set "length=100"

rem Log start of the script
call :log "********************************************************************************"
call :centered_log "Starting the data processing script." "%length%"
call :log "********************************************************************************"
call :log ""

rem Step 0: Check environmental variables
call :log "********************************************************************************"
call :centered_log "Before proceeding, ensure that all environmental variables in config\kragen.env are correct." "%length%"
call :log "********************************************************************************"
call :validate_step

rem Load environmental variables
call "config\kragen.env"

rem Step 1: Convert
call :log "********************************************************************************"
call :centered_log "Executing Step 1: Convert" "%length%"
call :log "********************************************************************************"
docker compose run kragen convert "%~1" || call :handle_error "Step 1 failed."
call :log "********************************************************************************"
call :centered_log "Step 1: Convert complete" "%length%"
call :centered_log "Output: %CONVERT_OUTPUT_DIR%\%CONVERT_OUTPUT_FILENAME%" "%length%"
call :log "********************************************************************************"
call :validate_step

rem Step 2: Parse
call :log "********************************************************************************"
call :centered_log "Executing Step 2: Parse" "%length%"
call :log "********************************************************************************"
docker compose run kragen parse || call :handle_error "Step 2 failed."
call :log "********************************************************************************"
call :centered_log "Step 2: Parse complete" "%length%"
call :centered_log "Output: %OUTPUT_DIR%" "%length%"
call :log "********************************************************************************"
call :validate_step

rem Step 3: Vectorize
call :log "********************************************************************************"
call :centered_log "Executing Step 3: Vectorize" "%length%"
call :log "********************************************************************************"
docker compose run kragen vectorize || call :handle_error "Step 3 failed."
call :log "********************************************************************************"
call :centered_log "Step 3: Vectorize complete" "%length%"
call :centered_log "Output: %OUTPUT_DIR_FOR_EMBEDDING%" "%length%"
call :log "********************************************************************************"
call :validate_step

rem Step 4: Tokenize
call :log "********************************************************************************"
call :centered_log "Executing Step 4: Tokenize" "%length%"
call :log "********************************************************************************"
docker compose run kragen tokenize || call :handle_error "Step 4 failed."
call :log "********************************************************************************"
call :centered_log "Step 4: Tokenize complete" "%length%"
call :centered_log "Output: %OUTPUT_DIR_FOR_ADDING_TOKEN_INFO%" "%length%"
call :log "********************************************************************************"
call :validate_step

rem Step 5: Upload
call :log "********************************************************************************"
call :centered_log "Executing Step 5: Upload" "%length%"
call :log "********************************************************************************"
docker compose run kragen upload || call :handle_error "Step 5 failed."
call :log "********************************************************************************"
call :centered_log "Step 5: Upload complete" "%length%"
call :centered_log "Check the vector database" "%length%"
rem TODO: Add the query command to output the number of objects uploaded.
call :log "********************************************************************************"
call :validate_step

rem Log successful completion
call :log "********************************************************************************"
call :centered_log "All steps completed successfully" "%length%"
call :log "********************************************************************************"
call :pause

