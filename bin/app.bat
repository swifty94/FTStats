rem Windows Bat script for easy application startup
rem :Setting up venv + install dependencies if this is first run
rem :Starting app from venv if already set
rem :Adjust APP_HOME to actual path of project

SET APP_HOME=C:\FTStats_v2.0.0\
cd %APP_HOME%	
if exist venv\ (
	echo "Found venv"
	.\venv\Scripts\activate && pythonw app.py 
) else (
	echo "Venv not found. Creating + activating"
	py -m venv venv
	venv\Scripts\activate
    echo "Install dependencies"    
	FOR %%i in (dep\*.whl) DO venv\Scripts\pip3.9.exe install %%i
	FOR %%i in (dep\*.tar.gz) DO venv\Scripts\pip3.9.exe install %%i	
    cd %APP_HOME%
    pythonw app.py 
)