const EventEmitter = require('events')
const util = require('util')
const winMediaCapture = require('@nodert-win10/windows.media.capture')
const winMediaDevices = require('@nodert-win10/windows.media.devices')
const winMediaProperties = require('@nodert-win10/windows.media.mediaproperties')
const Capture = require('@nodert-win10/windows.media.devices')
const {DeviceClass, DeviceEnumeration, DeviceInformation, DeviceInformationCollection} = require('@nodert-win10/windows.devices.enumeration')
const Imaging = require('@nodert-win10/windows.graphics.imaging')
const MediaCore = require('@nodert-win10/windows.media.core')
const FaceDetectionEffect = MediaCore.FaceDetectionEffect
const Storage = require('@nodert-win10/windows.storage')
const Streams = require('@nodert-win10/windows.storage.streams')

const { getAppId, log, getIsCentennial } = require('./utils')

/**
 * Media similar to the native Windows Media.
 *
 * @class Media
 * @extends {EventEmitter}
 */
class Media extends EventEmitter {
  /**
   * Creates an instance of Media.
   *
   * @param {object} options
   * @param {string} [options.appId]
   */
  constructor (options = {}) {
    super(...arguments)

    options.strings = options.strings || []
    options.appId = options.appId || getAppId()

    log(`Creating media capture`)
    DeviceInformation.findAllAsync(DeviceClass.videoCapture, (err, devices) => {
      if(err) {
        log('failed')
      } 
      else {
        var cameraId = devices.getAt(0).id
        log(cameraId)
        
        var oMediaCapture = new winMediaCapture.MediaCapture()
        oMediaCapture.addListener("recordlimitationexceeded", this.mediaCapture_recordLimitationExceeded);
        oMediaCapture.addListener("failed", this.mediaCapture_failed);

        var settings = new winMediaCapture.MediaCaptureInitializationSettings()
        settings.videoDeviceId = cameraId
        settings.streamingCaptureMode = winMediaCapture.StreamingCaptureMode.audioAndVideo;

        oMediaCapture.initializeAsync(settings, (err, res) => {
          log(`initializeAsync callback`)
          this.isInitialized = true
          
          var videostream = new Streams.InMemoryRandomAccessStream()
          oMediaCapture.startRecordToStreamAsync(winMediaProperties.MediaEncodingProfile.createMp4(winMediaProperties.VideoEncodingQuality.vga), videostream, (err, res) => {
            log(`startRecordToStreamAsync callback`)
            if(err) log(err)
            log(videostream)

            var definition = new MediaCore.FaceDetectionEffectDefinition()
            definition.synchronousDetectionEnabled = false
            definition.detectionMode = MediaCore.FaceDetectionMode.highPerformance
            var oFaceDetectionEffect = null
            oMediaCapture.addVideoEffectAsync(definition, winMediaCapture.MediaStreamType.videoRecord, (err, res) => {
              log(`addVideoEffectAsync callback`)
              if(err) log('failed')
              log(res)
              oFaceDetectionEffect = res
              oFaceDetectionEffect = FaceDetectionEffect.castFrom(oFaceDetectionEffect)

              oFaceDetectionEffect.addListener("facedetected", this.faceDetectionEffect_FaceDetected)
              oFaceDetectionEffect.desiredDetectionInterval = 1000; // milliseconds
            // Start detecting faces
              oFaceDetectionEffect.enabled = true;
            })
          })
        })
      }
    })
  }

  faceDetectionEffect_FaceDetected (args, res) {
    log(`faceDetectionEffect_FaceDetected`)
    var faces = res.resultFrame.detectedFaces
    log('faces detected: ')
    log(faces.length)
    
  }
  mediaCapture_recordLimitationExceeded () {
    log(`mediaCapture_recordLimitationExceeded`)
    stopRecordingAsync()
  }

  mediaCapture_failed (errorEventArgs) {
    log(`MediaCapture_Failed: 0x` + errorEventArgs.code + `: ` + errorEventArgs.message)
  }
}

module.exports = Media
