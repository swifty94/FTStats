const today = new Date();
const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

class AppView {
    constructor(host, port, isLocalhost, isHazelcast, isLiveStats, creator) {
      this.host = host;
      this.port = port;
      this.isLocalhost = isLocalhost;
      this.isHazelcast = isHazelcast;
      this.isLiveStats = isLiveStats;
      this.creator = creator;
      this.api_url = "http://"+this.host+":"+this.port+"/api/v1/"

      history.replaceState && history.replaceState(
        null, '', location.pathname + location.search.replace(/[\?&]ip=[^&]+/, '').replace(/^&/, '?')
      );

      this.__prop__ = {
        "ObjectName": this.constructor.name,
        "uniqInstanceProperties": [
            this.host, 
            this.port, 
            this.api_url,
            "isLocalhost: "+ this.isLocalhost,
            "isHazelcast: "+ this.isHazelcast,
            "isLiveStats: "+ this.isLiveStats
        ],
        "createdBy": creator,
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
        try {
            if(tagName && value){        
                document.getElementById(tagName).innerHTML = value
                this.__debug("__setVal", true)
                console.log(tagName+" : "+value)
                return true;   
            } else {
                this.__debug("__setVal", false)
                console.log(tagName+" : "+value)
                return false;
            }
        } catch (error) {
            console.log("Error: \n"+ error)
        }
    }

    async appHeader(){     
        try {   
            let response = await fetch(this.api_url+'sys'); 
            let data = await response.json();
            let avg_res = await fetch(this.api_url+'avg');
            let avg_data = await avg_res.json();
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
                let javacpu_avg = avg_data.javacpu_avg
                let cpu_percent_avg = avg_data.cpu_percent_avg
                let loadavg_avg = avg_data.loadavg_avg
                let freeram_avg = avg_data.freeram_avg
                let usedram_avg = avg_data.usedram_avg
                let javamem_avg = avg_data.javamem_avg
                
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
                this.__setVal("os", os);
                this.__setVal("nodename", nodename);
                this.__setVal("app-name", app_name+' server v.'+version);
                this.__setVal("app-title", app_name);    
                this.__setVal("cpuarch", cpuarch);
                this.__setVal("cores", cores);
                this.__setVal("ram", ram);
                this.__setVal("d_total", d_total);
                this.__setVal('cpu_percent_avg', cpu_percent_avg);
                this.__setVal('freeram_avg', freeram_avg);
                this.__setVal('javacpu_avg', javacpu_avg );
                this.__setVal('javamem_avg', javamem_avg);
                this.__setVal('loadavg_avg', loadavg_avg);                
                this.__setVal('usedram_avg', usedram_avg);
                this.__debug("appHeader",true);
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

    insertAfter(referenceNode, newNode) {
        try {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
            console.log("Inserted newNode: "+newNode+" after referenceNode: "+referenceNode)
        } catch (error) {
            console.log("Error: "+error)
        }
        
    }
    createMultiKpiSelector(){
        let is_multi_kpi = document.getElementById("multi-kpi").checked
        console.log("createMultiKpiSelector: multi-kpi = "+is_multi_kpi)
        if (is_multi_kpi) {
            let kpi_selector = document.getElementById('kpi-selector')
            let new_selector = kpi_selector.cloneNode(true)
            new_selector.id = "kpi-selector-2"
            let new_id = new_selector.id
            this.insertAfter(kpi_selector, new_selector)
            document.getElementById(new_id).firstElementChild.id = "kpi-label-2"
            document.getElementById(new_id).firstElementChild.for = "kpi-2"
            document.getElementById('kpi-selector-2').children[1].id = 'kpi-2'
            document.getElementById('kpi-selector-2').children[1].name = 'kpi-2'
            this.__setVal('kpi-label-2', 'Choose second KPI')
            console.log("Cloned KPI selector with id = "+new_id)

        } else {
            let new_selector = document.getElementById('kpi-selector-2')
            new_selector.remove()
            console.log("Removed second selector kpi-selector-2")
        }
    }

    async graphView(){
        try {
            let kpi = document.getElementById("kpi")
            let kpi2 = document.getElementById("kpi-2")

            if (typeof(kpi) != 'undefined' && kpi != null && typeof(kpi2) != 'undefined' && kpi2 != null) {
                let kpi_id = document.getElementById("kpi").value
                let kpi_id2 = document.getElementById("kpi-2").value

                let node = document.getElementById("kpi");
                let node2 = document.getElementById("kpi-2");


                let text = node.options[node.selectedIndex].text;
                let text2 = node2.options[node2.selectedIndex].text;

                let response = await fetch(this.api_url+'graphData?kpi='+kpi_id);
                let data = await response.json();

                let response2 = await fetch(this.api_url+'graphData?kpi='+kpi_id2);
                let data2 = await response2.json();

                let title = text + " vs " + text2
                let layout = {
                    title: title
                }
                let graph = {
                    x: data['updated'],
                    y: data[kpi_id],
                    type: 'lines+markers',
                    name: text         
                };
                let graph2 = {
                    x: data2['updated'],
                    y: data2[kpi_id2],
                    type: 'lines+markers',
                    name: text2          
                };
                var multiplot = [ graph, graph2 ];

                if (document.getElementById('plot-container plotly')){
                    Plotly.purge('graph-div');    
                    Plotly.newPlot('graph-div', multiplot, layout)
                } else {
                    Plotly.newPlot('graph-div', multiplot, layout)    
                }
               this.__debug("graphView", true);
               console.log("graphName: "+text);
               return true;
            } else if (typeof(kpi) != 'undefined' && kpi != null) {
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
            }              
        } catch (error) {
            this.__debug("graphView", false);
            console.log("Error: "+ error);
            return false;
        }
    }
    
    deleteGraph(){
        try {
            Plotly.purge('graph-div');
            console.log('Cleaned graphs')
        } catch (error) {
            console.log('Error: \n'+error)
        }
        Plotly.purge('graph-div');
    }

    async liveGraph(){
        try {
            let response = await fetch(this.api_url+'liveUpdate');
            let data = await response.json();
            let cpu = data.cpu;
            let ram = data.ram;
            var javacpu = {
                x: ['Java CPU usage'],
                y: [cpu.javacpu],
                type: 'bar',
                name: 'Java CPU usage '
              };
            var cpu_percent = {
                x: ['CPU %'],
                y: [cpu.cpu_percent],
                type: 'bar',
                name: 'CPU %'
            };
            var loadavg = {
                x: ['CPU load avg'],
                y: [cpu.loadavg],
                type: 'bar',
                name: 'CPU load avg'
            };
            var freeram = {
                x: ['Free RAM'],
                y: [ram.freeram],
                type: 'bar',
                name: 'Free RAM'
            };
            var usedram = {
                x: ['Used RAM'],
                y: [ram.usedram],
                type: 'bar',
                name: 'Used RAM'
            };
            var javamem = {
                x: ['Java RAM'],
                y: [ram.javamem],
                type: 'bar',
                name: 'Java RAM'
            };            
            var cpuBarData = [javacpu, cpu_percent, loadavg];
            var ramBarData = [freeram, usedram, javamem];

            if (document.getElementById('plot-container plotly')){
                Plotly.purge('live-cpu-bar');
                Plotly.purge('live-ram-bar');  
                Plotly.newPlot('live-cpu-bar', cpuBarData);
                Plotly.newPlot('live-ram-bar', ramBarData);
            } else {
                Plotly.newPlot('live-cpu-bar', cpuBarData);
                Plotly.newPlot('live-ram-bar', ramBarData);
            }
            console.log("LiveUpdateStatus = True");
        } catch (error) {
            console.log("Error: "+error);
            console.log("LiveUpdateStatus = False");
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
            document.getElementById("dashboard-view").click();
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
