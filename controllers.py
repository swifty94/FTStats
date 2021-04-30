import re
import sys
import json
import time
import psutil
import socket
import os.path
import sqlite3
import platform
import requests
from os import path
from numbers import Number
from bs4 import BeautifulSoup
from datetime import datetime
from clickhouse_driver import connect
from clickhouse_driver.errors import NetworkError
from typing import Dict, List, AnyStr, Union
import logging
import logging.config

log_file_path = path.join(path.dirname(path.abspath(__file__)), 'logging.ini')
logging.config.fileConfig(log_file_path)

class JsonSettings(object):
    """
    Class that get values of user-dependent variables from settings.json
    """
    @staticmethod
    def parseJson(json_file: str, json_key: str) -> Union[List, AnyStr]:
        """
        :Accepts JSON file (path) and key as argument (both are type of String)\n
        :Return either List or String of respective values from settings
        """
        cn = __class__.__name__
        try:
            with open(json_file) as f:
                data = json.load(f)
            
            json_value = data[json_key]        
            return json_value
        except Exception as e:
            logging.error(f'{cn} Exception: {e}', exc_info=1)
    
    @staticmethod
    def getKeys(key_macro: str, value_list: List) -> List:
        """
        :Accept key pattern and lits of associated values to return list of corresponding keys \n
        :Example:\n
        >>> acs_ports = Settings.parseJson('AcsPorts')
        >>> print(acs_ports)
        >>> ['8080','8181']
        >>> keys = Settings.getKeys('acs_port_', acs_ports)
        >>> print(keys)
        >>> acs_port_8080, acs_port_8181
        """
        cn = __class__.__name__
        try:
            keys = []          
            for i in range(len(value_list)):
                name = key_macro + value_list[i]
                keys.append(name)                            
            return keys
        except Exception as e:
            logging.error(f'{cn} Exception: {e}', exc_info=1)

    @staticmethod
    def fillDict(keys: list, values: list) -> Dict:
        """
        Populate dictionart with respective pairs of key:value
        """
        cn = __class__.__name__
        try:
            data = {}
            for k,v in zip(keys,values):
                data[k] = v
            return data
        except Exception as e:
            logging.error(f'{cn} Exception: {e}', exc_info=1)

class DataCollector(object):
    """
    Class that has varios methods for getting system related information e.g., RAM, CPU, etc.
    """
    def __init__(self):
        self.cn = __class__.__name__ 
        self.acsUrl = JsonSettings.parseJson('settings.json','AcsStatsUrl')
        self.qoeDbStr = JsonSettings.parseJson('settings.json','QoeDbConnectionString')
    
    def _getJbossPid(self) -> int:
        try:
            for process in psutil.process_iter():
                try:
                    proc = process.as_dict(attrs=['pid', 'name', 'cmdline'])
                    if sys.platform == 'linux':
                        if 'jboss' in proc['name']:
                            if 'org.jboss.as.standalone' in proc['cmdline']:
                                pid = int(proc['pid'])                                
                                return pid                        
                    elif sys.platform == 'win32':
                        if 'java.exe' in proc['name']:
                            if 'org.jboss.as.standalone' in proc['cmdline']:
                                pid = int(proc['pid'])                                
                                return pid
                except (psutil.NoSuchProcess, psutil.AccessDenied , psutil.ZombieProcess) :
                    pass            
        except Exception as e:
            logging.error(f'{self.cn} Error {e}', exc_info=1)
            return 0
    
    def _getJbossMem(self) -> float:
        try:
            pid = self._getJbossPid()
            if pid == None:
                ram = 0
                return ram
            else:
                process = psutil.Process(pid)
                ram = float(round(process.memory_percent(),2))                
                return ram
        except Exception as e:
            logging.error(f'{self.cn} Error {e}', exc_info=1)
            return 0

    def _getJbossCpu(self) -> float:
        try:
            pid = self._getJbossPid()
            if pid == None:
                cpu = 0
                return cpu
            else:
                process = psutil.Process(pid)            
                cpu = float(process.cpu_times()[0])                
                return cpu
        except Exception as e:
            logging.error(f'{self.cn} Error {e}', exc_info=1)
            return 0
        
    def clickhouseSelect(self, sql):
        try:
            qoeConnection = connect(self.qoeDbStr)
            dbCursor = qoeConnection.cursor()
            dbCursor.execute(sql)
            result = dbCursor.fetchone()
            qoeConnection.close()
            fetch = str(result)
            bad_chars = ['(',',',')']
            for i in bad_chars : 
                fetch = fetch.replace(i, '') 
            return str(fetch)
        except Exception as e:
            logging.error(f'{self.cn} Error {e}', exc_info=1)
            return 0
        except NetworkError as ne:
            logging.error(f'{self.cn} Error {ne}', exc_info=1)
            return 0

    def getSys(self):
        try:
            app_name = db_ports = JsonSettings.parseJson('settings.json','AppName')
            version = JsonSettings.parseJson('settings.json','Version')
            uname = platform.uname()
            osname = uname.system
            nodename = uname.node                
            cpuarch = uname.processor
            cores = psutil.cpu_count(logical=False)
            svmem = psutil.virtual_memory()    
            ram = round((svmem.total/1024/1024/1024),2)
            d = psutil.disk_usage('/')
            d_total = round((d.total/1024/1024/1024),2)
            values = [osname,nodename,cpuarch,cores,ram,d_total,app_name,version]
            keys = ['os','nodename','cpuarch','cores','ram','d_total','app_name','version']
            data = JsonSettings.fillDict(keys,values)                     
            return data
        except Exception as e:
            logging.error(f'{self.cn} Error while getting SysInfo {e}', exc_info=1)
            return 0

    def getRam(self):
        try:
            svmem = psutil.virtual_memory()            
            avail_mem = round((svmem.available/1024/1024/1024),2)
            used_mem = round((svmem.used/1024/1024/1024),2)
            javamem = self._getJbossMem()
            values = javamem, avail_mem, used_mem
            keys = ['javamem', 'freeram', 'usedram']
            data = JsonSettings.fillDict(keys,values)         
            return data
        except Exception as e:
            logging.error(f'{self.cn} Error while getting RAM Data {e}', exc_info=1)
            return 0
        

    def getCpu(self):
        try:            
            cpu_percent = psutil.cpu_percent(interval=None)            
            loadavg = [x / psutil.cpu_count() * 100 for x in psutil.getloadavg()][0]        
            javacpu = self._getJbossCpu()            
            keys = ['javacpu','cpu_percent', 'loadavg']
            values = [javacpu, cpu_percent, loadavg]
            data = JsonSettings.fillDict(keys,values)                             
            return data
        except Exception as e:
            logging.error(f'{self.cn} Error while getting CPU data {e}', exc_info=1)
            return 0
    
    def getNetwork(self) -> Dict:
        try:
            net_io = psutil.net_io_counters()
            sent_b = round((net_io.bytes_sent/1024/1024/1024),2)
            recv_b = round((net_io.bytes_recv/1024/1024/1024),2)
            values = [sent_b, recv_b]
            keys = ['sent_b','recv_b']
            data = JsonSettings.fillDict(keys,values)                       
            return data
        except Exception as e:
            logging.error(f'{self.cn} Error while getting Network Data {e}', exc_info=1)
            return 0
    
    def getDisk(self) -> Dict:
        try:
            d = psutil.disk_usage('/')
            u_disk = round((d.used/1024/1024/1024),2)
            f_disk = round((d.free/1024/1024/1024),2)
            disk_io = psutil.disk_io_counters()
            read_io = disk_io.read_bytes
            write_io = disk_io.write_bytes
            values = [u_disk,f_disk,read_io,write_io]
            keys = ['u_disk','f_disk','read_io','write_io']
            data = JsonSettings.fillDict(keys,values)                    
            return data
        except Exception as e:
            logging.error(f'{self.cn} Error while getting Disk Data {e}', exc_info=1)
            return 0

    def countPort(self, portNum):
        try:            
            count = 0        
            for c in psutil.net_connections(kind='inet'):
                addr = "%s:%s" % (c.laddr)                
                port = re.search("[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}:"+f"{portNum}", addr)                
                if port:              
                    count += 1
            return count         
        except Exception as e:
            logging.error(f'{self.cn} Error while getting TcpPortsData, {e}', exc_info=1)
            return 0

    def getDbPorts(self) -> Dict:
        """
        """
        try:            
            db_ports = JsonSettings.parseJson('settings.json','DbPorts')              
            dbk = JsonSettings.getKeys('db_port_', db_ports)
            db_values = []            
            for i in range(len(db_ports)):            
                port = int(db_ports[i])
                count = self.countPort(port)
                db_values.append(count)                                                                                              
            db_data = JsonSettings.fillDict(dbk,db_values)            
            return db_data
        except Exception as e:
            logging.error(f'{self.cn} Error while getting DPorts, {e}', exc_info=1)
            return 0
        
    def getAcsPorts(self) -> Dict:
        try:
            acs_ports = JsonSettings.parseJson('settings.json','AcsPorts')
            acsk = JsonSettings.getKeys('acs_port_', acs_ports)
            acs_values = []
            for i in range(len(acs_ports)):
                port = int(acs_ports[i])
                count = self.countPort(port)            
                acs_values.append(count)                       
            acs_data = JsonSettings.fillDict(acsk,acs_values)            
            return acs_data
        except Exception as e:
            logging.error(f'{self.cn} Error while getting AcsPorts, {e}', exc_info=1)
            return 0

    def getQoeData(self):
        try:            
            response = requests.get(self.acsUrl)
            page = BeautifulSoup(response.text, 'html.parser')            
            qoe_sessions_min = page.find("td", text="QoESession per min (cur hour):").find_next_sibling("td").text            
            cpe_data_serial = self.clickhouseSelect("select count(*) from ftacs_qoe_ui_data.cpe_data")
            kpi_data_serial = self.clickhouseSelect("select count(*) from ftacs_qoe_ui_data.kpi_data")
            qoedb_size = self.clickhouseSelect("SELECT round((sum(x)/1024/1024/1024),2) FROM (SELECT sum(bytes) as x FROM system.parts WHERE active AND database = 'ftacs_qoe_ui_data' GROUP BY bytes ORDER BY bytes DESC) y")
            sysdb_size = self.clickhouseSelect("SELECT round((sum(x)/1024/1024/1024),2) FROM (SELECT sum(bytes) as x FROM system.parts WHERE active AND database = 'system' GROUP BY bytes ORDER BY bytes DESC) y")            
            keys = ['qoe_sessions_min','cpe_data_serial','kpi_data_serial','qoedb_size','sysdb_size']
            values = [qoe_sessions_min,cpe_data_serial,kpi_data_serial,qoedb_size,sysdb_size]
            qoe_data = JsonSettings.fillDict(keys,values)            
            return qoe_data            
        except Exception as e:
            logging.error(f'{self.cn} Error while getting QoeData, {e}', exc_info=1)                        
            return 0

class SqlProcessor(object):
    """
    SQLite CRUD worker
    """
    def __init__(self):
        self.cn = __class__.__name__
        self.dbname = path.join(path.dirname(path.abspath(__file__)), f'db/{socket.gethostname()}.db')

    def isDb(self) -> bool:
        """
        :Check if DB exists \n
        :Accept - None\n
        :Return - Bool
        """
        try:                        
            db = os.path.isfile(self.dbname)
            if db:                                
                return True
            else:
                logging.info(f'{self.cn} Internal database does not exist')
                logging.info(f'{self.cn} Creating application schema')          
                return False
        except Exception as e:            
            logging.error(f'{self.cn} Error \n{e}', exc_info=1)    
    
    def connect(self) -> object:
        """
        :Creating SQLite connection \n
        :Accept - None\n
        :Return - Connection object
        """
        try:
            connection = sqlite3.connect(self.dbname)            
            return connection
        except sqlite3.Error as e:
            logging.error(f'{self.cn} Error \n{e}', exc_info=1)
        
    def initDb(self) -> None:
        """
        :Initiating database if not exist \n
        :Accept - None\n
        :Return - None
        """
        try:                        
            connection = None    
            dump = open('db/db.sql')
            sql_str = dump.read()            
            connection = self.connect()
            cursor = connection.cursor()
            cursor.executescript(sql_str)
            acs_ports = JsonSettings.parseJson('settings.json','AcsPorts')
            db_ports = JsonSettings.parseJson('settings.json','DbPorts')
            acs_port_names = JsonSettings.getKeys('acs_port_', acs_ports)                
            db_port_names = JsonSettings.getKeys('db_port_', db_ports)
            for acs_port_name in acs_port_names:
                cursor.execute(f"ALTER TABLE ports ADD COLUMN {acs_port_name} INTEGER")
            for db_port_name in db_port_names:
                cursor.execute(f"ALTER TABLE ports ADD COLUMN {db_port_name} INTEGER")            
        except Exception as e:
            logging.error(f'{self.cn} Error \n{e}', exc_info=1)
        finally:
            connection.commit()            
            tables = cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence'")
            logging.info(f'{self.cn} Database created with tables:\n{tables.fetchall()}')
            if connection:
                connection.close()
    
    def selectData(self, sql: str) -> List:
        """
        Select data from DB\n
        :Accept - SQL query (str)\n
        :Return - Values (List)
        """
        try:
            connection = self.connect()
            cursor = connection.cursor()        
            data = cursor.execute(sql)
            result = data.fetchall()            
            return result
        except Exception as e:
            logging.error(f'{self.cn} Exception: {e}', exc_info=1)
            logging.error(f'{self.cn} SQL: {sql}')


    def insertData(self, sql: str, values: tuple) -> None:
        """
         Insert data to DB\n
        :Accept - SQL query (str) + Values to insert (tuple)\n
        :Return - None
        """
        try:
            connection = self.connect()
            cursor = connection.cursor()        
            data = cursor.execute(sql, values)                                                  
            connection.commit()                       
        except sqlite3.Error as e:
            logging.error(f'{__class__.__name__ } Exception: {e}')
            logging.error(f'{self.cn} usedSQL {sql}')
            logging.error(f'{self.cn} insertedValues - {values}')
            cursor.close()
        finally:
            cursor.close()
            if connection:
                connection.close()

class DbWorker(object):
    """
    :Database worker class\n
    :Methods for the application database schema update
    """
    def __init__(self):
        self.cn = __class__.__name__
        self.data = DataCollector()
        self.db = SqlProcessor()        

    def getJsonValues(self, json: Dict) -> tuple:
        values = []
        for value in json.values():
            values.append(value)
        result = tuple(values)
        return result
    
    def insertSys(self):
        try:
            system = self.data.getSys()        
            sql = """
            INSERT or IGNORE INTO sysinfo ('os','nodename','cpuarch','cores','ram','d_total','app_name','version')
            VALUES (?,?,?,?,?,?,?,?)
            """
            values = self.getJsonValues(system)
            self.db.insertData(sql, values)            
        except Exception as e:
            logging.error(f'{self.cn} Exception: {e}', exc_info=1)
            logging.error(f'{self.cn} SQL: {sql}')
            logging.error(f'{self.cn} Data: {values}')

    def insertStats(self):
        try:
            cpu = self.getJsonValues(self.data.getCpu()) 
            ram = self.getJsonValues(self.data.getRam())
            disk = self.getJsonValues(self.data.getDisk())
            network = self.getJsonValues(self.data.getNetwork())
            qoe = self.getJsonValues(self.data.getQoeData())
            values = cpu + ram + disk + network + qoe
            bindings = '('
            for char in range(len(values)):
                bindings += '?,'
            bindings += ')'
            sql = f"""
            INSERT INTO stats ('javacpu','cpu_percent', 'loadavg','javamem', 'freeram', 'usedram','u_disk','f_disk','read_io','write_io','sent_b','recv_b','qoe_sessions_min','cpe_data_serial','kpi_data_serial','qoedb_size','sysdb_size')
            VALUES {bindings.replace('?,)','?)')}
            """            
            self.db.insertData(sql, values)            
        except Exception as e:
            logging.error(f'{self.cn} Exception: {e}', exc_info=1)
            logging.error(f'{self.cn} SQL: {sql}')
            logging.error(f'{self.cn} Data: {values}')
    
    def insertPorts(self):
        try:
            acs = self.data.getAcsPorts()
            db = self.data.getDbPorts()
            acsvalues = self.getJsonValues(acs)
            dbvalues = self.getJsonValues(db)
            values = acsvalues + dbvalues            
            acs_ports = JsonSettings.parseJson('settings.json','AcsPorts')
            db_ports = JsonSettings.parseJson('settings.json','DbPorts')
            acs_port_names = JsonSettings.getKeys('acs_port_', acs_ports)                
            db_port_names = JsonSettings.getKeys('db_port_', db_ports)            
            bindings = '('
            for char in range(len(values)):
                bindings += '?,'
            bindings += ')'
            sql = f"""
            INSERT INTO ports ({str(acs_port_names).replace('[','').replace(']','')}, {str(db_port_names).replace('[','').replace(']','')}) 
            VALUES {bindings.replace('?,)','?)')}
            """
            self.db.insertData(sql, values)            
        except Exception as e:
            logging.error(f'{self.cn} Exception: {e}', exc_info=1)
            logging.error(f'{self.cn} SQL: {sql}')
            logging.error(f'{self.cn} Data: {values}')
    
    def periodicUpdate(self):
        """
        Method validates if there is DB schema + insert data
        """
        try:
            if self.db.isDb():
                self.insertStats()
                self.insertPorts()
                logging.info(f'{self.cn}')            
            else:
                self.db.initDb()
                self.insertSys()
                self.insertStats()
                self.insertPorts()
                logging.info(f'{self.cn}')
        except Exception as e:
            logging.critical(f'{self.cn} Exception: {e}')
            logging.critical(f'{self.cn} StackTrace: \n', exc_info=1)

class ReportMetaData(object):
    def __init__(self):
        self.cn = __class__.__name__        

    @staticmethod
    def userKeys() -> List:
        cn = __class__.__name__
        try:            
            user_keys = []
            acs_ports = JsonSettings.parseJson('settings.json','AcsPorts')        
            db_ports = JsonSettings.parseJson('settings.json','DbPorts')              
            acsk = JsonSettings.getKeys('acs_port_', acs_ports)
            dbk = JsonSettings.getKeys('db_port_', db_ports)        
            for i in acsk:
                user_keys.append(i)
            for j in dbk:
                user_keys.append(j)                             
            return user_keys
        except Exception as e:
            logging.error(f'{cn} Exception: {e}', exc_info=1)