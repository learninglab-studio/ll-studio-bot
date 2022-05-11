var chokidar = require('chokidar');
const makeBlackAndWhite = require('./make-black-and-white')

const imageWatcher = async (folder) => {
    var watcher = chokidar.watch(folder, {ignored: /\.DS_Store/, persistent: true, awaitWriteFinish: true});
    watcher
        .on('add', async function(path) {
            console.log('File', path, 'has been added');
            if (!/-bw/.test(path)) {
                await makeBlackAndWhite(path);
            } else {
                console.log(`black and white photo created: ${path}`)
            }
        })
        .on('change', function(path) {console.log('File', path, 'has been changed');})
        .on('unlink', function(path) {console.log('File', path, 'has been removed');})
        .on('error', function(error) {console.error('Error happened', error);})
}

module.exports = imageWatcher