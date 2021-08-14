const today = new Date();
const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

class AppView {
    constructor(host, port, isLocalhost, isHazelcast) {
      this.host = host;
      this.port = port;
      this.isLocalhost = isLocalhost;
      this.isHazelcast = isHazelcast;
      this.api_url = "http://"+this.host+":"+this.port+"/api/v1/"
      history.replaceState && history.replaceState(
        null, '', location.pathname + location.search.replace(/[\?&]ip=[^&]+/, '').replace(/^&/, '?')
      );
      this.__prop__ = {
        "ObjectName": this.constructor.name,
        "isLocalhost": this.isLocalhost,
        "isHazelcast": this.isHazelcast,
        "uniqInstanceProperties": [
            this.host, 
            this.port, 
            this.api_url,
            "isHazelcast: "+this.isHazelcast
        ],
        "createdAt": time,
      }
      console.log(JSON.stringify(this.__prop__, undefined, 2));
    }

    __debug(funcName, boolValue){
        let resultObj = {}
        resultObj[funcName] = boolValue        
        console.log(JSON.stringify(resultObj, undefined, 0));
    }
    __rebuild__(){
        try {            
            let ipaddr = document.getElementById("hostSelector").value;
            let param = 'ip='+ipaddr            
            window.location.search += param;
        } catch (error) {
            console.log('ReinitiationError: '+error)
            this.__debug("__rebuild__", false)
            return false;
        }
    }

    __timeNow(){
        try {
            var dateNow = new Date();
            var timeNow = dateNow.getHours() + ":" + dateNow.getMinutes() + ":" + dateNow.getSeconds();
            return timeNow
        } catch (error) {
            console.log("__timeNowError: \n"+ error)
        }
    }

    __updateTime(){
        try {
            let cur_time = this.__timeNow()
            document.getElementById('clock').innerHTML = cur_time
        } catch (error) {
            console.log("__updateTimerError: \n"+ error)
        }
    }

    __setVal(tagName, value){
        if(tagName && value){        
            document.getElementById(tagName).innerHTML = value
            let debug_line = tagName+"="+value
            let result = {}
            result[debug_line] = true
            this.__debug("__setVal", true)
            console.log(tagName+" : "+value)
            return result;   
        } else {
            result[debug_line] = false
            this.__debug("__setVal", false)
            console.log(tagName+" : "+value)
            return result;
        }
    }

    async appHeader(){     
        try {   
            let response = await fetch(this.api_url+'sys'); 
            let data = await response.json();
            if (data){                
                let os = data.os
                let nodename = data.nodename
                let cpuarch = data.cpuarch    
                let cores = data.cores
                let ram = data.ram
                let d_total = data.d_total
                let app_name = data.app_name
                let version = data.version
                let instancesArray = data.instancesArray                     
                for (const ip in instancesArray) {
                    const element = instancesArray[ip];
                    if (element != this.host) {
                        let hostSelector = document.getElementById("hostSelector")                
                        let opt = document.createElement("option");
                        opt.setAttribute("value", element);
                        let text = document.createTextNode(element);
                        opt.appendChild(text);
                        hostSelector.appendChild(opt);
                    }                                                                  
                }
                this.__setVal("os",os)
                this.__setVal("nodename",nodename)
                this.__setVal("app-name", app_name+' server v.'+version)
                this.__setVal("app-title", app_name)           
                this.__setVal("cpuarch",cpuarch)
                this.__setVal("cores",cores)
                this.__setVal("ram",ram)
                this.__setVal("d_total",d_total)
                this.__debug("appHeader",true)
                return true;
            }
        } catch (error) {
            console.log('Error fetching data from back-end: '+error)
            this.__debug("appHeader",false)
            return false;
        }
    }

    async concurentSessionsTable(){
        try {
            let columnsRes = await fetch(this.api_url+'sessionsMeta'); 
            let data = await columnsRes.json();    
            let dataObj = Object.values(data);
            let tr = document.getElementById('concurent-thead');
            let selector = document.getElementById('kpi');
            for (let key1 of dataObj) {
              let th = document.createElement("th");
              th.setAttribute("id", key1);
              let text = document.createTextNode(key1);
              th.appendChild(text);
              tr.appendChild(th);
            }
            for (let key2 of dataObj) {
                if (key2 != 'Updated'){
                  let option = document.createElement("option");
                  option.setAttribute("value", key2);
                  let text = document.createTextNode(key2);
                  option.appendChild(text);
                  selector.appendChild(option);
                }      
              }
            let indexLastColumn = $("#concurent-table-view-tbl").find('tr')[0].cells.length-1;
            let apiUrl = this.api_url+'tableView?kpi=sessions';
            $(document).ready(function() {
                $.ajax({
                    url: apiUrl,
                    method: 'get',
                    dataType: 'json',
                    success: function( data ){
                        $('#concurent-table-view-tbl').DataTable( {
                            "ajax" : {"url": apiUrl, "dataSrc":"data"},
                            "data": data,                          
                            "order":[[indexLastColumn,'desc']]
                    } );
                }});
            });
            this.__debug("concurentSessionsTable", true)
            return true
        } catch (error) {
            console.log("Error: "+error)
            this.__debug("concurentSessionsTable", false)
            return false;
        }
    }
    
    __createTable(table_id, kpi_id){       
        try {
            let indexLastColumn = $("#"+table_id).find('tr')[0].cells.length-1;
            let apiUrl = this.api_url+"tableView?kpi="+kpi_id;
            $(document).ready(function() {
                $.ajax({
                    url: apiUrl,
                    method: 'get',
                    dataType: 'json',
                    success: function( data ){
                        $('#'+table_id).DataTable( {
                            "ajax" : {"url": apiUrl, "dataSrc":"data"},
                            "data": data,      
                            "order":[[indexLastColumn,'desc']]
                    } );
                }});
            });
            this.__debug("__createTable", true);
            console.log("kpi_id : "+kpi_id);
            return true;
        } catch (error) {
            this.__debug("__createTable", false);
            console.log("kpi_id : "+kpi_id);
            return false;
        }        
    }

    async getAllTables(){
        try {
            this.__createTable('cpu-table-view-tbl', 'cpu');
            this.__createTable('ram-table-view-tbl', 'ram');
            this.__createTable('disk-table-view-tbl', 'disk');
            this.__createTable('net-table-view-tbl', 'net');
            this.__createTable('qoe-table-view-tbl', 'qoe');
            if (this.isHazelcast) {
                this.__createTable('haz-table-view-tbl', 'haz');   
            }            
            this.__debug("getAllTables", true);
            return true;
        } catch (error) {
            this.__debug("getAllTables", false)
            return false
        }
    }

    async graphView(){
        try {
            let kpi_id = document.getElementById("kpi").value
            let node = document.getElementById("kpi");
            let text = node.options[node.selectedIndex].text;            
            let response = await fetch(this.api_url+'graphData?kpi='+kpi_id);
            let data = await response.json();     
            let layout = {
                title: text
            }
            let graph = {
                x: data['updated'],
                y: data[kpi_id],
                type: 'lines+markers',            
            };
            if (document.getElementById('plot-container plotly')){
                Plotly.purge('graph-div');    
                Plotly.newPlot('graph-div', [graph], layout)
            } else {
                Plotly.newPlot('graph-div', [graph], layout)    
            }
           this.__debug("graphView", true);
           console.log("graphName: "+text);
           return true;
        } catch (error) {
            this.__debug("graphView", false);
            console.log("Error: "+ error);
            return false;
        }
    }

    async createServerReport(){
        try {
            let response, data;
            response = await fetch(this.api_url+'createServerReport');
            data = await response.json();
            let filename = data.filename;
            document.getElementById('download-server').href = this.api_url+"downloadCsv?file="+filename;
            document.getElementById('download-server').innerHTML = "Download "+filename;
            document.getElementById('download-server').style.display = 'block';
            this.__debug("createServerReport", true);
            console.log("ReportName: "+filename);
            return true;
        } catch (error) {
            this.__debug("createServerReport", false);
            console.log("Error: "+error);
            return false;
        }  
    }
    
    async createSessionsReport(){
        try {
            let response, data;
            response = await fetch(this.api_url+'createSessionsReport');
            data = await response.json();       
            let filename = data.filename;     
            document.getElementById('download-sessions').href = this.api_url+"downloadCsv?file="+filename; 
            document.getElementById('download-sessions').innerHTML = "Download "+filename; 
            document.getElementById('download-sessions').style.display = 'block'
            this.__debug("createSessionsReport", true);
            console.log("ReportName: "+ filename);
            return true;
        } catch (error) {
            this.__debug("createSessionsReport", false);
            console.log("Error: "+error);
            return false;
        }
    }
    
    open(pageName,elmnt) {
        let i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
          tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablink");
        for (i = 0; i < tablinks.length; i++) {
          tablinks[i].style.backgroundColor = "";
        }    
        document.getElementById(pageName).style.display = "block";    
        elmnt.style.backgroundColor = 'green';
    }

    async createMainView(){
        try {
            document.getElementById("table-view").click();
            this.appHeader();            
            this.concurentSessionsTable();
            this.getAllTables()
            this.__debug("createMainView", true);
            return true;
        } catch (error) {
            this.__debug("createMainView", false);
            return false;        
        }
    }
}
