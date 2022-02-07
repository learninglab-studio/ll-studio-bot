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

require('dotenv').config();

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
} else if (yargs.peakgif) {
    makePeakGif(yargs.peakgif)
} else {
    console.log(`sorry, you didn't enter a recognized command.`)
}