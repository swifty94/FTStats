rem Windows Bat script for easy application startup
rem :Setting up venv + install dependencies if this is first run
rem :Starting app from venv if already set

SET APP_HOME=C:\Users\Administrator\Documents\FTStats
cd %APP_HOME%
IF EXIST venv echo "Found venv"
    .\venv\Scripts\activate && pythonw app.py 
ELSE echo "Venv not found. Creating..."    
    py -m venv venv
    echo "Install dependencies"    
    .\venv\Scripts\activate
    .\venv\Scripts\pip3.9.exe install -r dependencies.txt        