var cp = require('child_process');
var fs = require('fs');
var path = require('path');

const downloadFromSlack = async (url, path, options) => {
    const writer = fs.createWriteStream(path)
    const response = await axios({
        url,
        method: 'GET',
        headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
        responseType: 'stream'
    })
    response.data.pipe(writer)
    return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
    })
}

const makeGif = async (file) => {
    const gifPath = path.join(ROOT_DIR, temp, `${path.basename(file, path.extname(file))}_200.gif`)
    const palettePath = path.join(ROOT_DIR, temp, `${path.basename(file, path.extname(file))}_palette.png`)
}

const determineDimensions = async (file) => {
    const fileData = await llProbe(file)
}


module.exports = async function(settings){
  
  var gifBasename = path.basename(normFilePath, path.extname(filePath));
  var palettePath = path.join(settings.gifFolder,
    (gifBasename + "_palette.png"));
  var height = settings.height ? settings.height : 270;
  var width = settings.width ? settings.width : 480;
  var gifPath = path.join(settings.gifFolder,
    (gifBasename + '_' + height
    + ".gif"));
  var htmlPath = path.join(settings.gifFolder,
    (gifBasename + "_index.html"));
  cp.spawnSync(process.env.FFMPEG_PATH, ['-i', filePath, '-vf',
    'palettegen', palettePath]);
  cp.spawnSync(process.env.FFMPEG_PATH, ['-i', filePath, '-i',
    palettePath, '-vf', ('scale=' + width + ":"
    + height), '-y', gifPath]);
  if (settings.html) {
    fse.writeFileSync(htmlPath, makeHtml(gifPath, palettePath, (JSON.stringify(settings, null, 4))), 'utf-8');
    cp.spawnSync('open', [htmlPath]);
  }
  var pixelDataArray = await analyzePng(palettePath);
  console.log(JSON.stringify(pixelDataArray));
  console.log("htmlPath: " + htmlPath);
  return
};
