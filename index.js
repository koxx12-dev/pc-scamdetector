const { Plugin } = require("powercord/entities");
const { getModule, FluxDispatcher } = require("powercord/webpack");
const { clipboard } = require("electron");

const Settings = require("./settings.jsx");

const currUser = getModule(["getCurrentUser"], false).getCurrentUser;
const toasts;
const cache;

module.exports = class ScamDetector extends Plugin {

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }
  
  onMessage(data) {

    console.log(toasts);

    console.log(currUser.id);
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
        console.log(data)
        if (toasts) {
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

  startPlugin() {
    toasts = this.settings.get("toast", true);
    cache = this.settings.get("cache", false);

    powercord.api.settings.registerSettings("pc-scamdetector", {
      category: this.entityID,
      label: "Scam Detector",
      render: Settings,
    });

    FluxDispatcher.subscribe('MESSAGE_CREATE', this.onMessage)
  }

  pluginWillUnload() {
    FluxDispatcher.unsubscribe('MESSAGE_CREATE', this.onMessage)
    powercord.api.settings.unregisterSettings("pc-scamdetector");
  }
};
