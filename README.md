# Dash to MP4 and decrypt (with known key)

Simple script that downloads all the bitrate versions from the MPD manifest, merges all the segments from one bitrate into 1 big mp4 that gets decrypted using the key provided

This script downloads all the bitrates and all audio versions but it muxes only the first audio version

The command syntax is like this (watch out for quotation marks)

```bash
$ npm start [mpd uri] '["KID:KEY"]' [output file prefix]
```
