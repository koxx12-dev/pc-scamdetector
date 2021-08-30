const { React } = require("powercord/webpack");
const { SwitchItem } = require("powercord/components/settings");

module.exports = ({ getSetting, updateSetting, toggleSetting }) => (
  <div>
    <SwitchItem
      note="Whether the popup is showed"
      value={getSetting("toast", false)}
      onChange={() => toggleSetting("toast")}
    >
      Scam url popup (sometiems buggy)
    </SwitchItem>
    <SwitchItem
      note="Saves scam messages to a json file in plugin directory"
      value={getSetting("cache", false)}
      onChange={() => toggleSetting("cache")}
    >
      Cache data
    </SwitchItem>
  </div>
);
