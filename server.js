
var express = require('express'),
    fs = require('fs'),
    app = express(),
    csv = require('fast-csv');

app.use(express.static('publi'));

var totalDiskUtils =0 ;
var cluster_location = {

}
var cluster_stream = fs.createReadStream("cluster-locations.csv");
csv.fromStream(cluster_stream, {headers : true,ignoreEmpty: true}).on("data", function(data){
    cluster_location[data.cluster_id] ={
        data : data
    }
    //console.log(data);
}).on("end", function(){
    console.log("done");
    console.log(cluster_location);
});


var  cluster_disk = fs.createReadStream('cluster-disk-util.csv');

var cluster_disk_util = {

}

csv.fromStream(cluster_disk, {headers : true,ignoreEmpty: true}).on("data", function(data){
    cluster_disk_util[data.cluster_id] ={
        data : data
    }
    totalDiskUtils += parseInt(data["disk_usage(MB)"]);

    //console.log(data);
}).on("end", function(){
    console.log("done");
    console.log(cluster_disk_util);

});

app.get('/totalUsage', function(req, res){
    debugger;

    for(var key in cluster_location){
        cluster_location[key].diskUsage = parseInt(cluster_disk_util[key].data["disk_usage(MB)"]);
        cluster_location[key].timeStanp = cluster_disk_util[key].data["timestamp"];
    }
    res.status(200).send({totalUsage : totalDiskUtils,diskUtils :cluster_location});
    res.end();
});




app.listen('8010');