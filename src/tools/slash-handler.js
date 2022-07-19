const atemTools = require(`./utilities/atem-tools`)
var Airtable = require('airtable');

exports.switch = async ({ command, ack, say }) => {
    ack();
    console.log(JSON.stringify(command, null, 4))
    console.log(`let's try a simple switch to camera ${command.text}`)
    await atemTools.switch({
        atemIp: process.env.A8K_IP,
        camera: command.text
    })
}

exports.log = async ({ command, ack, say }) => {
    ack();
    console.log(`log request`)
    console.log(JSON.stringify(command, null, 4))
}

exports.a8ksync = async ({ command, ack, say }) => {
    ack();
    console.log(JSON.stringify(command, null, 4))
    console.log(`let's sync the atem to server time`)
    await atemTools.syncToClock({
        atemIp: process.env.A8K_IP,
        cb: async (time) => {
            await say(`syncing to ${time}`)
        }
    })
}

exports.hundredStills = async ({ command, ack, say }) => {
    ack();
    const theRecords = await findManyByValue({
        field: "DateByFormula",
        value: command.text,
        table: "StillsRequests"
    })
    var theEDL = `TITLE: the-${command.text}-stills\nFCM: NON-DROP FRAME\n\n`
    for (let i = 0; i < theRecords.length; i++) {
        const element = theRecords[i];
        // console.log(JSON.stringify(element, null, 4));
        theEDL+=`${(i+1).toString().padStart(3, "0")}  AX       V     C        ${inTc(element.fields.Timecode)} ${outTc(element.fields.Timecode)} ${framesToTimecode(i)} ${framesToTimecode(i+1)}\n* FROM CLIP NAME: ${element.fields.VideoFileName}\n\n`
    }
    await say(`we'll get your EDL from ${command.text}. Is this it? \n\`\`\`${theEDL}\`\`\``)
}

exports.rocket = async ({ message, say }) => {
    await say(`thanks for the :rocket:, <@${message.user}>`);
}


const findManyByValue = async function(options) {
    var base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_SUMMER_BASE);
    theRecords = [];
    var queryOptions = {
      maxRecords: options.maxRecords ? options.maxRecords : 100,
      view: options.view ? options.view : "Grid view",
      filterByFormula: `${options.field}=${options.value}`
    }
    // console.log(queryOptions);
    await base(options.table).select(queryOptions).eachPage(function page(records, next){
      theRecords.push(...records);
      next()
    })
    // .then(()=>{
    //   // return(theRecords);
    // })
    .catch(err=>{console.error(err); return})
    return theRecords;
  }
  
const framesToTimecode = (frames) => {
    const theFrames = frames%24
    const theSeconds = (frames - theFrames)%60
    const theMinutes = (frames - theFrames - theSeconds*24)
    return `00:${theMinutes.toString().padStart(2, "0")}:${theSeconds.toString().padStart(2, "0")}:${theFrames.toString().padStart(2, "0")}`
}

const inTc = (atc) => {
    console.log(`getting inTc from ${atc}.`)
    var ms = parseFloat(atc.split(".")[1])
    console.log(`ms are ${ms}.`)
    return `${atc.split(".")[0]}:${Math.floor(ms*24/1000).toString().padStart(2, "0")}`
}

const outTc = (atc) => {
    var ms = parseFloat(atc.split(".")[1])
    return `${atc.split(".")[0]}:${Math.floor(ms*24/1000 + 1).toString().padStart(2, "0")}`
}