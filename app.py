import time
import atexit
from os import path
import controllers
from apscheduler.schedulers.background import BackgroundScheduler
from waitress import serve
from view import app

class FTStatsServer(object):
    def __init__(self):
        self.cn = __class__.__name__
        controllers.logging.info(f'{self.cn} -----> Application start <-----')
        controllers.logging.info(f'{self.cn} Parsing config')
        self.json = path.join(path.dirname(path.abspath(__file__)), 'settings.json')
        self.IpAddr = controllers.JsonSettings.parseJson(self.json, 'IpAddr')
        self.TcpPort = int(controllers.JsonSettings.parseJson(self.json, 'TcpPort'))        
        self.dbUpdateInterval = int(controllers.JsonSettings.parseJson(self.json, 'DbUpdateIntervalSec'))
        self.dbTruncateInterval = int(controllers.JsonSettings.parseJson(self.json, 'DbTruncateIntervalSec'))

    def run(self):
        try:            
            scheduler = BackgroundScheduler()
            DbUpdate = controllers.DbWorker()
            controllers.logging.info(f'{self.cn} Database validation')
            DbUpdate.periodicUpdate()
            if self.dbUpdateInterval == 0:                
                controllers.logging.info(f"{self.cn} DbUpdate:  !!!DISABLED.")
                controllers.logging.info(f'{self.cn} Setting up Flask WSGI server')
                controllers.logging.info(f'{self.cn} -----> WSGI server started <-----')
                controllers.logging.info(f'{self.cn} Running on: {self.IpAddr}:{self.TcpPort}')                
                serve(app, host=self.IpAddr, port=self.TcpPort)
            elif self.dbUpdateInterval > 0 and self.dbTruncateInterval > 0:
                controllers.logging.info(f'{self.cn} Setting up DbUpdate BackgroundScheduler')
                scheduler.add_job(func=DbUpdate.periodicUpdate, trigger="interval", seconds=self.dbUpdateInterval)
                controllers.logging.info(f'{self.cn} Setting up DbTruncate BackgroundScheduler')
                scheduler.add_job(func=DbUpdate.periodicTruncate, trigger="interval", seconds=self.dbTruncateInterval)
                scheduler.start()
                controllers.logging.info(f'{self.cn} Setting up Flask WSGI server')
                controllers.logging.info(f'{self.cn} -----> WSGI server started <-----')
                controllers.logging.info(f'{self.cn} Running on: {self.IpAddr}:{self.TcpPort}')
                controllers.logging.info(f'{self.cn} DB update periodic interval: {self.dbUpdateInterval} sec')
                controllers.logging.info(f'{self.cn} DB truncate periodic interval: {self.dbTruncateInterval} sec')
                serve(app, host=self.IpAddr, port=self.TcpPort)
            elif self.dbUpdateInterval < 0 or self.dbUpdateInterval is None:
                exception_line = f"""
                \ndbUpdateInterval cannot be None or negative int
                \n:param  dbUpdateInterval == 0 -> disabled or dbUpdateInterval > 0 -> enabled
                \nsettings.json -> dbUpdateInterval = {self.dbUpdateInterval}
                """
                raise Exception(exception_line)
        except Exception as e:
            controllers.logging.critical(f'{self.cn} Critical exception: {e}', exc_info=1)
            controllers.logging.critical(f'{self.cn} Application cannot be started due to the error above since it has occured in the entry point\nEXIT')
            exit(1)
        except KeyboardInterrupt as k:
            controllers.logging.info(f'{self.cn} Event KeyboardInterrupt catched')
            controllers.logging.info(f'{self.cn} -----> Application shutdown forced <-----')
            exit(0)
        finally:
            controllers.logging.info(f'{self.cn} Shutdown DbUpdate BackgroundScheduler')
            atexit.register(lambda: scheduler.shutdown())
            controllers.logging.info(f'{self.cn} Cleaning all buffers/threads')        
            controllers.logging.info(f'{self.cn} Shutdown Flask WSGI server')                        
            controllers.logging.info(f'{self.cn} -----> Application stop <-----')
            controllers.logging.shutdown()


if __name__ == "__main__":
    engine = FTStatsServer()
    engine.run()