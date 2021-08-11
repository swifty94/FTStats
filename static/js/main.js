class AppView {
    constructor(host, port) {
      this.host = host;
      this.port = port;
      this.url = "http://"+this.host+":"+this.port+"/api/v1/"
    }

    __reinit__(){
        try {
            let ipaddr = document.getElementById("hostSelector").value;
            let param = 'ip='+ipaddr
            window.location.search += param;
        } catch (error) {
            console.log('ReinitiationError: '+error)
            let result = {
                "__reinit__": false
            }
            console.log(result);
            return result;
        }
    }

    __setVal(tagName, value){
        if(tagName && value){        
            document.getElementById(tagName).innerHTML = value
            let result = {
                "_setVal -> ${value}": true
            }
            console.log(result);
            return result;   
        } else {
            let result = {
                "_setVal -> ${value}": false
            }
            console.log(result);
            return result;
        }
    }

    async appHeader(){     
        try {   
            let response = await fetch(this.url+'sys'); 
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
                    let hostSelector = document.getElementById("hostSelector")                
                    let opt = document.createElement("option");
                    opt.setAttribute("value", element);
                    let text = document.createTextNode(element);
                    opt.appendChild(text);
                    hostSelector.appendChild(opt);            
                }
                this.__setVal("os",os)
                this.__setVal("nodename",nodename)
                this.__setVal("app-name", app_name+' server v.'+version)
                this.__setVal("app-title", app_name)           
                this.__setVal("cpuarch",cpuarch)
                this.__setVal("cores",cores)
                this.__setVal("ram",ram)
                this.__setVal("d_total",d_total)
                let result = {
                    "appHeaderCreated":true
                }
                console.log(result);
                return result;
            }
        } catch (error) {
            console.log('Error fetching data from back-end: '+error)
            let result = {
                "appHeaderCreated":true
            }
            console.log(result);
            return result;
        }
    }

    async concurentSessionsTable(){
        try {
            let indexLastColumn = $("#concurent-table-view-tbl").find('tr')[0].cells.length-1;
            let apiUrl = this.url+'tableView?kpi=sessions';
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
            let result = {
                "concurentSessionsTableContent": true
            }
            console.log(result);
            return result
        } catch (error) {
            let result = {
                "concurentSessionsTableContent": false
            }
            console.log(result);
            return result;
        }
    }
    
    __createTable(table_id, kpi_id){       
        try {
            let indexLastColumn = $("#"+table_id).find('tr')[0].cells.length-1;
            let apiUrl = this.url+"tableView?kpi="+kpi_id;
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
            let result = {
                "__createTable": true,
                "table_id": table_id,
                "kpi_id": kpi_id
            }
            console.log(result);
            return result
        } catch (error) {
            let result = {
                "__createTable": false,
                "table_id": table_id,
                "kpi_id": kpi_id
            }
            console.log(result);
            return result;
        }        
    }

    async getAllTables(){
        try {
            this.__createTable('cpu-table-view-tbl', 'cpu');
            this.__createTable('ram-table-view-tbl', 'ram');
            this.__createTable('disk-table-view-tbl', 'disk');
            this.__createTable('net-table-view-tbl', 'net');
            this.__createTable('qoe-table-view-tbl', 'qoe');
            let result = {
                "getAllTables": true             
            }
            console.log(result);
            return result
        } catch (error) {
            let result = {
                "getAllTables": false
            }
            console.log(result);
            return result;
        }
    }

    async graphView(){
        try {
            let kpi_id = document.getElementById("kpi").value
            let node = document.getElementById("kpi");
            let text = node.options[node.selectedIndex].text;            
            let response = await fetch(this.url+'graphData?kpi='+kpi_id);
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
            let result = {
                "GraphCreated": text,
                "Status": true
            }
            console.log(result)
            return result;
        } catch (error) {
            console.log('Error fetching data from back-end: '+error)
            let result = {
                "GraphCreated": text,
                "Status": false
            }
            console.log(result)
            return result;
        }
    }

    async createServerReport(){
        try {
            let response, data;
            response = await fetch(this.url+'createServerReport');
            data = await response.json();
            document.getElementById('download-server').href = API+"downloadCsv?file="+data.filename 
            document.getElementById('download-server').innerHTML = "Download "+data.filename    
            document.getElementById('download-server').style.display = 'block'
            let result = {
                "ReportName":data.filename,
                "Status": true
            }
            console.log(result)
            return result
        } catch (error) {
            console.log('Error fetching data from back-end: '+error)
            let result = {
                "ReportName":data.filename,
                "Status": false
            }
            console.log(result)
            return result
        }  
    }
    
    async createSessionsReport(){
        try {
            let response, data;
            response = await fetch(this.url+'createSessionsReport');
            data = await response.json();            
            document.getElementById('download-sessions').href = API+"downloadCsv?file="+data.filename 
            document.getElementById('download-sessions').innerHTML = "Download "+data.filename    
            document.getElementById('download-sessions').style.display = 'block'
            let result = {
                "ReportName":data.filename,
                "Status": true
            }
            console.log(result)
            return result
        } catch (error) {
            console.log('Error fetching data from back-end: '+error)
            let result = {
                "ReportName":data.filename,
                "Status": false
            }
            console.log(result)
            return result
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
            let result = {                
                "createMainView": true
            }
            console.log(result)
            return result
        } catch (error) {
            console.log('Error fetching data from back-end: '+error)
            let result = {                
                "createMainView": false
            }
            console.log(result)
            return result          
        }
    }
}
