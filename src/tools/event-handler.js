const { blue, yellow, cyan, magenta } = require('./mk-tools')
const airtableTools = require(`./airtable-tools`)


exports.file = async ({ event, client}) => {
    if (event.type == "file_shared" && event.channel_id == process.env.SLACK_EXTERNAL_LINKS_CHANNEL) {
      try {
        console.log(`\nhere's the event:\n\n${JSON.stringify(event, null, 4)}`)
        const result = await client.files.info({
          file: event.file_id,
        });
        console.log(`\nhere's the event:\n\n${JSON.stringify(event, null, 4)}`)
        console.log(`\nhere's the result:\n\n${JSON.stringify(result, null, 4)}`)
        if (result.file.public_url_shared !== true) {
          const publicResult = await client.files.sharedPublicURL({
            token: process.env.SLACK_USER_TOKEN,
            file: event.file_id,
          });
          console.log(`\nhere's the public result:\n\n${JSON.stringify(publicResult, null, 4)}`)  
          const mdPostResult = await client.chat.postMessage({
            channel: event.user_id,
            text: `posted a photo! but it was already public: ${makeSlackImageURL(result.file.permalink, result.file.permalink_public)}.\n\nhere's your markdown:\n\`\`\`![alt text](${makeSlackImageURL(result.file.permalink, result.file.permalink_public)})\`\`\``
          })
          const airtableResult = await airtableTools.addRecord({
            baseId: process.env.AIRTABLE_STUDIO_BOT_BASE,
            table: "PublicImages",
            record: {
                  "Name": result.file.title,
                  "SlackEventJSON": JSON.stringify(event, null, 4),
                  "SlackFileInfoJSON": JSON.stringify(result, null, 4),
                  "ImageFiles": [
                    {
                      "url": makeSlackImageURL(result.file.permalink, result.file.permalink_public)
                    }
                  ],
                  "Status": "no-status"
                
            }
          })
        } else {
          console.log(`file was already public: ${result.file.url_private} is what we'd handle`);
          const mdPostResult = await client.chat.postMessage({
            channel: event.user_id,
            text: `posted a photo! but it was already public: ${makeSlackImageURL(result.file.permalink, result.file.permalink_public)}.\n\nhere's your markdown:\n\`\`\`![alt text](${makeSlackImageURL(result.file.permalink, result.file.permalink_public)})\`\`\``
          })
        }
        
      }
      catch (error) {
        console.error(error);
      }
    } else {
      try {
        yellow(`got some other random file event:`);
        magenta(event)
      }
      catch (error) {
        console.error(error);
      }
    }
  }
  
  
  function makeSlackImageURL (permalink, permalink_public) {
    let secrets = (permalink_public.split("slack-files.com/")[1]).split("-")
    let suffix = permalink.split("/")[(permalink.split("/").length - 1)]
    let filePath = `https://files.slack.com/files-pri/${secrets[0]}-${secrets[1]}/${suffix}?pub_secret=${secrets[2]}`
    return filePath
  }

exports.log = async ({ event }) => {
  if (event.type == "message") {
    blue(`got that message with ts ${event.ts} as an event too`)
  } else {
    yellow(`currently unhandled event of type ${event.type}:`)
    cyan(event)
  }
}