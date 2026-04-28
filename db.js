const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "webhooks/events/eventLog.json");

if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");

function readLog() {
  return JSON.parse(fs.readFileSync(file));
}

module.exports = {
  logEvent(event) {
    const logs = readLog();
    logs.push(event);
    fs.writeFileSync(file, JSON.stringify(logs, null, 2));
  },
  getEvents() {
    return readLog().reverse();
  },
  getStats() {
    const events = readLog();
    const perProvider = {};
    for (const e of events) perProvider[e.provider] = (perProvider[e.provider] || 0) + 1;
    const now = Date.now();
    const perMinute = events.filter(e => now - e.timestamp <= 60000).length;
    return { perProvider, perMinute };
  }
};