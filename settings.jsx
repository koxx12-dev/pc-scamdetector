const { React } = require("powercord/webpack");
const { SwitchItem } = require("powercord/components/settings");

module.exports = ({ getSetting, updateSetting, toggleSetting }) => (
  <div>
    <SwitchItem
      note="Whether the popup is showed"
      value={getSetting("toast", true)}
      onChange={() => toggleSetting("toast")}
    >
      Scam url popup
    </SwitchItem>
    <SwitchItem
      note="Saves scam messages to a json file to plugin directory (will cause issues with powercord update system)"
      value={getSetting("cache", false)}
      onChange={() => toggleSetting("cache")}
    >
      Cache url
    </SwitchItem>
  </div>
);
