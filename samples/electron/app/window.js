const path = require('path')
const {remote} = require('electron')
const ElectronWindowsMedia = require('electron-windows-media');

const {Media} = ElectronWindowsMedia
const appId = 'electron-windows-media-sample'
const textNode = $("#text")

function startCamera(evt) {
  // create the media object
  let media = new Media({
		appId: process.windowsStore ? undefined : appId,
  })
}

ElectronWindowsMedia.setLogger(console.log)
remote.getCurrentWebContents().toggleDevTools()

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('start').addEventListener('click', startCamera);
})
