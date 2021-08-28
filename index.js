const { Plugin } = require("powercord/entities");

module.exports = class ScamDetector extends Plugin {
  startPlugin() {
    powercord.api.commands.registerCommand({
      command: "test",
      description: "test",
      usage: "{c}",
      executor: (args) => {
        powercord.api.notices.sendToast("scam-decetector", {
          header: "Detected a scam url",
          content: "Click copy to copy the content of the message",
          type: "danger",
          buttons: [
            {
              text: "Copy",
              color: "green",
              look: "ghost",
              onClick: () => console.log("Test"),
            },
            {
              text: "Ignore",
              color: "grey",
              look: "outlined",
            },
          ],
        });
      },
    });
  }

  pluginWillUnload() {
    powercord.api.commands.unregisterCommand("test");
  }
};
