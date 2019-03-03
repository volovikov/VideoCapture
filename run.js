var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var bodyParser = require('body-parser');
var fs = require("fs");
var request = require('request');
var port = 9000;
var staticDir = '/static';
var videoDir = '/video';
var videExt = '.webm';
var mysql = require('mysql');

app.use(express.static('static'));
app.use(bodyParser.json({limit: '10mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password : '',
    database : 'videocapture'
});
connection.connect();

var getVideoCaptureRecordList = function(day, callback) {
    query = "\n SELECT * FROM `videocapture`"
           +"\n WHERE DATE_FORMAT(`datetime`, '%Y-%m-%e') = '" + day + "'";

    connection.query(query, function(err, results) {
        callback && callback(err, results);
    });
};
var getVideoCaptureDayList = function(dayDeep, callback) {        
    query = "\n SELECT DISTINCT `s`.`value`, `s`.`key` FROM ("
            +"\n SELECT DATE_FORMAT(`datetime`, '%D %M') AS `value`, DATE_FORMAT(`datetime`, '%Y-%m-%e') AS `key` FROM `videocapture`"
            +"\n WHERE `datetime` > NOW() - INTERVAL " + dayDeep + " DAY) AS `s` ";

    connection.query(query, function(err, results) {
        callback && callback(err, results);
    });
};
var saveVideoCaptureRec = function(data, callback) {
    query = "\n INSERT INTO `videocapture` (`id`,`filename`, `datetime`, `saveInterval`, `uploadDir`)"
            +"\n VALUES(null, '" + data.fileName + "', FROM_UNIXTIME('" + data.dateTime + "'), '" + data.saveInterval + "', '" + data.uploadDir + "')";

    connection.query(query, function(err, results) {
        callback && callback(results);
    });
};

app.get('/video-capture/record/get', function(req, res) {
    
});
app.post('/video-capture/record/list', function(req, res) {
    var day = req.body.day;
    
    getVideoCaptureRecordList(day, function(err, data) {
        if (!err) {
            res.json({
                success: true,
                data: data
            });
        } else {
            res.json({
                success: false
            })
        }
        
    });   
});
app.post('/video-capture/day/list', function(req, res) {
    var dayDeep = req.body.dayDeep;
  
    if (typeof dayDeep == 'undefined') {
        dayDeep = 5;
    }
    getVideoCaptureDayList(dayDeep, function(err, data) {
        if (!err) {
            res.json({
                success: true,
                data: data
            });
        } else {
            res.json({
                success: false
            });
        }        
    });
});
app.post('/upload', function(req, res) {
    var buf = new Buffer(req.body.blob, 'base64'),
        saveInterval = req.body.saveInterval,
        d = new Date(),
        currentDate = (d.toISOString().split('T')[0]),
        currentUnixTime = Math.round(d.getTime() / 1000).toString(),
        uploadDir = '.' + staticDir + videoDir + '/' + currentDate,
        fileName = currentUnixTime + videExt;
    
    fs.mkdir(uploadDir, function(e) {
        fs.writeFile(uploadDir + '/' + fileName, buf, function(err) {
            if (!err) {                
                var data = {
                    uploadDir: currentDate,
                    dateTime: currentUnixTime,
                    fileName: fileName,
                    saveInterval: saveInterval
                };
                saveVideoCaptureRec(data);
                
                return res.json({
                    success: true
                });
            }
        }); 
    });
});
http.listen(port, function(){
  console.log(`Server is started at port ${port}\nTo close use Ctrl+C`);
});
