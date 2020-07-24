var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var bodyParser = require('body-parser');
var fs = require("fs");
var request = require('request');
var serverPort = 9000;
var dayDeep = 7;
var staticDir = '/static';
var videoDir = '/video';
var pictureDir = '/picture';
var pictureExt = '.jpg';
var videExt = '.webm';
var mysql = require('mysql');
var SerialPort = require('serialport');
var sensorPort;


var escapeJSON = function(json) {
  var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
  var meta = {    // table of character substitutions
              '\b': '\\b',
              '\t': '\\t',
              '\n': '\\n',
              '\f': '\\f',
              '\r': '\\r',
              '"' : '\\"',
              '\\': '\\\\'
            };

  escapable.lastIndex = 0;
  return escapable.test(json) ? '"' + json.replace(escapable, function (a) {
      var c = meta[a];
      return (typeof c === 'string') ? c
        : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
  }) + '"' : '"' + json + '"';
};

var sensorComPort = 'COM3';

SerialPort.list().then(function(list) {
    console.log('The following ports were found:');
    console.log(list);

    list.forEach(function(port) {
        if (port.manufacturer == 'STMicroelectronics.' || port.path == sensorComPort) {
            sensorPort = new SerialPort(port.path, {
                baudRate: 115200
            });
            sensorPort.on('error', function(err) {
                console.log(err);
            });
            sensorPort.on('data', function(buffer) {
                var str = buffer.slice(4).toString(),
                    jsonStr = str
                            .replace('\b', '')
                            .replace('\r', '')
                            .replace('\n', '')
                            .replace('>', '')

                try {
                    var data = JSON.parse(jsonStr);
                    console.log(data);

                    if (typeof data.movement != 'undefined') {
                        io.emit('movement', data.movement);
                    } else {
                        io.emit('lighting', data.lighting);
                    }
                } catch(e) {

                }
            });
        }
    })
});

app.use(express.static('static'));
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));

var databaseConfig = {
    host: 'localhost',
    user: 'root',
    password : 'root',
    database : 'videocapture',
    port: 3306,
    //socketPath: 'c:/Program Files/var/run/mysqld/mysqld.sock'
};
var handleDisconnect = function() {
  connection = mysql.createConnection(databaseConfig);

  connection.connect(function(err) {
    if (err) {
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000);
    }
  });

  connection.on('error', function(err) {
    console.log('db error', err);

    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

var eraseGarbage = function() {
    var validDateArr = [],
        d;

    var getValidMonth = function() {
        var v = (d.getMonth()) + 1;

        if (v<10) {
            return '0' + v;
        } else {
            return v;
        }
    };
    var getValidDay = function() {
        var v = d.getDate();

        if (v<10) {
            return '0' + v;
        } else {
            return v;
        }
    };
    var getValidYear = function() {
        return d.getFullYear();
    };
    for (var i=dayDeep; i--; i==0) {
        d = new Date();
        d.setDate(d.getDate()-i);
        validDateArr.push([getValidYear(), getValidMonth(), getValidDay()].join('-'));
    }
    var getDirectories = function(path) {
        return fs.readdirSync(path).filter(function (file) {
          return fs.statSync(path+'/'+file).isDirectory();
        });
    };
    var deleteFolderRecursive = function(path) {
        if (fs.existsSync(path)) {
          fs.readdirSync(path).forEach(function(file, index){
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
              deleteFolderRecursive(curPath);
            } else { // delete file
              fs.unlinkSync(curPath);
            }
          });
          fs.rmdirSync(path);
        }
    };
    var pathOffset = '.' + staticDir + videoDir + '/';

    getDirectories(pathOffset).forEach(function(d) {
        if (validDateArr.indexOf(d) == -1) {
            console.log('Found old video files ' + pathOffset + d);
            deleteFolderRecursive(pathOffset + d);
        }
    });
};
var getVideoCaptureRecordList = function(day, callback) {
    query = "\n SELECT * FROM `videocapture`"
           +"\n WHERE DATE_FORMAT(`datetime`, '%Y-%m-%e') = '" + day + "'"
           +"\n ORDER BY `datetime` DESC";

    connection.query(query, function(err, results) {
        callback && callback(err, results);
    });
};
var getPictureCaptureRecordList = function(day, callback) {
    query = "\n SELECT * FROM `picturecapture`"
           +"\n WHERE DATE_FORMAT(`datetime`, '%Y-%m-%e') = '" + day + "'"
           +"\n ORDER BY `datetime` DESC";

    connection.query(query, function(err, results) {
        callback && callback(err, results);
    });
};
var getVideoCaptureDayList = function(dayDeep, callback) {
    query = "\n SELECT DISTINCT `s`.`value`, `s`.`key` FROM ("
            +"\n SELECT DATE_FORMAT(`datetime`, '%D %M') AS `value`, DATE_FORMAT(`datetime`, '%Y-%m-%e') AS `key` FROM `videocapture`"
            +"\n WHERE `datetime` > NOW() - INTERVAL " + dayDeep + " DAY ORDER BY `datetime` ASC) AS `s` ORDER BY `s`.`key` DESC ";

    connection.query(query, function(err, results) {
        callback && callback(err, results);
    });
};
var getPictureCaptureDayList = function(dayDeep, callback) {
    query = "\n SELECT DISTINCT `s`.`value`, `s`.`key` FROM ("
            +"\n SELECT DATE_FORMAT(`datetime`, '%D %M') AS `value`, DATE_FORMAT(`datetime`, '%Y-%m-%e') AS `key` FROM `picturecapture`"
            +"\n WHERE `datetime` > NOW() - INTERVAL " + dayDeep + " DAY ORDER BY `datetime` ASC) AS `s` ORDER BY `s`.`key` DESC ";

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
var savePictureCaptureRec = function(data, callback) {
    query = "\n INSERT INTO `picturecapture` (`id`,`filename`, `datetime`, `uploadDir`)"
            +"\n VALUES(null, '" + data.fileName + "', FROM_UNIXTIME('" + data.dateTime + "'), '" + data.uploadDir + "')";

    connection.query(query, function(err, results) {
        callback && callback(results);
    });
};

app.all('*', function(req, res, next) {
   console.log('Run erase garbage procedure');
   setTimeout(eraseGarbage, 0);
   next();
});
app.get('/video/record/get', function(req, res) {

});
app.post('/video/record/list', function(req, res) {
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
app.post('/picture/record/list', function(req, res) {
    var day = req.body.day;

    getPictureCaptureRecordList(day, function(err, data) {
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
app.post('/video/day/list', function(req, res) {
    var dd = req.body.dayDeep;

    if (typeof dd == 'undefined') {
        dd = dayDeep;
    }
    getVideoCaptureDayList(dd, function(err, data) {
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
app.post('/picture/day/list', function(req, res) {
    var dd = req.body.dayDeep;

    if (typeof dd == 'undefined') {
        dd = dayDeep;
    }
    getPictureCaptureDayList(dd, function(err, data) {
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
app.post('/video/upload', function(req, res) {
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
app.post('/picture/upload', function(req, res) {
    var buf = new Buffer(req.body.blob, 'base64'),
        d = new Date(),
        currentDate = (d.toISOString().split('T')[0]),
        currentUnixTime = Math.round(d.getTime() / 1000).toString(),
        uploadDir = '.' + staticDir + pictureDir + '/' + currentDate,
        fileName = currentUnixTime + pictureExt;

    fs.mkdir(uploadDir, function(e) {
        fs.writeFile(uploadDir + '/' + fileName, buf, function(err) {
            if (!err) {
                var data = {
                    uploadDir: currentDate,
                    dateTime: currentUnixTime,
                    fileName: fileName
                };
                savePictureCaptureRec(data);

                return res.json({
                    success: true
                });
            }
        });
    });
});

http.listen(serverPort, function() {
    console.log(`Server is started at port ${serverPort}\nTo close use Ctrl+C`);
});
