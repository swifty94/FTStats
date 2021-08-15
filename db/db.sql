BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "sysinfo" (
	"os"	TEXT,
	"nodename"	TEXT,
	"cpuarch"	TEXT,
	"cores"	INTEGER,
	"ram"	INTEGER,
	"d_total"	INTEGER,
	"app_name"	TEXT,
	"version"	TEXT,
	"updated"	timestamp DATE DEFAULT (datetime('now', 'localtime'))
);
CREATE TABLE IF NOT EXISTS "stats" (
	"id"	INTEGER NOT NULL,
	"javacpu"	INTEGER,
	"cpu_percent"	REAL,
	"loadavg"	REAL,
	"javamem"	REAL,
	"freeram"	INTEGER,
	"usedram"	INTEGER,
	"u_disk"	INTEGER,
	"f_disk"	INTEGER,
	"errin"	INTEGER,
	"errout"	INTEGER,
	"dropin"	INTEGER,
	"dropout"	INTEGER,
	"qoe_sessions_min"	REAL,
	"cpe_data_serial"	INTEGER,
	"qoedb_size"	REAL,
	"updated"	timestamp DATE DEFAULT (datetime('now', 'localtime')),
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "ports" (
	"id"	INTEGER NOT NULL,
	"updated"	TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "haz_info" (
	"id"	INTEGER NOT NULL,
	"nodeName"	TEXT,
	"nodeState"	TEXT,
	"clusterState"	TEXT,
	"clusterSize"	TEXT,
	"updated"	timestamp DATE DEFAULT (datetime('now', 'localtime')),
	PRIMARY KEY("id" AUTOINCREMENT)
);
COMMIT;
