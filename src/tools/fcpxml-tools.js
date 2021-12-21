const { yellow, blue, magenta, cyan } = require('./mk-utilities')
const fs = require(`fs`)
import fetch from 'node-fetch';

module.exports = (event) => {
    magenta(`got an fcpxml event`)
    magenta(event)
}

const downloadFromSlack = async function (url, token) {

}
const downloadFile = (async (url, path) => {
    const res = await fetch(url);
    const fileStream = fs.createWriteStream(path);
    await new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on("error", reject);
        fileStream.on("finish", resolve);
        });
});


// import {createWriteStream} from 'fs';
// import {pipeline} from 'stream';
// import {promisify} from 'util'
// import fetch from 'node-fetch';

// const streamPipeline = promisify(pipeline);

// const response = await fetch('https://github.githubassets.com/images/modules/logos_page/Octocat.png');

// if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);

// await streamPipeline(response.body, createWriteStream('./octocat.png'));