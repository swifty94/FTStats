from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import cross_origin, CORS
import requests
import logging
import logging.config
from os import path
from controllers import DataCollector, JsonSettings
from model import GraphStats, TableStats, CsvStats

log_file_path = path.join(path.dirname(path.abspath(__file__)), 'logging.ini')
logging.config.fileConfig(log_file_path)
app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.errorhandler(404)
def notImplemeted(e):
    data = {
      "HttpErrorCode ": f"{e}\n",
      "FTStatsErrorText ": "NotImplementedEndpoint"
    }
    return render_template('error.html', data=data), 404
    
@app.route('/api/v1/ram', methods=['GET'])
@cross_origin()
def ram():
  try:
    data = DataCollector()
    outcome = data.getRam()    
    return jsonify(outcome)
  except Exception as e:
    logging.error(f'Request -> /api/v1/ram -> {e}', exc_info=1)

@app.route('/api/v1/cpu', methods=['GET'])
@cross_origin()
def cpu():
  try:
    data = DataCollector()
    outcome = data.getCpu()    
    return jsonify(outcome)
  except Exception as e:
    logging.error(f'Request -> /api/v1/cpu -> {e}', exc_info=1)

@app.route('/api/v1/network', methods=['GET'])
@cross_origin()
def network():
  try:
    data = DataCollector()
    outcome = data.getNetwork()    
    return jsonify(outcome)
  except Exception as e:
    logging.error(f'Request -> /api/v1/network -> {e}', exc_info=1)

@app.route('/api/v1/disk', methods=['GET'])
@cross_origin()
def disk():
  try:
    data = DataCollector()
    outcome = data.getDisk()    
    return jsonify(outcome)
  except Exception as e:
    logging.error(f'Request -> /api/v1/disk -> {e}', exc_info=1)

@app.route('/api/v1/sys', methods=['GET'])
@cross_origin()
def sys():
  try:
    data = DataCollector()
    outcome = data.getSys()    
    return jsonify(outcome)
  except Exception as e:
    logging.error(f'Request -> /api/v1/sys -> {e}', exc_info=1)

@app.route('/api/v1/acsport', methods=['GET'])
@cross_origin()
def acsport():
  try:
    data = DataCollector()
    outcome = data.getAcsPorts()    
    return jsonify(outcome)
  except Exception as e:
    logging.error(f'Request -> /api/v1/acsport -> {e}', exc_info=1)

@app.route('/api/v1/dbport', methods=['GET'])
@cross_origin()
def dbport():
  try:
    data = DataCollector()
    outcome = data.getDbPorts()    
    return jsonify(outcome)
  except Exception as e:
    logging.error(f'Request -> /api/v1/dbport -> {e}', exc_info=1)


@app.route('/api/v1/graphData', methods=['GET'])
@cross_origin()
def graphData():
  try:    
    if 'kpi' in request.args:    
      kpi = str(request.args['kpi'])    
      g = GraphStats()
      outcome = g.KpiVsTime(kpi)      
      return jsonify(outcome)
    else:
      logging.error('Not enough arguments provided')
      return False
  except Exception as e:
    logging.error(f'Request -> /api/v1/graphData -> {e}', exc_info=1)


@app.route('/api/v1/sessionsMeta', methods=['GET'])
@cross_origin()
def sessionsMeta():
  try:
    t = TableStats()
    res = t._getMeta()
    return jsonify(res)
  except Exception as e:
    logging.error(f'Request -> /api/v1/sessionsMeta -> {e}', exc_info=1)

@app.route('/api/v1/tableView', methods=['GET'])
@cross_origin()
def tableView():
  try:
    args = request.args
    if 'kpi' in args:
      kpi = str(request.args['kpi'])
      t = TableStats()
      outcome = t.createView(kpi)
      logging.info(f'Request -> /api/v1/tableView?kpi={kpi}')
    return jsonify(outcome)  
  except Exception as e:
    logging.error(f'Request -> /api/v1/tableView -> {e}', exc_info=1)


@app.route('/api/v1/createServerReport',methods=['GET'])
@cross_origin()
def createServerReport():
  try:        
    c = CsvStats()
    outcome = c.createServerReport()    
    return jsonify(outcome)
  except Exception as e:
    logging.error(f'Request -> /api/v1/createServerReport -> {e}', exc_info=1)

@app.route('/api/v1/createSessionsReport',methods=['GET'])
@cross_origin()
def createSessionsReport():
  try:        
    c = CsvStats()
    outcome = c.createSessionsReport()    
    return jsonify(outcome)
  except Exception as e:
    logging.error(f'Request -> /api/v1/createSessionsReport -> {e}', exc_info=1)


@app.route('/api/v1/downloadCsv',methods=['GET'])
def download_file():
  args = request.args
  if 'file' in args:    
	  path = str(request.args['file'])
	  return send_from_directory('reports/', path, as_attachment=True)
    
@app.route('/stats', methods=['POST', 'GET'])
def stats():
  try:
    args = request.args
    if 'ip' in args:
      ip = str(request.args['ip'])
      isLocalhost = False
    else:
      ip = '127.0.0.1'
      isLocalhost = True

    hostData = {
      "ip": ip,
      "port": int(JsonSettings.parseJson("settings.json", 'TcpPort')),
      "isLocalhost": isLocalhost,
      "isHazelcast": bool(JsonSettings.parseJson("settings.json", 'isHazelcast')),
      }

    return render_template('stats.html', hostData=hostData)
  except Exception as e:
    logging.error(f'Request -> /stats -> {e}', exc_info=1)    