# FTStatsServer

- Collecting various system related information + FTL platform related information
- Easy to use
- Customizable
- Scalable
- Light

Stack:
---
- Back-end: Python / SQLite
- Front-end: JS / Jinga / HTML / CSS

Requirements:
---
- Python 3.X
- gcc version > 7.4.X

Installation:
---

<pre>
git clone git@github.com:swifty94/FTStats.git

No Git installed? Just download the zip directly from here and upload on the server.
</pre>

Usage
---
- Adjust settings.json file respectively
<pre>
{
    "AcsPorts": [],             // ports that your Jboss app is listening on
                                // e.g., ["8080","8181", "8443"]

    "DbPorts": [],              // ports for DB connectivity (MySQL, Oracle and/or ClickHouse)
                                // e.g., ["3306","8123"]

    "AcsStatsUrl": "",          // FT ACS stats URL
                                // e.g., "http://127.0.0.1:8080/acsstats"

    "QoeDbConnectionString": "" // ClickHouse connection string
                                // e.g., "clickhouse://demo.friendly-tech.com"
    
    "IpAddr": "0.0.0.0",        // IP address for FTStats app to bind on
                                // default 0.0.0.0 (any available interface)
    
    "TcpPort": "5555",          // TCP port for FTStats app to listen on
                                // default 5555
    
    "DbUpdateIntervalSec": "120" // Frequency of system data collection and storing to DB
                                // default 120 (seconds)
    
    "AppName": "FTStats",       // Application name, can be changed to whatever you want                               
    
    "Version": 2.0              // Application version
}
</pre>

- Start the application:
    - Linux
    <pre>
    $ ./bin/app.sh 
    Usage: app { start | stop | restart | status }
    </pre>

    - Windows
    <pre>
    Run the bin/app.bat file 
    </pre>