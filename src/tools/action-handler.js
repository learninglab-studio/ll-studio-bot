const { blue, yellow, cyan, magenta, gray } = require('./utilities/mk-utilities')
// const airtableTools = require(`./utilities/airtable-tools`)
const atemTools = require(`./utilities/atem-tools`)



module.exports.log = async ({ payload, body, context, ack }) => {
    await ack()
    gray(payload)
    gray(body)
}

module.exports.atemButtons = async ({ payload, body, context, ack }) => {
    await ack()
    blue(payload)
    // yellow(body)
    await atemTools.macro(
        {
            atemIp: process.env.A8K_IP,
            macro: payload.value
        }
    )
}