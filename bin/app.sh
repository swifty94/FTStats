#!/bin/bash
##################################################################
#
#   Unix/Linux Bash script for easy application startup
#
#   :Setting up venv + install dependencies if this is first run
#   :Starting app from venv if already set
#
#
##################################################################
export APP_HOME=$(pwd)

f_start(){
    export self=${FUNCNAME[0]}    
    cd $APP_HOME        
    if [[ -d venv ]]; then
        echo ""
        echo "Found venv"
        echo ""
        source venv/bin/activate && sleep 1
        echo ""
        echo "Activated venv"
        echo ""
        python3 app.py &
        sleep 2
        echo ""
        echo "Application started"
        echo ""
        export timestamp=$(date +'%F-%H-%M')
        export PID=$(ps aux|grep -v grep|grep 'python3 app.py'|awk '{print $2}')
        echo "[$timestamp] [INFO] ['/bin/bash/'] [$self] [APP_PID=$PID] [ShellStartUp]" >> $APP_HOME/log/app.log
        echo ""
        echo "APP_PID=$PID"
        echo ""
    else
        mkdir log && mkdir reports
        echo ""
        echo "Venv not found. Creating..."
        echo ""
        python3 -m venv venv && sleep 1
        echo ""
        echo "Installing dependencies"
        echo ""
        source venv/bin/activate && sleep 1
        cd dep/
        pip3 install * -f ./ --no-index && sleep 1
        echo ""
        echo "Done"
        echo ""
        cd ..                
        echo "Activated venv"
        echo ""
        python3 app.py &
        sleep 2
        echo ""
        echo "Application started"
        echo ""
        export timestamp=$(date +'%F-%H-%M')
        export PID=$(ps aux|grep -v grep|grep 'python3 app.py'|awk '{print $2}')
        echo "[$timestamp] [INFO] ['/bin/bash/'] [$self] [APP_PID=$PID] [ShellStartUp]" >> $APP_HOME/log/app.log
        echo ""
        echo "APP_PID=$PID"
        echo ""
    fi
    
}

f_stop(){
    export self=${FUNCNAME[0]}    
    export PID=$(ps aux|grep -v grep|grep 'python3 app.py'|awk '{print $2}')
    export timestamp=$(date +'%F-%H-%M')
    echo ""
    echo "Found app ID - $PID"
    echo ""
    echo "[$timestamp] [INFO] ['/bin/bash/'] [$self] [APP_PID=$PID] [ShellTerminate]" >> $APP_HOME/log/app.log
    kill -9 $PID
    declare -i validate=$(ps aux|grep -v grep|grep 'python3 app.py'|awk '{print $2}'|wc -l)
    if (( $validate == 0 )); then
        echo ""
        echo "Application  stopped"
        echo ""
    else
        echo ""
        echo "Application NOT stopped"
        echo ""
    fi
}

f_status(){
    export self=${FUNCNAME[0]}    
    declare -i is_alive=$(ps aux|grep -v grep|grep 'python3 app.py'|awk '{print $2}'|wc -l)
    export timestamp=$(date +'%F-%H-%M')
    export line=""
    if (( $is_alive == 1 )); then
        echo ""
        echo "Status: Running"
        echo ""
        echo "[$timestamp] [INFO] ['/bin/bash/'] [$self] [Status=Running] [ShellHealthCheck]" >> $APP_HOME/log/app.log
    else
        echo ""
        echo "Status: Dead"
        echo ""
        echo "[$timestamp] [INFO] ['/bin/bash/'] [$self] [Status=Dead] [ShellHealthCheck]" >> $APP_HOME/log/app.log
    fi    
    echo ""    
}

f_rebuild(){
  f_stop
  echo ""
  echo "Rebuilding project..."
  echo ""
  echo "Purging items:"
  echo "  - application DB"
  echo "  - logs"
  echo "  - reports"
  echo "  - virtual env with dependencies"
  echo ""
  rm -rf reports/ log venv/ db/*.db && sleep 1
  echo ""
  echo "Done!"
  echo ""
  f_start
}

case "$1" in
	start)
		f_start
		;;
	stop)
		f_stop
		;;
	restart)
        f_stop
        sleep 1
        f_start
		;;
  status)
		f_status
		;;
  rebuild)
		f_rebuild
		;;
	*)
		echo "Usage: app { start | stop | restart | status | rebuild}"
		exit 1
esac

exit 0
