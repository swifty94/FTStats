import os, time, datetime, csv
from typing import Dict, List, AnyStr, Union
from controllers import JsonSettings, SqlProcessor, ReportMetaData, logging

class GraphStats(object):
    def __init__(self):
        self.db = SqlProcessor()
        self.cn = __class__.__name__
    
    def KpiVsTime(self, kpi: str) -> Dict:
        try:            
            data = {}
            val_array = []
            date_array = []
            if "acs_port" in kpi:
                dates = self.db.selectData(f'select updated from ports')
                values = self.db.selectData(f'select {kpi} from ports')
            elif "db_port" in kpi:                
                dates = self.db.selectData(f'select updated from ports')
                values = self.db.selectData(f'select {kpi} from ports')
            else:
                dates = self.db.selectData(f'select updated from stats')
                values = self.db.selectData(f'select {kpi} from stats')           
            
            for tup in values:
                for item in tup:
                    val_array.append(item)            
            for tup in dates:
                for item in tup:            
                    date_array.append(item)
            
            data[kpi] = val_array
            data['updated'] = date_array

            return data            
        except Exception as e:
            logging.error(f'{self.cn} Exception: {e}', exc_info=1)
        finally:
            logging.info(f'{self.cn} GeneratedGraph: {kpi}')

class TableStats(object):
    def __init__(self):
        self.cn = __class__.__name__
        self.db = SqlProcessor()
        self.meta = ReportMetaData()

    def _getMeta(self):
        try:
            json = {}        
            columns = self.meta.userKeys()
            idx = 0     
            for col in columns:
                idx += 1
                json[f'col-{idx}'] = col
            json['timestamp'] = 'Updated'
            return json
        except Exception as e:            
            logging.error(f'{self.cn} Exception: {e}', exc_info=1)
    
    def _set(self, *args: AnyStr, table='stats') -> Dict:
        """
        :param args* -> key to paste into SELECT statetment\n
        :return -> data dictionary\n
        :e.g: _set("freeram,usedram,javamem,updated")
        """
        try:
            sql = f"select {args} from {table} order by updated".replace('\'','').replace('(','').replace(')','').replace('updated,','updated')            
            data = self.db.selectData(sql)
            logging.info(f'SQL query used:\n{sql}')     
            main_array = []
            data_object = {}         
            for item in data:
                main_array.append(list(item))
            data_object["data"] = main_array        
            return data_object
        except Exception as e:            
            logging.error(f'{self.cn} Exception: {e}', exc_info=1)
        
    def createView(self, kpi: str) -> Dict:
        try:
            if kpi == 'ram':
                data = self._set("freeram, usedram, javamem, updated")
            elif kpi == 'cpu':
                data = self._set("javacpu, cpu_percent, loadavg, updated")
            elif kpi == 'disk':
                data = self._set("u_disk, f_disk, updated")
            elif kpi == 'net':
                data = self._set("errin, errout, dropin, dropout, updated")
            elif kpi == 'qoe':
                data = self._set("qoe_sessions_min,cpe_data_serial,qoedb_size,updated")
            elif kpi == 'haz':
                data = self._set("nodeName, nodeState, clusterState, clusterSize, updated", table='haz_info')
            elif kpi == 'sessions':
                columns = self.meta.userKeys()
                columns = str(columns).replace('[','').replace(']','').replace('\'','')
                data = self.db.selectData(f"select {columns}, updated as timestamp from ports")
                main_array = []
                data_object = {}         
                for item in data:
                    main_array.append(list(item))
                data_object["data"] = main_array        
                return data_object                        
                logging.info(f'Data from backend:\n{data_object}')
            
            return data
        except Exception as e:
            logging.error(f'{self.cn} Exception: {e}', exc_info=1)
        finally:
            logging.info(f'{self.cn} GeneratedView: {kpi}')


class CsvStats(object):
    def __init__(self):
        self.cn = __class__.__name__        
        self.db = SqlProcessor()
        self.meta = ReportMetaData()
                
    def createServerReport(self):        
        try:                                          
            now = datetime.datetime.now()
            date = now.strftime("%m-%d-%H-%M-%S")
            report_name = f'reports/FTStats_server_report_{date}.csv'                         
            connection = self.db.connect()
            cursor  = connection.cursor()
            cursor.execute("select javacpu,cpu_percent,loadavg,javamem,freeram,usedram,u_disk,f_disk, errin, errout, dropin, dropout,qoe_sessions_min,cpe_data_serial,qoedb_size, strftime('%Y_%d_%m_%H_%M_%S', updated) as timestamp from stats")
            with open(report_name, "w", newline='') as csv_file:
                csv_writer = csv.writer(csv_file, delimiter=',', lineterminator='\n')
                csv_writer.writerow([i[0] for i in cursor.description])
                csv_writer.writerows(cursor)
            if os.stat(report_name).st_size != 0:            
                data = {'filename': report_name.replace('reports/','')}
                return data
        except Exception as e:
            logging.error(f'{self.cn} Exception {e}',exc_info=1)
        finally:
            logging.info(f'{self.cn} GeneratedCsv: {data}')

    def createSessionsReport(self):        
        try:                                          
            now = datetime.datetime.now()
            date = now.strftime("%m-%d-%H-%M-%S")
            report_name = f'reports/FTStats_sessions_report_{date}.csv'                         
            columns = self.meta.userKeys()
            columns = str(columns).replace('[','').replace(']','').replace('\'','')
            connection = self.db.connect()
            cursor  = connection.cursor()
            cursor.execute(f"select {columns}, strftime('%Y_%d_%m_%H_%M_%S', updated) as timestamp from ports")
            with open(report_name, "w", newline='') as csv_file:
                csv_writer = csv.writer(csv_file, delimiter=',', lineterminator='\n')
                csv_writer.writerow([i[0] for i in cursor.description])
                csv_writer.writerows(cursor)
            if os.stat(report_name).st_size != 0:            
                data = {'filename': report_name.replace('reports/','')}
                return data
        except Exception as e:
            logging.error(f'{self.cn} Exception {e}',exc_info=1)
        finally:
            logging.info(f'{self.cn} GeneratedCsv: {data}')
