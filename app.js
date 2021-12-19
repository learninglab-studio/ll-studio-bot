const { App } = require('@slack/bolt');
require('dotenv').config();

const messageHandler = require('./src/tools/message-handler.js');
const eventHandler = require('./src/tools/event-handler.js');
const slashHandler = require('./src/tools/slash-handler.js');

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    port: process.env.PORT || 3000
  });

app.message('hello', messageHandler.hello);
app.message(/.*/, async ({ message })=> {console.log(JSON.stringify(message, null, 4))});

app.command('/switch', slashHandler.switch);
// app.command('/a8ksync', slashHandler.a8ksync);

app.event(/file/, eventHandler.file);
app.event(/.*/, eventHandler.log);

(async () => {
  await app.start(process.env.PORT || 3000);
  try {
    await app.client.chat.postMessage({
      channel: process.env.SLACK_TESTS_CHANNEL,
      text: "starting up the simple-slack app"
    })
  } catch (error) {
    console.error(error)
  }
  console.log('⚡️ Bolt app is running! on port', (process.env.PORT || 3000));
})();