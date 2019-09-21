const path = require('path')
const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')
const youtubeDl = require('youtube-dl')
const { spawn } = require('child_process');

const _ = require('lodash')

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
}) {
  return new Promise((resolve, reject) => {
    let extension = 'mp4'

    youtubeDl.getInfo(url, ["-f best"], function(err, info) {
      if (err) throw err

      console.log('id:', info.id)
      console.log('title:', info.title)

      const onlyAudioFormats = _.filter(info.formats, (f) => f.vcodec === "none")
      let audioFormat = _.find(onlyAudioFormats, f => f.ext === 'm4a')
      if (!audioFormat) {
        audioFormat = _.maxBy(_.filter(onlyAudioFormats, f => f.ext === 'webm'), 'format_id')
        extension = 'mkv'
      }

      const maxFPS = _.maxBy(info.formats, 'fps').fps;
      let videos = _.filter(info.formats, f => f.fps === maxFPS && f.ext === 'mp4');
      if (videos.length === 0) {
        videos = _.filter(info.formats, f => f.fps === maxFPS && f.ext === 'webm');
        extension = 'mkv'
      }
      const videoFormat = _.maxBy(videos, 'height')
      console.log('format:', videoFormat.format)
      console.log(`dimensions: ${videoFormat.width}x${videoFormat.height}`)

      let filename = info._filename.replace('.mp4', '')

      const fullDir = path.join(options.path, info.creator || info.uploader);
      fs.mkdirSync(fullDir, { recursive: true });
      const filePath = path.join(fullDir, `${filename}.${extension}`)

      let ydlOptions =
        ['-f', `${videoFormat.format_id}+${audioFormat.format_id}`, '--merge-output-format', extension, url]

      console.log('Going to run:')
      console.log(`${youtubeDl.getYtdlBinary()} ${ydlOptions}`)
      console.log('-----------')

      exists(filePath, (doesExist) => {
        const videoObj = {
          name: filename,
          url,
          downloading: false,
          format: extension
        }

        if (!doesExist) {
          const ydl = spawn(youtubeDl.getYtdlBinary(), ydlOptions, { cwd: fullDir, maxBuffer: Infinity });
          ydl.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
          });

          ydl.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
          });

          ydl.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            resolve(videoObj);
          });
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
