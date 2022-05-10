var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var movRegex = /(mov|mp4|mxf|mts|m4v)/i;
var filesToCopyRegex = /(jpg|wav|png|aac|mp3)/i;
var ffprobeToJson = require('./ffprobe-to-json');
const { cyan, blue, yellow, magenta, gray, white, divider } = require(`../utilities/mk-utilities`);
var intervalToDuration = require('date-fns/intervalToDuration')
var format = require('date-fns/format')

const makeShootProxy = async function (folder, options) {
    const jobStart = new Date()
    gray(`starting makeShootProxy at ${format(jobStart, "yyyyMMdd.HH:mm:ss.SSS")} with folder:\n${folder}\nand options:\n${JSON.stringify(options, null, 4)}`)
    const listOfOperations = await createListOfOperations(folder)
    magenta(divider, `listOfOperations`, divider)
    gray(listOfOperations)
    const result = await performOperations(listOfOperations)
    const jobEnd = new Date()
    const jobDuration = jobEnd.getTime() - jobStart.getTime()
    magenta(divider, `job took ${jobDuration} to complete`)
    const jobDurationDate = new Date(jobDuration)
    gray(`took ${jobDurationDate.getMinutes()}:${jobDurationDate.getSeconds()}.${jobDurationDate.getMilliseconds()} `)
    const interval = intervalToDuration({start: jobStart, end: jobEnd})
    magenta(interval)
}

const createListOfOperations = (folder, options) => {
    const fileOperations = {
        proxyFolder: path.join(path.dirname(folder), `${path.basename(folder)}.proxy`),
        proxySubfolders: [],
        proxies: [],
        copies: [],
        unknowns: [],
        errorLogs: []
    }
    const folderContents = fs.readdirSync(folder)
    for (let i = 0; i < folderContents.length; i++) {
        const source = folderContents[i];
        if (fs.lstatSync(path.join(folder, source)).isDirectory()) {
            const proxySubfolder = path.join(fileOperations.proxyFolder, source)
            fileOperations.proxySubfolders.push(proxySubfolder)
            const sourceFiles = fs.readdirSync(path.join(folder, source))
            for (let index = 0; index < sourceFiles.length; index++) {
                const element = sourceFiles[index];
                if (movRegex.test(element)) {
                    fileOperations.proxies.push({
                        sourcePath: path.join(folder, source, element),
                        destinationPath: path.join(proxySubfolder, element )
                    })
                } else if (filesToCopyRegex.test(element)) {
                    blue(`${element} is a recognized file-to-be-copied`)
                    fileOperations.copies.push({
                        sourcePath: path.join(folder, source, element),
                        destinationPath: path.join(proxySubfolder, element)
                    })
                } else {
                    fileOperations.unknowns.push({
                        sourcePath: path.join(folder, source, element),
                        destinationPath: `unknown`
                    })
                    fileOperations.errorLogs.push(`${element}, in the source folder ${path.join(folder, source)} doesn't appear to be a folder`)
                }            
            }
        } else {
            fileOperations.errorLogs.push(`${source}, in the root folder ${folder} doesn't appear to be a folder`)
        }
    }
    return fileOperations
}

const performOperations = async ({ proxyFolder, proxySubfolders, proxies, copies }) => {
    blue(divider, `performing operations`, divider)
    if (!fs.existsSync(proxyFolder)) {
        fs.mkdirSync(proxyFolder)
    }
    proxySubfolders.forEach(f => {
        if (!fs.existsSync(f)) {
            fs.mkdirSync(f)
        }
    });
    for (let i = 0; i < proxies.length; i++) {
        const element = proxies[i];
        await transcodeFile(element.sourcePath, element.destinationPath)        
    }
    for (let i = 0; i < copies.length; i++) {
        const element = copies[i];
        await fs.copyFileSync(element.sourcePath, element.destinationPath)
    }
}

var transcodeFile = async function(file, proxyPath, options){
    await cp.spawnSync('ffmpeg', [
      '-i', file,
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      // '-vf', ('scale='+ outputWidth +':'+outputHeight ),
      '-preset', 'slow',
      '-crf', (options && options.crfVal) ? options.crfVal : '23',
      '-ac', '2',
      '-c:a', 'aac',
      '-b:a', '128k',
      proxyPath
    ], {
      stdio: [
        0, // Use parent's stdin for child
        'pipe', // Pipe child's stdout to parent
        2 // Direct child's stderr to a file
      ]
    });
}

// module.exports.transcodeFile = transcodeFile;
// module.exports.transcodeSingleFile = transcodeSingleFile;
// module.exports.transcodeFolder = transcodeFolder;
module.exports.makeShootProxy = makeShootProxy;

