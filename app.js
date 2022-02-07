const { App } = require('@slack/bolt');
require('dotenv').config();
var path = require('path');
global.ROOT_DIR = path.resolve(__dirname);

const messageHandler = require('./src/tools/message-handler.js');
const eventHandler = require('./src/tools/event-handler.js');
const slashHandler = require('./src/tools/slash-handler.js');
const shortcutHandler = require('./src/tools/shortcut-handler.js');

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    port: process.env.PORT || 3000
  });

app.message('hello', messageHandler.hello);
// app.message(/.*/, messageHandler.parseAll);

app.command('/switch', slashHandler.switch);
app.command('/a8ksync', slashHandler.a8ksync);
// app.command('/synca8k', slashHandler.synca8k);

app.event("file_shared", eventHandler.fileShared);
app.event("reaction_added", eventHandler.reactionAdded);
app.event("reaction_removed", eventHandler.reactionRemoved);
app.event('pin_added', eventHandler.pinAdded);
app.event('pin_removed', eventHandler.pinRemoved);
app.event('app_home_opened', eventHandler.appHomeOpened);
// app.event('message', eventHandler.message);
// app.event(/.*/, eventHandler.log);

app.shortcut(`show_your_work`, shortcutHandler.showYourWork);
app.shortcut(`send_me_markdown`, shortcutHandler.sendMeMarkdown);
// app.shortcut(/.*/, shortcutHandler.log);

// (/.*/, async ({shortcut, ack, context}) => {
//   await ack();
//   console.log(JSON.stringify(shortcut, null, 4))
//   // Do stuff
// })


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