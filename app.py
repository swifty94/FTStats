import time
import atexit
from os import path
from controllers import JsonSettings, DbWorker ,logging
from apscheduler.schedulers.background import BackgroundScheduler
from waitress import serve
from view import app

class FTStatsServer(object):
    def __init__(self):
        self.cn = __class__.__name__
        logging.info(f'{self.cn} -----> Application start <-----')
        logging.info(f'{self.cn} Parsing config')
        self.json = path.join(path.dirname(path.abspath(__file__)), 'settings.json')
        self.IpAddr = JsonSettings.parseJson(self.json, 'IpAddr')
        self.TcpPort = int(JsonSettings.parseJson(self.json, 'TcpPort'))        
        self.dbUpdateInterval = int(JsonSettings.parseJson(self.json, 'DbUpdateIntervalSec'))

    def run(self):
        try:            
            scheduler = BackgroundScheduler()
            DbUpdate = DbWorker()
            logging.info(f'{self.cn} Database validation')
            DbUpdate.periodicUpdate()
            logging.info(f'{self.cn} Setting up DbUpdate BackgroundScheduler')
            scheduler.add_job(func=DbUpdate.periodicUpdate, trigger="interval", seconds=self.dbUpdateInterval)
            scheduler.start()
            logging.info(f'{self.cn} Setting up Flask WSGI server')
            logging.info(f'{self.cn} -----> WSGI server started <-----')
            logging.info(f'{self.cn} Running on: {self.IpAddr}:{self.TcpPort}')
            logging.info(f'{self.cn} DB update periodic interval: {self.dbUpdateInterval} sec')
            serve(app, host=self.IpAddr, port=self.TcpPort)
        except Exception as e:
            logging.critical(f'{self.cn} Critical exception: {e}', exc_info=1)
            logging.critical(f'{self.cn} Application cannot be started due to the error above since it has occured in the entry point\nEXIT')
            exit(1)
        except KeyboardInterrupt as k:
            logging.info(f'{self.cn} Event KeyboardInterrupt catched')
            logging.info(f'{self.cn} -----> Application shutdown forced <-----')
            exit(0)
        finally:
            logging.info(f'{self.cn} Shutdown DbUpdate BackgroundScheduler')
            atexit.register(lambda: scheduler.shutdown())
            logging.info(f'{self.cn} Cleaning all buffers/threads')        
            logging.info(f'{self.cn} Shutdown Flask WSGI server')                        
            logging.info(f'{self.cn} -----> Application stop <-----')
            logging.shutdown()


if __name__ == "__main__":
    engine = FTStatsServer()
    engine.run()