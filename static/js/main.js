const IPADDR = '127.0.0.1'
const API = 'http://'+IPADDR+':8083/api/v1/'

async function getInstances(){
    var netreq, netres;
    netreq = await fetch(API+'sys');
    netres = await netreq.json();        
    if (netres){        
        instancesArray = netres.instancesArray        
        for (const ip in instancesArray) {
            const element = instancesArray[ip];
            if (element == '127.0.0.1'){
                console.log('ThisNode:'+element)
            }else{
                console.log('RemoteHost:'+element)
            }                
            let hostSelector = document.getElementById("hostSelector")                
            let opt = document.createElement("option");
            opt.setAttribute("value", element);
            let text = document.createTextNode(element);
            opt.appendChild(text);
            hostSelector.appendChild(opt);            
        }
        }        
}

function _setVal(tagName, value){
    if(tagName && value){        
        document.getElementById(tagName).innerHTML = value        
    } else {        
        return false
}}
     


async function headerInfo(){
    // get data from back-end            
    try {        
        getInstances()        
        response = await fetch(API+'sys'); 
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
            iscluster = data.isCluster          
            _setVal("os",os)
            _setVal("nodename",nodename)
            _setVal("app-name", app_name+' server v.'+version)
            _setVal("app-title", app_name)           
            _setVal("cpuarch",cpuarch)
            _setVal("cores",cores)
            _setVal("ram",ram)
            _setVal("d_total",d_total)           
            _setVal("isCluster",isCluster)
            // log for debug
            console.log('Page header created')
        }
    } catch (error) {
        console.log('Error fetching data from back-end: '+error)
    }    
}

async function generateTableHead() {        
    var columnsRes = await fetch(API+'sessionsMeta'); 
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
    var columnsRes = await fetch(API+'sessionsMeta'); 
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
    var url = API+'tableView?kpi=sessions'
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

function createTable(table_id, kpi_id, arg=NaN){    
    var url, indexLastColumn, table;
    indexLastColumn = $("#"+table_id).find('tr')[0].cells.length-1;
    url = API+"tableView?kpi="+kpi_id
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

async function graphView(){    
    var kpi, response, data, node, value, text;    
    kpi_id = document.getElementById("kpi").value
    node = document.getElementById("kpi");
    value = node.options[node.selectedIndex].value;
    text = node.options[node.selectedIndex].text;            
    response = await fetch(API+'graphData?kpi='+kpi_id);
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


async function switchHost(){
    let ipaddr = document.getElementById("hostSelector").value;
    location.href = "http://"+ipaddr+":8083/stats";

}

async function createServerReport(){
    var response, data, download_link;
    response = await fetch(API+'createServerReport');
    data = await response.json();
    console.log('File created: '+data.filename)
    document.getElementById('download-server').href = API+"downloadCsv?file="+data.filename 
    document.getElementById('download-server').innerHTML = "Download "+data.filename    
    document.getElementById('download-server').style.display = 'block'
}

async function createSessionsReport(){
    var response, data, download_link;
    response = await fetch(API+'createSessionsReport');
    data = await response.json();
    console.log('File created: '+data.filename)
    document.getElementById('download-sessions').href = API+"downloadCsv?file="+data.filename 
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