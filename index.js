
const { unlinkSync, existsSync } = require('fs');
const {getVideo, getAudio} = require('./mpd-segments')
const ffmpeg = require('fluent-ffmpeg')

function getDec(key, input, output) {
    return new Promise((resolve, reject) => {
        let keys = [];
        key.forEach(a => {
         keys.push("--key");
         keys.push(a);
        })
        const stream = require('child_process').spawn('mp4decrypt', [...keys, input, output])
        stream.on('close', (code, signal) => {
            if(code === 0)
                resolve(`${input} decrypted!`);
        })
        stream.stderr.on('data', (err) => {
            reject(err.toString());
        })
    })
}

async function muxAV(output, video, audio){
    return new Promise((resolve, reject) => {
        let proc = ffmpeg(`${output}_${video}.mp4`)
        .addInput(`${output}_${audio}.mp4`)
        .outputOption("-c", "copy")
        .saveToFile(`${output}_${video}_muxed.mp4`)
        proc.on('end', () => {
            resolve(`${output}_${video}.mp4 muxed with ${output}_${audio}.mp4 audio`);
        })
        proc.on('error', function(err, stdout, stderr) {
            console.log('Cannot process video: ' + err.message);
        });
    })
}

(async () => {
    let mpd = process.argv[2];
    let key = process.argv[3];
    let output = process.argv[4];
    console.log(JSON.parse(key));
    try {
        await getVideo(mpd, output).then(async a => {
           let saudio = await getAudio(mpd, output)
           let deca = await getDec(JSON.parse(key), `${saudio[0]}.mp4`, `${output}_${saudio[0]}.mp4`);
           console.log(deca);
           unlinkSync(`${saudio[0]}.mp4`);
           if(a.length){
                for (const video of a) {
                    let decv = await getDec(JSON.parse(key), `${video}.mp4`, `${output}_${video}.mp4`);
                    console.log(decv);
                       decv && unlinkSync(`${video}.mp4`);
                    if(decv && deca) {
                        let mux = await muxAV(output, video, saudio);
                        mux && unlinkSync(`${output}_${video}.mp4`)
                        console.log(mux);
                    }
                };
            }
        })
    } catch (error) {
        console.error(error);
    }
})()
