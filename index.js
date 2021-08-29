const { Plugin } = require("powercord/entities");
const { getModule, FluxDispatcher } = require("powercord/webpack");
const { clipboard } = require("electron");

const Settings = require("./settings.jsx");

var userId = 0;

module.exports = class ScamDetector extends Plugin {

  async startPlugin() {
    this.getCurrentUser = await getModule(
      ["getCurrentUser"],
      false
    ).getCurrentUser();
    
    userId = this.getCurrentUser.id;

    powercord.api.settings.registerSettings("pc-scamdetector", {
      category: this.entityID,
      label: "Scam Detector",
      render: Settings,
    });

    FluxDispatcher.subscribe("MESSAGE_CREATE",(data) => this.onMessage(data,this.settings));
  }

  pluginWillUnload() {
    FluxDispatcher.unsubscribe("MESSAGE_CREATE", this.onMessage);
    powercord.api.settings.unregisterSettings("pc-scamdetector");
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  async onMessage(data,settings) {
  
    console.log(data)

    const toast = settings.get("toast", true);
    const cache = settings.get("cache", false);

    console.log(toast);

    console.log(userId);
    try {
      var message = data.message.content;
      var authorId = data.message.author.id;
      var messageId = data.message.id;
      var guildId = data.message.guild_id;
      if (
        message.includes("free") &&
        message.includes("nitro") &&
        message.includes("http")
      ) {
        console.log(data);
        if (toast) {
          powercord.api.notices.sendToast(
            "scam-decetector-" + this.getRandomInt(1, 100).toString(),
            {
              header: "Detected a scam url",
              content: 'Click "copy" to copy the content of the message',
              type: "danger",
              buttons: [
                {
                  text: "Copy",
                  color: "green",
                  look: "ghost",
                  onClick: () =>
                    clipboard.write({
                      text: authorId + "|" + message,
                    }),
                },
                {
                  text: "Ignore",
                  color: "grey",
                  look: "outlined",
                },
              ],
            }
          );
        }
        if (cache) {
        }
      }
    } catch (error) {}
  }
};
