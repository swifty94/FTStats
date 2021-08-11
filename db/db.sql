BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS `sysinfo` (
	`os`	TEXT,
	`nodename`	TEXT,
	`cpuarch`	TEXT,
	`cores`	INTEGER,
	`ram`	INTEGER,
	`d_total`	INTEGER,	
	`app_name`	TEXT,
	`version`	TEXT,
	`updated`	timestamp DATE DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS `stats` (
	`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,		
	`javacpu`	INTEGER,
	`cpu_percent`	REAL,	
	`loadavg`	REAL,	
	`javamem`	REAL,
	`freeram`	INTEGER,
	`usedram`	INTEGER,
	`u_disk`	INTEGER,
	`f_disk`	INTEGER,	
	`errin`	INTEGER,
	`errout`	INTEGER,
	`dropin`	INTEGER,
	`dropout`	INTEGER,
	`qoe_sessions_min`	REAL,	
	`cpe_data_serial`	INTEGER,
	`kpi_data_serial`	INTEGER,
	`qoedb_size`	REAL,
	`sysdb_size`	REAL,	
	`updated`	timestamp DATE DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS `ports` (
	`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`updated`	TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);