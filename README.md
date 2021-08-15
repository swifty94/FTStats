# FTStatsServer

- Collecting various system related information + FTL platform related information
- Easy to use
- Multi-server environment support
- Customizable
- Scalable
- Light

Usage demo:
---
- Dashboard
![](https://raw.githubusercontent.com/swifty94/FTStats/dev/examples/dash.gif)

- Browsing servers from cluster
![](https://raw.githubusercontent.com/swifty94/FTStats/dev/examples/cluster.gif)

- Graph view
![](https://raw.githubusercontent.com/swifty94/FTStats/dev/examples/graph.gif)
    
- Table view
![](https://raw.githubusercontent.com/swifty94/FTStats/dev/examples/table.gif)
    
- CSV reports
![](https://raw.githubusercontent.com/swifty94/FTStats/dev/examples/csv.gif)
    
Stack:
---
- Back-end: Python/Flask / SQLite
- Front-end: JavaScript / Jinga / HTML / CSS

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
    "AcsPorts": array(str x N), // ports that your Jboss app is listening on
                                // e.g., ["8080","8181", "8443"]

    "DbPorts": array(str x N),  // ports for DB connectivity (MySQL, Oracle and/or ClickHouse)
                                // e.g., ["3306","8123"]

    "mountpoint": str,          // path on disk to track its size/usage 
                                // e,g, "/" 

    "collectQoe": bool,          // Either collent QoE data or not
                                 // Default - true                      

    "AcsStatsUrl": str,          // FT ACS stats URL
                                // e.g., "http://127.0.0.1:8080/acsstats"

    "QoeDbConnectionString": str  // ClickHouse connection string
                                  // e.g., "clickhouse://demo.friendly-tech.com"

    "isCluster": bool,           // If there are more than 1 server in environment
                                 // default true

    "instancesArray": array(str x N)  // Array of server ip/domains 
                                        !!! (must be resolvanle at least within same network)
                                      // e.g., ["127.0.0.1","demo.friendly-tech.com", "demodm.friendly-tech.com"]

    "isHazelcast": bool,         // Either collent Hazelcast data or not
                                 // Default - true

    "isLiveStats": bool,        // Either display live statistics or not
                                 // Default - true

    "hazelcastPort": str,       // Hazelcast port
                                 // Default - "5701"
                                   
    "IpAddr": str,               // IP address for FTStats app to bind on
                                // Default 0.0.0.0 (any available interface)
    
    "TcpPort": str,              // TCP port for FTStats app to listen on
                                // Default 5050
    
    "DbUpdateIntervalSec": str   // Frequency of system data collection and storing to DB
                                // Default "120" seconds = each 2 minutes

    "DbTruncateIntervalSec": str  // Frequency of cleaning old data from db (drop and recreate)
                                  // Default "2592000" = each month                                
    
    "AppName": str,              // Application name, can be changed to whatever you want                               
    
    "Version": int              // Application version
}
</pre>

- Start the application:
    - Linux
    <pre>
    $ ./bin/app.sh 
    Usage: app { start | stop | restart | status | rebuild }
    </pre>
    NOTE: 'rebuild' is useful when you need to re-init whole app. E,g., you need completely change monitoring parameters like ports, paths, even servers, etc. So if there were existing DB you'll need to drop it and re-create + it would be good to clean Python cache, etc. 
    Basically, this call re-creates the venv, re-install the dependencies and re-creates the schema so you'll have a fresh app.

    - Windows
    <pre>
    - Adjust APP_HOME variable in bin/app.bat

    - Run the bin/app.bat file as administrator.
    </pre>