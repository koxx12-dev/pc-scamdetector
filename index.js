const { Plugin } = require("powercord/entities");
const { getModule, FluxDispatcher } = require("powercord/webpack");
const { clipboard } = require("electron");
const path = require("path");
const fs = require("fs");
const request = require("./components/req.js");

const Settings = require("./settings.jsx");

var messageIds = [];

var scams = {};

module.exports = class ScamDetector extends Plugin {

  get(url) {
    return new request("GET",url);
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  async onMessage(data, settings) {
    var userId = await getModule(["getCurrentUser"], false).getCurrentUser().id;

    var ip = null;

    var urlRegex =
      /(https?:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9])(:?\d*)\/?([a-z_\/0-9\-#.]*)\??([a-z_\/0-9\-#=&?%.]*)/i;

    const toast = settings.get("toast", false);
    const cache = settings.get("cache", false);
    const showip = settings.get("showip", true);

    try {

      var message = data.message.content;
      var authorId = data.message.author.id;
      var messageId = data.message.id;
      var guildId = data.message.guild_id;

      if (
        message.includes("free") &&
        message.includes("nitro") &&
        message.includes("http") &&
        !messageIds.includes(messageId) &&
        authorId != userId
      ) {
        messageIds.push(messageId);
        if (showip) {
          var url = urlRegex.exec(message)[0];
          try {
            var req = await this.get(url);
            ip = req.socket.remoteAddress
          } catch (error) {
            ip = undefined
          }
        }
        if (toast) {
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
                    text: showip
                      ? `${authorId}|\`${message}\`|${ip}`
                      : `${authorId}|\`${message}\``,
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
        if (cache) {
          console.log(scams);
          if (!scams.hasOwnProperty(guildId)) {
            scams[guildId] = {};
          }
          if (!scams[guildId].hasOwnProperty(messageId)) {
            scams[guildId][messageId] = showip
              ? {
                  authorId: authorId,
                  message: message,
                  ip: ip,
                }
              : {
                  authorId: authorId,
                  message: message,
                };
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  async FileLoad() {
    var file = path.resolve(__dirname, "scams.json");
    fs.open(file, "r", function (err, fd) {
      if (err) {
        fs.writeFile(file, "{}", function (err) {
          if (err) {
            console.log(err);
          }
        });
      } else {
        fs.readFile(file, "utf8", (err, data) => {
          if (err) {
            console.error(err);
            return;
          }
          scams = JSON.parse(data);
        });
      }
      fs.close(fd, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log("File Closed");
        }
      });
    });
  }

  async FileSave() {
    var file = path.resolve(__dirname, "scams.json");
    fs.writeFile(file, JSON.stringify(scams), function (err) {
      if (err) {
        console.log(err);
      }
    });
  }

  async startPlugin() {
    powercord.api.settings.registerSettings("pc-scamdetector", {
      category: this.entityID,
      label: "Scam Detector",
      render: Settings,
    });

    await this.FileLoad();

    powercord.api.commands.registerCommand({
      command: "savedata",
      description: "Saves scam data to a file",
      usage: "{c}",
      executor: async (args) => {
        await this.FileSave();
        return {
          send: false,
          result: {
            type: "rich",
            title: "Scam Detector",
            description: `Scam data was saved to "${path.resolve(
              __dirname,
              "scams.json"
            )}"`,
          },
        };
      },
    });

    FluxDispatcher.subscribe("MESSAGE_CREATE", (data) =>
      this.onMessage(data, this.settings)
    );
  }

  pluginWillUnload() {
    powercord.api.commands.unregisterCommand("savedata");
    FluxDispatcher.unsubscribe("MESSAGE_CREATE", this.onMessage);
    this.FileSave();
    powercord.api.settings.unregisterSettings("pc-scamdetector");
  }
};
