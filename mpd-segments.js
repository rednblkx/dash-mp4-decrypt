var mpdParser = require('mpd-parser');
const fs = require('fs');
const {default: axios} = require('axios');

async function downloadFile(fileUrl, output) {
  const writer = fs.createWriteStream(output, {flags: "a"})
    return axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream',
    }).then(response => {
  
      //ensure that the user can call `then()` only when the file has
      //been downloaded entirely.
  
      return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        let error = null;
        writer.on('error', err => {
          error = err;
          writer.close();
          reject(err);
        });
        writer.on('close', () => {
          if (!error) {
            resolve(true);
          }
          //no need to call the reject here, as it will have been called in the
          //'error' stream;
        });
      });
    });
}

exports.getVideo = async (mpd) => {
  var list = [];
    // var concatStream = fs.createWriteStream('file.mp4', {flags: "a"})
    return new Promise(async (resolve, reject) => {
      try {
        var manifest = await axios.get(mpd, {
            headers: {
                'User-Agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36"
            }
        })
        
        var parsedManifest = mpdParser.parse(manifest.data, {manifestUri: mpd.match("(.*)\/")[0]});
        
        for(const el in parsedManifest.playlists){
          fs.existsSync(`video_${parsedManifest.playlists[el].attributes.NAME}.mp4`) && fs.unlinkSync(`video_${parsedManifest.playlists[el].attributes.NAME}.mp4`)
          list.push(`video_${parsedManifest.playlists[el].attributes.NAME}`)
          await downloadFile(`${parsedManifest.playlists[el].segments[0].map.resolvedUri}`, `video_${parsedManifest.playlists[el].attributes.NAME}.mp4`).then(async a => {
            for (const element in parsedManifest.playlists[el].segments) {
              await downloadFile(parsedManifest.playlists[el].segments[element].resolvedUri, `video_${parsedManifest.playlists[el].attributes.NAME}.mp4`);
            };
          })
          console.log(`${parsedManifest.playlists[el].attributes.NAME} downloaded!`)
          if(Number(el) === parsedManifest.playlists.length - 1){
              resolve(list);
          }
        }
      } catch(error){
        reject(error);
      }
    })
}
exports.getAudio = async (mpd) => {
  var list = [];
    // var concatStream = fs.createWriteStream('file.mp4', {flags: "a"})
    return new Promise(async (resolve, reject) => {
      try {
        var manifest = await axios.get(mpd, {
            headers: {
                'User-Agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36"
            }
        })
        
        var parsedManifest = mpdParser.parse(manifest.data, {manifestUri: mpd.match("(.*)\/")[0]});
        for (const key in parsedManifest.mediaGroups.AUDIO.audio) {
          for(const el in parsedManifest.mediaGroups.AUDIO.audio[key].playlists){
            fs.existsSync(`audio_${parsedManifest.mediaGroups.AUDIO.audio[key].playlists[el].attributes.NAME}_${key}.mp4`) && fs.unlinkSync(`audio_${parsedManifest.mediaGroups.AUDIO.audio[key].playlists[el].attributes.NAME}_${key}.mp4`)
            list.push(`audio_${parsedManifest.mediaGroups.AUDIO.audio[key].playlists[el].attributes.NAME}_${key}`)
            await downloadFile(`${parsedManifest.mediaGroups.AUDIO.audio[key].playlists[el].segments[0].map.resolvedUri}`, `audio_${parsedManifest.mediaGroups.AUDIO.audio[key].playlists[el].attributes.NAME}_${key}.mp4`).then(async a => {
              for (const element in parsedManifest.mediaGroups.AUDIO.audio[key].playlists[el].segments) {
                await downloadFile(parsedManifest.mediaGroups.AUDIO.audio[key].playlists[el].segments[element].resolvedUri, `audio_${parsedManifest.mediaGroups.AUDIO.audio[key].playlists[el].attributes.NAME}_${key}.mp4`);
              };
            })
            console.log(`${parsedManifest.mediaGroups.AUDIO.audio[key].playlists[el].attributes.NAME} downloaded!`)
            if(Number(el) === parsedManifest.mediaGroups.AUDIO.audio[key].playlists.length - 1){
              resolve(list);
            }
          }
        }
      } catch(error){
        reject(error);
      }
    })
}