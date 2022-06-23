var cp = require("child_process");
var path = require("path");
var fs = require('fs');
const csv = require('csv-parser');
const { magenta, gray } = require("../utilities/mk-utilities");

async function makePeakGif(videofilePath, settings) {
  var options = settings ? createOptions(videofilePath, settings) : createOptions(videofilePath, {});
  const start = Date.now()
  try {
    const audioAnalysis = await analyzeAudio(videofilePath, options)
    options.startFrame = parseFloat(audioAnalysis.max.frame) + options.timeOffset;
    const gifResult = await makeGif(options)
    gifResult.timeElapsed = Date.now() - start
    gray(gifResult)
  } catch (error) {
    console.log(error);
  }
}

function createOptions(videofilePath, settings){
  var newSettings = {};
  newSettings.videofilePath = videofilePath;
  newSettings.normFilePath = videofilePath.replace(/ /g,"_");
  newSettings.outputFolder = settings.outputFolder ? settings.outputFolder 
    : process.env.PEAKGIF_OUTPUT_FOLDER ? process.env.PEAKGIF_OUTPUT_FOLDER : path.dirname(videofilePath);
  newSettings.basename = path.basename(newSettings.normFilePath, path.extname(videofilePath));
  newSettings.height = settings.height ? settings.height : 540;
  newSettings.width = settings.width ? settings.width: 960;
  newSettings.palettePath = path.join(newSettings.outputFolder, (newSettings.basename + "_palette.png"));
  newSettings.gifPath = path.join(newSettings.outputFolder, (newSettings.basename + "_" + newSettings.height + ".gif"));
  newSettings.segmentPath = path.join(newSettings.outputFolder, (newSettings.basename + "_segment.mov"));
  newSettings.htmlPath = path.join(newSettings.outputFolder, (newSettings.basename + "_index.html"));
  newSettings.offset = settings.offset ? Number(settings.offset) : 0;
  newSettings.timeOffset = newSettings.offset/24 - 1;
  newSettings.html = settings.html ? settings.html : true;
  return newSettings;
};

const analyzeAudio = async function (videofilePath, options) {
    const audioDataPath = path.join(options.outputFolder, `${options.basename}_audiodata.csv`)
    // delete if already exists
    if (fs.existsSync(audioDataPath)) { fs.unlinkSync(audioDataPath); }
    return new Promise( (resolve, reject) => {
        var proc = cp.spawn('ffprobe', [
            '-f', 'lavfi',
            '-i', `amovie=${videofilePath},astats=metadata=1:reset=1`,
            '-show_entries', 'frame=pkt_pts_time:frame_tags=lavfi.astats.Overall.RMS_level',
            '-of',  'csv=p=0',
          ], { encoding : 'utf8' }
        );
        proc.stderr.setEncoding("utf8");
        proc.stdout.setEncoding("utf8");
        proc.stdout.on('data', function(data) {
            try {
                console.log(data)
                fs.appendFileSync(audioDataPath, data);
            } catch (err) {
            console.log("error appending");
            }
        });
        proc.stderr.on('data', function(data) {
        // console.log(data);
        });
        proc.on('close', function() {
            console.log('finished child process');
            var audiodataArray = [];
            fs.createReadStream(audioDataPath)
                .pipe(csv(['frame', 'level']))
                .on('data', (row) => {
                audiodataArray.push(row);
                })
                .on('end', () => {
                    var minMaxResult = findMinMax(audiodataArray, "level");
                    magenta(minMaxResult)
                    resolve(minMaxResult);
                });
        });
    })
}

function findMinMax(arr, prop) {
  var smoothedArray = getMovingAverage(arr, 48);
  gray(smoothedArray)
  let minEl = smoothedArray[0], maxEl = smoothedArray[0];
  for (let i = 1; i < smoothedArray.length; i++) {
    let thisVal = parseFloat(smoothedArray[i][prop]);
    if (thisVal > maxEl[prop]) {
      maxEl = smoothedArray[i]
    }
    if (thisVal < minEl[prop]) {
      minEl = smoothedArray[i]
    }
  }
  return {min: minEl, max: maxEl};
}

function getMovingAverage(arr, frames){
  var newArray = arr.map(function(e, index) {
    var sumOfValues = 0;
    for (var j = 0; j < frames; j++) {
      var elToSum = (arr[index-(frames/2)+j] && arr[index-(frames/2)+j].level!=="-inf") ? arr[index-(frames/2)+j].level : -80;
      sumOfValues+=parseFloat(elToSum);
    }
    var theAverageLevel = sumOfValues/frames;
    return {
      frame: e.frame,
      level: theAverageLevel,
      adjustment: (theAverageLevel - e.level)
    }
  });
  magenta(newArray)
  return newArray;
}

function makeGif(setup) {
    cp.spawnSync('ffmpeg', [
        '-ss', setup.startFrame,
        '-i', setup.videofilePath,
        '-t', 2.0, // TODO: let's add this as an option (up to a 10 second limit)
        '-y', setup.segmentPath
    ]);
    cp.spawnSync('ffmpeg', [
        '-i', setup.segmentPath,
        '-vf', 'palettegen',
        '-y', setup.palettePath
    ]);
    cp.spawnSync('ffmpeg', [
        '-i', setup.segmentPath,
        '-i', setup.palettePath,
        '-vf', `scale=${setup.width}:${setup.height}`,
        '-y', setup.gifPath]);
    return({path: setup.gifPath})
}

module.exports = makePeakGif;