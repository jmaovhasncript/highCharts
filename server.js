/***
 *
 * @type {*|exports|module.exports}
 * This modele reads data from the file and merge data
 * initiated the socket connection and trigger event on file change
 */
var express = require('express'),
    app = express(),
    fs = require('fs'),
    http = require('http').Server(app),
    Promise = require('bluebird'),
    io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', function (socket) {
    socket.emit('connection');
    socket.on('diskUsage', function () {
        socket.emit("diskUsage", {totalUsage: totalDiskUtils, diskUtils: location_precpctive});

    });

});

var fileReadModule = require('./fileReadModule'), cluster_location, cluster_stream, location_precpctive = {}, totalDiskUtils = 0;
fileRun();
watchFile('cluster-locations.csv');
watchFile('cluster-disk-util.csv');


function fileRun() {
    var promise_cluster = fileReadModule('cluster-locations.csv');

    promise_cluster.then(function (data) {
        cluster_location = data.dataStream;
    });

    var promise_disk_usage = fileReadModule('cluster-disk-util.csv', true);

    promise_disk_usage.then(function (data) {
        cluster_stream = data.dataStream;
        totalDiskUtils = data.totalDiskUtils
    });
    Promise.settle([promise_cluster, promise_disk_usage]).then(function () {
        for (var key in cluster_location) {
            cluster_location[key].diskUsage = parseInt(cluster_stream[key].data["disk_usage(MB)"]);
            cluster_location[key].timeStamp = cluster_stream[key].data["timestamp"];
        }

        for (key in cluster_location) {

            if (!location_precpctive[cluster_location[key].data.country_code]) {
                location_precpctive[cluster_location[key].data.country_code] = {
                    country_code: cluster_location[key].data.country_code,
                    cluster_id: [cluster_location[key].data.cluster_id],
                    disk_usage: [cluster_location[key].diskUsage],
                    timeStamp: [cluster_location[key].timeStamp]
                }
            } else {
                location_precpctive[cluster_location[key].data.country_code].cluster_id.push(cluster_location[key].data.cluster_id);
                location_precpctive[cluster_location[key].data.country_code].disk_usage.push(cluster_location[key].diskUsage);
                location_precpctive[cluster_location[key].data.country_code].timeStamp.push(cluster_location[key].timeStamp);

            }
        }
    });
}

function watchFile(fileName) {
    fs.watchFile(fileName, function (curr, prev) {
        fileRun();
        io.emit("diskUsage", {totalUsage: totalDiskUtils, diskUtils: location_precpctive});
    });
};

app.get('/totalUsage', function (req, res) {
    res.status(200).send({totalUsage: totalDiskUtils, diskUtils: location_precpctive});
    res.end();
});


http.listen(3000, function () {
    console.log('listening on *:3000');
});