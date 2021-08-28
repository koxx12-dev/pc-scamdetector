const { Plugin } = require("powercord/entities");
const { FluxDispatcher } = require("powercord/webpack");
const { clipboard } = require("electron");

module.exports = class ScamDetector extends Plugin {

  onMessage(data) {
    try {
      var message = data.message.content;
      var authorId = data.message.author.id;
      if (
        message.includes("free") &&
        message.includes("nitro") &&
        message.includes("http")
      ) {
        powercord.api.notices.sendToast("scam-decetector", {
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
                  text: authorId+"|"+message,
                }),
            },
            {
              text: "Ignore",
              color: "grey",
              look: "outlined",
            },
          ],
        });
      }
    } catch (error) {}
  }

  startPlugin() {
    FluxDispatcher.subscribe('MESSAGE_CREATE', this.onMessage)
  }

  pluginWillUnload() {
    FluxDispatcher.unsubscribe('MESSAGE_CREATE', this.onMessage)
  }
};
