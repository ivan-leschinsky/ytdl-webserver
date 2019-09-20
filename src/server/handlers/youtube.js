const path = require('path')
const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')
const youtubeDl = require('@microlink/youtube-dl')

function exists (filename, cb) {
  fs.access(filename, fs.F_OK, (err) => {
    if (!err) {
      cb(true)
    } else {
      cb(false)
    }
  })
}

function download (url, options = {
  path: 'downloads',
  audioOnly: false
}) {
  return new Promise((resolve, reject) => {
    let extension = 'mp4'
    let ydlFormat = 'best'
    if (options.audioOnly) {
      extension = 'mp3'
      ydlFormat = '18'
    }

    // TODO Add proper support for options
    const video = youtubeDl(url,
      // Optional arguments passed to youtube-dl.
      [`--format=${ydlFormat}`],

      { cwd: __dirname, maxBuffer: Infinity })

    // Will be called when the download starts.
    video.on('info', info => {
      let filename = info._filename.replace('.mp4', '')

      if (options.audioOnly) {
        filename = info.title
      }

      const fullDir = path.join(options.path, info.creator);

      fs.mkdirSync(fullDir, { recursive: true });

      const filePath = path.join(fullDir, `${filename}.${extension}`)

      exists(filePath, (doesExist) => {
        const videoObj = {
          name: filename,
          url,
          downloading: false,
          format: extension
        }

        if (!doesExist) {
          // Convert to audio
          ffmpeg({ source: video })
            .on('end', () => {
              resolve(videoObj)
            })
            .toFormat(extension)
            .save(filePath)
        } else {
          resolve(videoObj)
        }
      })
    })
  })
}

module.exports = {
  download
}
