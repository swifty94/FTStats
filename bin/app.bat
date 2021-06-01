rem Windows Bat script for easy application startup
rem :Setting up venv + install dependencies if this is first run
rem :Starting app from venv if already set
rem :Adjust APP_HOME to actual path of project

SET APP_HOME=
cd %APP_HOME%
IF EXIST venv echo "Found venv"
    .\venv\Scripts\activate && pythonw app.py 
ELSE echo "Venv not found. Creating..."    
    py -m venv venv &&
    echo "Install dependencies" &&
    .\venv\Scripts\activate &&
    cd dependencies &&
    .\venv\Scripts\pip3.9.exe install * -f ./ --no-index &&
    cd %APP_HOME%
    pythonw app.py 