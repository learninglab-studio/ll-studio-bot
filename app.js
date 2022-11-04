const { App } = require('@slack/bolt');
require('dotenv').config();
var path = require('path');
global.ROOT_DIR = path.resolve(__dirname);
const llog = require('./src/tools/utilities/ll-logs')

const messageHandler = require('./src/tools/message-handler.js');
const eventHandler = require('./src/tools/event-handler.js');
const slashHandler = require('./src/tools/slash-handler.js');
const shortcutHandler = require('./src/tools/shortcut-handler.js');
const actionHandler = require('./src/tools/action-handler.js');
const everything = /.*/


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
app.command('/macro', slashHandler.macro);
app.command('/atembuttons', slashHandler.atemButtons)
app.command('/log', slashHandler.log);
app.command('/getstills', slashHandler.hundredStills)
app.command('/hub', slashHandler.hub)
// app.command('/synca8k', slashHandler.synca8k);

app.event("file_shared", eventHandler.fileShared);
app.event("reaction_added", eventHandler.reactionAdded);
app.event("reaction_removed", eventHandler.reactionRemoved);
app.event('pin_added', eventHandler.pinAdded);
app.event('pin_removed', eventHandler.pinRemoved);
app.event('app_home_opened', eventHandler.appHomeOpened);
// app.event('message', eventHandler.message);
// app.event(/.*/, eventHandler.log);

app.action(everything, actionHandler.log)
app.action(/atem/, actionHandler.atemButtons)

app.shortcut(`show_your_work`, shortcutHandler.showYourWork);
app.shortcut(`send_me_markdown`, shortcutHandler.sendMeMarkdown);
// app.shortcut(/.*/, shortcutHandler.log);

// app.action( /.*/, actionHandler.log)

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