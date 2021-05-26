function _setVal(tagName, value){
    if(tagName && value){        
        document.getElementById(tagName).innerHTML = value        
    } else {        
        return false
}}
     
async function headerInfo(){
    // get data from back-end
    var response, data, os, nodename, cpuarch, cores, ram, d_total, app_name, version;
    try {
        response = await fetch('/api/v1/sys'); 
        data = await response.json();
        if (data){                        
            // unpack values
            os = data.os
            nodename = data.nodename
            cpuarch = data.cpuarch    
            cores = data.cores
            ram = data.ram
            d_total = data.d_total
            app_name = data.app_name
            version = data.version
            _setVal("os",os)
            _setVal("nodename",nodename)
            _setVal("app-name", app_name+' server v.'+version)
            _setVal("app-title", app_name)           
            _setVal("cpuarch",cpuarch)
            _setVal("cores",cores)
            _setVal("ram",ram)
            _setVal("d_total",d_total)            
            // log for debug
            console.log('Page header created')
        }
    } catch (error) {
        console.log('Error fetching data from back-end: '+error)
    }    
}

async function generateTableHead() {
    var columnsRes = await fetch('/api/v1/sessionsMeta'); 
    var data = await columnsRes.json();    
    var dataObj = Object.values(data)
    var tr = document.getElementById('concurent-thead')
    for (let key of dataObj) {
      let th = document.createElement("th");
      th.setAttribute("id", key);
      let text = document.createTextNode(key);
      th.appendChild(text);
      tr.appendChild(th);
    } 
  }

async function assignOptions() {
    var columnsRes = await fetch('/api/v1/sessionsMeta'); 
    var data = await columnsRes.json();    
    var dataObj = Object.values(data)
    var selector = document.getElementById('kpi')
    for (let key of dataObj) {
      if (key != 'Updated'){
        let option = document.createElement("option");
        option.setAttribute("value", key);
        let text = document.createTextNode(key);
        option.appendChild(text);
        selector.appendChild(option);
      }      
    } 
  }

async function concurentSessionsTable(){     
    var indexLastColumn = $("#concurent-table-view-tbl").find('tr')[0].cells.length-1;
    var url = '/api/v1/tableView?kpi=sessions'    
    $(document).ready(function() {
        $.ajax({
            url: url,
            method: 'get',
            dataType: 'json',
            success: function( data ){
                $('#concurent-table-view-tbl').DataTable( {
                    "ajax" : {"url": url, "dataSrc":"data"},
                    "data": data,                          
                    "order":[[indexLastColumn,'desc']]
            } );
        }});
    })
}

function createTable(table_id, kpi_id){
    var url, indexLastColumn, table;
    indexLastColumn = $("#"+table_id).find('tr')[0].cells.length-1;
    url = '/api/v1/tableView?kpi='+kpi_id
    console.log('Processing data for table: '+table_id+'\nUrl: '+url)
    $(document).ready(function() {
        $.ajax({
            url: url,
            method: 'get',
            dataType: 'json',
            success: function( data ){
                $('#'+table_id).DataTable( {
                    "ajax" : {"url": url, "dataSrc":"data"},
                    "data": data,      
                    "order":[[indexLastColumn,'desc']]
            } );
        }});
    })
}

async function drawGraph(apiUrl, xTime, yValue, htmlTag, graphName){
    var response = await fetch(apiUrl); 
    var data = await response.json();
    var isData = Object.values(data).length    
    var layout = {
        title: graphName
    }
    if (!isData){
        console.log('No data to display')
        document.getElementById(htmlTag).innerHTML = 'No data to display'
    }else{        
        var graph = {
            x: data[xTime],
            y: data[yValue],
            type: 'lines+markers',            
        };
        Plotly.newPlot(htmlTag, [graph], layout)
    }}

async function graphView(){
    var kpi, response, data, node, value, text;    
    kpi_id = document.getElementById("kpi").value    
    node = document.getElementById("kpi");
    value = node.options[node.selectedIndex].value;
    text = node.options[node.selectedIndex].text;            
    response = await fetch('/api/v1/graphData?kpi='+kpi_id);
    data = await response.json();     
    var layout = {
        title: text
    }
    var graph = {
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
}

async function createServerReport(){
    var response, data, download_link;
    response = await fetch('/api/v1/createServerReport');
    data = await response.json();
    console.log('File created: '+data.filename)
    document.getElementById('download-server').href = "/api/v1/downloadCsv?file="+data.filename 
    document.getElementById('download-server').innerHTML = "Download "+data.filename    
    document.getElementById('download-server').style.display = 'block'
}

async function createSessionsReport(){
    var response, data, download_link;
    response = await fetch('/api/v1/createSessionsReport');
    data = await response.json();
    console.log('File created: '+data.filename)
    document.getElementById('download-sessions').href = "/api/v1/downloadCsv?file="+data.filename 
    document.getElementById('download-sessions').innerHTML = "Download "+data.filename    
    document.getElementById('download-sessions').style.display = 'block'
}

function openPage(pageName,elmnt) {
    var i, tabcontent, tablinks;
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

assignOptions()
generateTableHead() 