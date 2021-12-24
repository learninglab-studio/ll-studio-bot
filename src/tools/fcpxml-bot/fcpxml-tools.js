const { yellow, blue, magenta, cyan } = require('../utilities/mk-utilities')
const fs = require(`fs`)
const axios = require(`axios`)
const path = require(`path`)

module.exports.handleSlackedFcpxml = async (event, client, fileInfo) => {
    magenta(`got an fcpxml event`)
    magenta(event)
    cyan(`here we'd download file with id: ${event.file.id}`)
    const filePath = path.resolve(ROOT_DIR, '.tests', 'fcpxml', 'test.fcpxml')
    cyan(`and we'd do download it to path: ${filePath}`)
    // await downloadFromSlack(fileInfo.file.url_private_download, filePath)
    await downloadFromSlack(fileInfo.file.url_private, filePath)
    return (`done`)
}

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