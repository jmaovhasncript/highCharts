
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
    //console.log(cluster_location);
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
    //console.log(cluster_disk_util);

});

var location_precpctive ={

}

app.get('/totalUsage', function(req, res){
    debugger;

    for(var key in cluster_location){
        cluster_location[key].diskUsage = parseInt(cluster_disk_util[key].data["disk_usage(MB)"]);
        cluster_location[key].timeStamp = cluster_disk_util[key].data["timestamp"];
    }

    //console.log(cluster_location);

    for(key in cluster_location){
        console.log(cluster_location[key]);

        if(!location_precpctive[cluster_location[key].data.country_code]){
            location_precpctive[cluster_location[key].data.country_code] = {
                country_code : cluster_location[key].data.country_code ,
                cluster_id :[cluster_location[key].data.cluster_id],
                disk_usage:[cluster_location[key].diskUsage],
                timeStamp :[cluster_location[key].timeStamp]
            }
        }else{
            location_precpctive[cluster_location[key].data.country_code].cluster_id.push(cluster_location[key].data.cluster_id);
            location_precpctive[cluster_location[key].data.country_code].disk_usage.push(cluster_location[key].diskUsage);
            location_precpctive[cluster_location[key].data.country_code].timeStamp.push(cluster_location[key].timeStamp);

        }
    }

    console.log(location_precpctive);



    res.status(200).send({totalUsage : totalDiskUtils,diskUtils :location_precpctive});
    res.end();
});




app.listen('8010');