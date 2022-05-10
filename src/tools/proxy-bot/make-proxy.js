var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var movRegex = /(mov|mp4|mxf|mts|m4v)/i;
var filesToCopyRegex = /(jpg|wav|png|aac|mp3)/i;
var ffprobeToJson = require('./ffprobe-to-json');
const { cyan, blue, yellow, magenta, gray, white, divider } = require(`../utilities/mk-utilities`);
const { grey } = require('colors');

// var transcodeFolder = async function(folder, options){
//   var theFiles = fs.readdirSync(folder);
//   if (options && options.proxyFolder) {
//     var proxyFolder = path.join(proxyFolder, (path.basename(folder) + '_proxy'));
//   } else {
//     var proxyFolder = path.join(path.dirname(folder), (path.basename(folder) + '_proxy'));
//   }
//   if (!fs.existsSync(proxyFolder)) {
//     fs.mkdirSync(proxyFolder, {recursive: true})
//   }
//   console.log("proxyFolder is " + proxyFolder);
//   console.log(JSON.stringify(theFiles, null, 4));
//   for (var i = 0; i < theFiles.length; i++) {
//     if (movRegex.test(theFiles[i])) {
//       console.log("this is a movie: " + theFiles[i]);
//       await transcodeFile(
//         path.join(folder, theFiles[i]),
//         path.join(proxyFolder, theFiles[i]),
//         {
//           crfVal: (options && options.crf) ? options.crf : '23'
//         }
//       );
//     } else {
//       console.log(theFiles[i] + " doesn't seem to be a movie");
//     }
//   }
// }




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

// function getDesiredDimensions(videoFilePath){
//   var options = ['-v', 'error', '-print_format', 'json', '-select_streams', 'v:0', '-show_entries', 'stream=width,height'];
//   var output = JSON.parse(ffprobetools.ffprobeSyncSimple(videoFilePath, options));
//   var outputWidth=1920;
//   var outputHeight=1080;
//   console.log(output.streams[0].width + " is the width");
//   if (output.streams[0].height && (output.streams[0].height>1080)) {
//     console.log(videoFilePath + " has height larger than 1080: " + output.streams[0].height);
//     outputWidth=output.streams[0].width/(output.streams[0].height/1080);
//     console.log("making outputWidth " + outputWidth);
//   }
//   else if (output.streams[0].height && (output.streams[0].height==1080)) {
//     console.log(videoFilePath + " has height of exactly 1080: " + output.streams[0].height);
//   }
//   else if (output.streams[0].height && (output.streams[0].height<1080)) {
//     console.log(videoFilePath + " has height of less than 1080: " + output.streams[0].height);
//     outputWidth=output.streams[0].width;
//     outputHeight=output.streams[0].height;
//   }
//   else {
//     console.log("something went wrong--perhaps this is not a video file");
//   }
//   return {outputWidth: outputWidth, outputHeight: outputHeight};
// }


const makeShootProxy = async function (folder, options) {
    gray(`starting makeShootProxy with folder:\n${folder}\nand options:\n${JSON.stringify(options, null, 4)}`)
    const listOfOperations = await createListOfOperations(folder)
    magenta(divider, `listOfOperations`, divider)
    gray(listOfOperations)
    const result = await performOperations(listOfOperations)
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
        
    }
}

// module.exports.transcodeFile = transcodeFile;
// module.exports.transcodeSingleFile = transcodeSingleFile;
// module.exports.transcodeFolder = transcodeFolder;
module.exports.makeShootProxy = makeShootProxy;

