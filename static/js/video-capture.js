var videoSaveIntervalList = [
  {
    key: 5000,
    value: '5 сек'
  },{
    key: 10000,
    value: '10 сек'
  },{
    key: 30000,
    value: '30 сек',
    selected: true
  },{
    key: 60000,
    value: '1 мин'
  },{
    key: 120000,
    value: '2 мин'
  },{
    key: 300000,
    value: '5 мин'
  }
];

var videoSizeList = [
  {
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
  }
];

var snapshotMakeMethodList = [{
  key: 'save-if-motion-detected',
  value: 'Сохранять снимки если есть движение'
},{
  key: 'save-if-light-detected',
  value: 'Сохранять снимки если включено освещение'
}]

var app = new Vue({
  el: '#main-panel',
  data: function() {
    return {
        snapshotMakeMethodList: snapshotMakeMethodList,
        snapshotMethod: 'save-if-motion-detected',
        snapshotIntervalList: videoSaveIntervalList,
        snapshotInterval: 30000,
        isCameraPlayNow: false,
        isVideoCaptureSaveComplete: false,
        isVideoCaptureListLoaded: false,
        isPictureCaptureListLoaded: false,
        isCaptureAutoRun: true,
        pictureCaptureDayList: [],
        videoCaptureDayList: [],
        videoCaptureRecordTblData: [],
        pictureCaptureRecordTblData: [],
        videoCaptureRecordTblCols: ['Время', 'Интервал', 'Файл'],
        pictureCaptureRecordTblCols: ['Время', 'Изображение'],
        videoCaptureBlockInfo: '',
        activeVideoCaptureDay: null,
        width: null,
        height: null,
        pictureElement: null,
        videoElement: null,
        videoStreamTrack: null,
        imageCaptureDeviceInterface: null,
        imageCaptureFn: null,
        imageCaptureInterval: 500,
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
        movement: false,
        lighting: '',
        threshold: {
            forCameraStart: 15,
            forCameraStop: 8,
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
      lighting: function(v) {
          var that = this;

          if (!this.isCaptureAutoRun) {
              return;
          }
          var btn = this.$refs['start-stop-rec-btn'];

          if (v >= this.threshold.forCameraStart) {
              if (!this.isCameraPlayNow) {
                  btn.click();
                  this.saveMeteringValue();
              }
              if (this.isLightOn) {
                this.imageCaptureFn = setInterval(function() {
                    that.imageCaptureDeviceInterface.takePhoto()
                      .then(blob => {
                          that.upload.call(that, blob);
                      })
                      .catch(error => {
                          console.error('takePhoto() error:', error)
                      });
                }, this.snapshotInterval);
              } else {
                clearInterval(this.imageCaptureFn);
              }
          } else if (v < this.threshold.forCameraStop) {
              if (this.isCameraPlayNow) {
                  btn.click();
                  this.saveMeteringValue();
              }
          }
      },
      movement: function(v) {
          var that = this;

          if (v && this.imageCaptureDeviceInterface && this.isCameraPlayNow) {
              this.imageCaptureFn = setInterval(function() {
                  that.imageCaptureDeviceInterface.takePhoto()
                    .then(blob => {
                        that.upload.call(that, blob);
                    })
                    .catch(error => {
                        console.error('takePhoto() error:', error)
                    });
              }, this.imageCaptureInterval);
          } else {
              clearInterval(this.imageCaptureFn);
          }
      }
  },
  computed: {
    isLightOn: function() {
        if (this.lighting >= this.threshold.forCameraStart) {
            return true;
        } else {
            return false;
        }
    },
    formHeight: function() {
        return this.height + 90;
    },
    formWidth: function() {
        return this.width + 100;
    },
    toggleBtnText: function() {
        if (this.isCameraPlayNow) {
            return 'Выключить';
        } else {
            return 'Включить';
        }
    }
  },
  mounted: function() {
    var that = this;

    this.socket = io();

    this.socket.on('lighting', function(v) {
        that.lighting = v;
    });
    this.socket.on('movement', function(v) {
        that.movement = v;
    });
    navigator.mediaDevices.enumerateDevices()
        .then(function(devices) {
            devices.forEach(function(device, index) {
                if (device.kind == 'videoinput') {
                    that.videoCameraList.push({
                        key: device.deviceId,
                        value: device.label || device.kind
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
    this.reloadPictureCaptureDayList();
  },
  methods: {
    onSelectSnapshotMethodMethod: function(v) {
      this.snapshotMethod = v;
    },
    onSelectSnapshotInterval: function(v) {
      this.snapshotInterval = v;
    },
    onChangeTab: function(tab, tabIndex) {
        if (tab.title == 'Видео') {
            this.reloadVideoCaptureDayList();
        } else if (tab.title == 'Фотографии') {
            this.reloadPictureCaptureDayList();
        }
    },
    onClickLoadPictureCaptureListBtn: function() {
        this.reloadPictureCaptureTable();
    },
    saveMeteringValue: function() {
        var that = this;

        $.ajax({
          url: this.mainDomain + '/metering/save',
          data: {lighting: this.lighting},
          type: 'post',
          success: function(r) {
              //
          }
        });
    },
    reloadPictureCaptureDayList: function() {
        var that = this;

        this.getPictureCaptureDayList(function(data) {
            if (!data.length) {
                return;
            }
            that.pictureCaptureDayList = data;
            that.activePictureCaptureDay = data[0].key;
        });
    },
    reloadPictureCaptureTable: function() {
        var that = this;

        this.getPictureCaptureRecordList(this.activePictureCaptureDay, function(data) {
            that.pictureCaptureRecordTblData = data.map(function(r) {
                return [r.datetime, '<a target="_blank" href="/picture/' + r.uploadDir + '/' + r.filename + '"><img width="150" src="/picture/' + r.uploadDir + '/' + r.filename + '"></a>'];
            });
            that.isPictureCaptureListLoaded = true;
        });
    },
    getVideoCaptureRecordList: function(day, callback) {
        var that = this,
            url = '/video/record/list',
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
    getPictureCaptureRecordList: function(day, callback) {
        var that = this,
            url = '/picture/record/list',
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
    getPictureCaptureDayList: function(callback) {
        var that = this,
            url = '/picture/day/list',
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
    onSelectPictureCaptureDay: function(v) {
        this.activePictureCaptureDay = v.key;
        this.isPictureCaptureListLoaded = false;
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
    onMediaSuccess: function(stream) {
      var that = this;

      this.videoElement.srcObject = stream;
      this.videoStreamTrack = stream.getVideoTracks()[0];
      this.imageCaptureDeviceInterface = new ImageCapture(this.videoStreamTrack);

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
        if (this.isCameraPlayNow) {
            if (this.mediaRecorder) {
                this.mediaRecorder.stop();
            }
            this.videoElement.pause();
            document.getElementById('container').innerHTML = '';
            this.isCameraPlayNow = false;
        } else {
            this.captureUserMedia(this.onMediaSuccess, this.onMediaError);
            this.isCameraPlayNow = true;
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
        var url = '/picture/upload';

        var that = this,
            displayTime = 10000,
            d = new Date(),
            blockName = Math.round(d.getTime() / 1000).toString();

        this.blobToBase64(blob, function(base64){
            var update = {
                saveInterval: that.saveInterval,
                blob: base64
            };
            that.$http.post(url, update).then(resp => {
                that.isVideoCaptureSaveComplete = true;
                that.videoCaptureBlockInfo = `Блок ${blockName} успешно сохранен`;

                setInterval(function() {
                    that.isVideoCaptureSaveComplete = false;
                }, displayTime);
            });
            var data = new FormData(),
                externalUrl = 'http://karatespb.ru/picture/capture/upload';

            data.append('file', blob);

            $.ajax({
                url: externalUrl,
                data: data,
                type: 'post',
                contentType: false,
                processData: false,
                success: function(resp) {
                    var r = JSON.parse(resp);
                },
                error: function() {
                    console.log(err);
                }
            });
        });
    }
  }
});
