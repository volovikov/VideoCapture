var videoSaveIntervalList = [{
    key: 5000,
    value: '5 сек'
  },{
    key: 10000,
    value: '10 сек'
  },{
    key: 30000,
    value: '30 сек',
  },{
    key: 60000,
    value: '1 мин',
    selected: true
  },{
    key: 120000,
    value: '2 мин'
  },{
    key: 300000,
    value: '5 мин'              
  }];
  
var videoSizeList = [{
    key: '320x240',
    value: '320x240',
    width: 320,
    height: 240
  },{
    key: '640x480',
    value: '640x480',            
    width: 640,
    height: 480,               
    selected: true
  },{
    key: '800x600',
    value: '800x600',
    width: 800,
    height: 600        
  },{
    key: '1024x768',
    value: '1024x768',
    width: 1024,
    height: 768,            
  }];

new Vue({
  el: '#main-panel',
  data: function() {
    return {
        isVideoSaveNow: false,
        isVideoCaptureSaveComplete: false,
        isVideoCaptureListLoaded: false,
        isCaptureSave: true,
        isCaptureAutoRun: true,
        videoCaptureDayList: [],
        videoCaptureRecordTblData: [],
        videoCaptureRecordTblCols: ['Время', 'Интервал', 'Файл'],
        videoCaptureBlockInfo: '',
        activeVideoCaptureDay: null,
        width: null,
        height: null,
        videoElement: null,        
        mediaRecorder: null,
        videoCameraList: [],
        videoSaveIntervalList: videoSaveIntervalList,
        videoSizeList: videoSizeList,
        videoRecordDeviceId: null,
        audioRecordDeviceId: null,          
        saveMediaSettings: {
          audio: true,
          video: {               
              deviceId: {exact: null},
              width: {exact: null},
              height: {exact: null}
          }
        },
        saveInterval: 5000,
        metering: {
            lighting: '',
            temp: '',
            humidity: '',
        },
        threshold: {
            forCameraStart: 25,
            forCameraStop: 10
        },
        mainDomain: 'http://karatespb.ru'
    };
  },
  watch: {
      width: function(v) {
          this.saveMediaSettings.video.width.exact = v;
      },
      height: function(v) {
          this.saveMediaSettings.video.height.exact = v;
      },
      videoRecordDeviceId: function(v) {
          this.saveMediaSettings.video.deviceId.exact = v;
      },
      'metering.lighting': function(v) {
          if (!this.isCaptureAutoRun) {
              return;
          }
          var btn = this.$refs['start-stop-rec-btn'];                  

          if (v >= this.threshold.forCameraStart) {
              if (!this.isVideoSaveNow) {
                  btn.click();
                  this.saveMeteringValue();
              }
          } else if (v < this.threshold.forCameraStop) {
              if (this.isVideoSaveNow) {
                  btn.click();
                  this.saveMeteringValue();
              }
          }              
      },
      'metering.temp': function(v) {
          this.saveMeteringValue()
      },
      'metering.humidity': function(v) {
          this.saveMeteringValue();              
      }
  },
  computed: {
    formHeight: function() {
        return this.height + 90;
    },
    formWidth: function() {
        return this.width + 100;
    },
    toggleBtnText: function() {
        if (this.isVideoSaveNow) {
            return 'Остановить';
        } else {
            return 'Записывать';
        }
    }
  },
  mounted: function() {
    var that = this;

    this.socket = io();
    this.socket.on('metering', function(v) {
        that.metering = v;
    });
    navigator.mediaDevices.enumerateDevices()
        .then(function(devices) {
            devices.forEach(function(device, index) {
                if (device.kind == 'videoinput') {
                    that.videoCameraList.push({
                        key: device.deviceId,
                        value: device.label
                    });
                }
            });
            that.videoCameraList.forEach(function(r, i) {
                if (i == 0) {
                    that.videoRecordDeviceId = r.key;
                }
            });
        });

    this.videoSizeList.forEach(function(r) {
        if (r.selected) {
            that.width = r.width;
            that.height = r.height;
        }
    });
    this.videoSaveIntervalList.forEach(function(r) {
        if (r.selected) {
            that.saveInterval = r.key;
        }
    });
    this.videoElement = document.createElement('video');     
    this.videoElement = mergeProps(this.videoElement, {
        width: this.width,
        height: this.height
    });
    this.reloadVideoCaptureDayList();
  },
  methods: {
    onClickLoadCaptureListBtn: function() {
        this.reloadVideoCaptureTable();
    },
    saveMeteringValue: function() {
        var that = this;

        $.ajax({
          url: this.mainDomain + '/metering/save',
          data: this.metering,
          type: 'post',
          success: function(r) {
              //
          }
        });            
    },
    reloadVideoCaptureDayList: function() {
        var that = this;

        this.getVideoCaptureDayList(function(data) {
            if (!data.length) {
                return;
            }
            that.videoCaptureDayList = data;
            that.activeVideoCaptureDay = data[0].key;            
        });            
    },
    reloadVideoCaptureTable: function() {
        var that = this;

        this.getVideoCaptureRecordList(this.activeVideoCaptureDay, function(data) {
            that.videoCaptureRecordTblData = data.map(function(r) {
                return [r.datetime, r.saveInterval, '<a target="_blank" href="/video/' + r.uploadDir + '/' + r.filename + '">' + r.filename + '</a>'];
            });
            that.isVideoCaptureListLoaded = true;
        });
    },
    getVideoCaptureRecordList: function(day, callback) {
        var that = this,
            url = '/video-capture/record/list',
            data = {
                day: day
            };

        $.ajax({
                url: url,
                data: data,
                type: 'post',
                success: function(r) {
                    if (!r.success) {
                        that.errorMessage = r.error;                                            
                    } else {
                        callback && callback(r.data);               
                    }                                                                    
                }
            });
    },
    getVideoCaptureDayList: function(callback) {
        var that = this,
            url = '/video-capture/day/list',
            data = {
            };

        $.ajax({
                url: url,
                data: data,
                type: 'post',
                success: function(r) {
                    if (!r.success) {
                        that.errorMessage = r.error;                                            
                    } else {
                        callback && callback(r.data);               
                    }                                                                    
                }
            });
    },
    onSelectVideoCaptureDay: function(v) {
        this.activeVideoCaptureDay = v.key;
        this.isVideoCaptureListLoaded = false;
    },
    onSelectVideoSize: function(v) {
        var that = this; 

        this.videoSizeList.forEach(function(r) {
            if (r.key == v.key) {
                that.width = r.width;
                that.height = r.height;

                that.videoElement = mergeProps(that.videoElement, {
                    controls: true,
                    muted: true,
                    width: r.width,
                    height: r.height
                });            
            }
        });            
    },
    onSelectVideoInterval: function(v) {
        this.saveInterval = v.key;
    },
    onMediaSuccess: function(stream) {
      var that = this;

      this.videoElement.srcObject = stream;

      this.videoElement.addEventListener('loadedmetadata', function() {
        if (!that.mediaRecorder) {
          that.mediaRecorder = new MediaStreamRecorder(stream);
        }            
        that.mediaRecorder.ondataavailable = function(blob) {
            that.upload(blob);
        };       
        that.mediaRecorder.start(that.saveInterval);
      });

      this.videoElement.play();
      document.getElementById('container').appendChild(this.videoElement);
    },
    onMediaError: function(e) {
      console.error('media error', e);
    },
    captureUserMedia: function(successCallback, errorCallback) {
      navigator.mediaDevices.getUserMedia(this.saveMediaSettings)
        .then(successCallback)
        .catch(errorCallback);
    },
    onSelectVideoCamera: function(v) {
        this.videoRecordDeviceId = v.key;
    },
    onClickStartStopBtn: function() {
        if (this.isVideoSaveNow) {
            if (this.mediaRecorder) {
                this.mediaRecorder.stop();
            }
            this.videoElement.pause();
            document.getElementById('container').innerHTML = '';
            this.isVideoSaveNow = false;
        } else {
            this.captureUserMedia(this.onMediaSuccess, this.onMediaError);
            this.isVideoSaveNow = true;
        }
    },
    blobToBase64: function(blob, callback) {
        var reader = new FileReader();
        reader.onload = function() {
          var dataUrl = reader.result;
          var base64 = dataUrl.split(',')[1];
          callback(base64);
        };
        reader.readAsDataURL(blob);
    },
    upload: function(blob) {
        if (!this.isCaptureSave) {
            return;
        }
        var that = this,
            displayTime = 1500,
            d = new Date(),
            blockName = Math.round(d.getTime() / 1000).toString();

        this.blobToBase64(blob, function(base64){
            var update = {
                saveInterval: that.saveInterval,
                'blob': base64
            };         
            that.$http.post('/upload', update).then(resp => {
                that.isVideoCaptureSaveComplete = true;
                that.videoCaptureBlockInfo = `Блок ${blockName} успешно сохранен`;
                
                setInterval(function() {
                    that.isVideoCaptureSaveComplete = false;
                }, displayTime);
            }); 
        });            
    }
  }
});