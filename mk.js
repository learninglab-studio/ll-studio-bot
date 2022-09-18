#!/usr/bin/env node

const atemTools = require('./src/tools/utilities/atem-tools')
require('dotenv').config();
var yargs = require('yargs').argv;
var fs = require('fs')
const path = require('path')
global.__basedir = __dirname;

const { Atem } = require('atem-connection');

const doTheThing = async (source) => {
    let switchResult = await atemTools.switch({
        camera: source,
        atemIp: process.env.MK_ATEM_MINI_IP,
        // script: true
    })
    console.log("done the switch, next up let's get the status")
    let atemState = await atemTools.getState ({
        atemIp: process.env.MK_ATEM_MINI_IP
    })
    // console.log(JSON.stringify(atemState, null, 4))
    await fs.writeFileSync(path.join(__basedir, '_temp', `atem-state-${Date.now()}.json`), JSON.stringify(atemState, null, 4))
    // process.exit()
    let switchResult2 = await atemTools.switch({
        camera: "2",
        atemIp: process.env.MK_ATEM_MINI_IP,
        // script: true
    })
    console.log("complete the async")
    console.log(JSON.stringify(atemState))
    return ("done")

}


console.log("launching it.")

if (yargs) {
   console.log(JSON.stringify(yargs, null, 4))
   console.log(`switching to ${yargs._[0]}`)
   doTheThing(yargs._[0])
   } else {
    console.log(`sorry, you didn't enter a recognized command.`)
}