const IPADDR = '127.0.0.1'
const API = 'http://'+IPADDR+':8083/api/v1/'

async function getInstances(){
    let netreq, netres;
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
        let response = await fetch(API+'sys'); 
        let data = await response.json();
        if (data){                        
            // unpack values
            let os = data.os
            let nodename = data.nodename
            let cpuarch = data.cpuarch    
            let cores = data.cores
            let ram = data.ram
            let d_total = data.d_total
            let app_name = data.app_name
            let version = data.version
            let iscluster = data.isCluster          
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
        }
    } catch (error) {
        console.log('Error fetching data from back-end: '+error)
    }    
}

async function generateTableHead() {        
    let columnsRes = await fetch(API+'sessionsMeta'); 
    let data = await columnsRes.json();    
    let dataObj = Object.values(data)
    let tr = document.getElementById('concurent-thead')
    for (let key of dataObj) {
      let th = document.createElement("th");
      th.setAttribute("id", key);
      let text = document.createTextNode(key);
      th.appendChild(text);
      tr.appendChild(th);
    } 
  }

async function assignOptions() {    
    let columnsRes = await fetch(API+'sessionsMeta'); 
    let data = await columnsRes.json();    
    let dataObj = Object.values(data)
    let selector = document.getElementById('kpi')
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
    let indexLastColumn = $("#concurent-table-view-tbl").find('tr')[0].cells.length-1;
    let url = API+'tableView?kpi=sessions'
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
    indexLastColumn = $("#"+table_id).find('tr')[0].cells.length-1;
    url = API+"tableView?kpi="+kpi_id    
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
    let kpi_id = document.getElementById("kpi").value
    let node = document.getElementById("kpi");
    let value = node.options[node.selectedIndex].value;
    let text = node.options[node.selectedIndex].text;            
    let response = await fetch(API+'graphData?kpi='+kpi_id);
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
}


function switchHost(){
    let ipaddr = document.getElementById("hostSelector").value;    
    location.href = "http://"+ipaddr+":8083/stats";
    console.log("Redirecting to: "+ipaddr);

}

async function createServerReport(){
    let response, data, download_link;
    response = await fetch(API+'createServerReport');
    data = await response.json();
    console.log('File created: '+data.filename);
    document.getElementById('download-server').href = API+"downloadCsv?file="+data.filename 
    document.getElementById('download-server').innerHTML = "Download "+data.filename    
    document.getElementById('download-server').style.display = 'block'
}

async function createSessionsReport(){
    let response, data, download_link;
    response = await fetch(API+'createSessionsReport');
    data = await response.json();
    console.log('File created: '+data.filename)
    document.getElementById('download-sessions').href = API+"downloadCsv?file="+data.filename 
    document.getElementById('download-sessions').innerHTML = "Download "+data.filename    
    document.getElementById('download-sessions').style.display = 'block'
}

function openPage(pageName,elmnt) {
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

assignOptions()
generateTableHead()