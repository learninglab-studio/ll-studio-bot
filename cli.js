#!/usr/bin/env node

var figlet = require('figlet');
var clear = require('clear');
// const mk = require('./tools/mk/index')
// const rename = require('./tools/ingest/rename')
// const makeFolders = require('./tools/ingest/make-folders')
// const m2s = require('./tools/m2s/index.js')
// const { secs2hms, secs2tc } = require('./tools/utilities/ll-time-tools')
// const processRenamedFolder = require('./tools/ingest/process-renamed-folder')
const makePeakGif = require('./src/tools/gif-bot/make-peak-gif')
const { makeShootProxy, makeMonthOfProxy } = require(`./src/tools/proxy-bot/make-proxy`);
const watch = require(`./src/tools/button-bot/watcher`)
const videoToStills = require(`./src/tools/image-bot/video-to-stills`)

require('dotenv').config();
require("dotenv").config({ path: __dirname + `/.env` });

// store any arguments passed in using yargs
var yargs = require('yargs').argv;

console.log("launching it.")

if (yargs.mk) {
    mk(yargs)
} else if (yargs.rename) {
    rename(yargs.rename)
} else if (yargs.makefolders) {
    makeFolders(yargs.makefolders)
} else if (yargs.m2s) {
    m2s(yargs.m2s)
} else if (yargs.process) {
    const processOptions = {}
    processRenamedFolder(yargs.process, processOptions)
} else if (yargs.proxy) {
    const proxyOptions = {}
    makeShootProxy(yargs.proxy, proxyOptions)
} else if (yargs.proxyMonth) {
    const proxyOptions = {}
    makeMonthOfProxy(yargs.proxyMonth, proxyOptions)
} else if (yargs.peakgif) {
    makePeakGif(yargs.peakgif)
} else if (yargs.bwFolder) {
    watch(yargs.bwFolder)
} else if (yargs.v2s) {
    videoToStills(yargs.v2s)
} else {
    console.log(`sorry, you didn't enter a recognized command.`)
}