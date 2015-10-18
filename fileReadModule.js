/***
 *
 * @type {bluebird|exports|module.exports}
 * This module reads file and sends the response
 */
var Promise = require('bluebird'), fs = Promise.promisifyAll(require('fs')), csv = require('fast-csv');

module.exports = function (filePath, totalCluster) {
    debugger;
    return new Promise(function (resolve, reject) {
        var dataStream = {}, totalDiskUtils = 0;
        var stream = fs.createReadStream(filePath);
        csv.fromStream(stream, {headers: true, ignoreEmpty: true}).on("data", function (data) {
            dataStream[data.cluster_id] = {
                data: data
            };
            if (totalCluster) {
                totalDiskUtils += parseInt(data["disk_usage(MB)"]);
            }

        }).on("end", function () {
            resolve({
                dataStream: dataStream,
                totalDiskUtils: totalDiskUtils
            })
        });
    });
}