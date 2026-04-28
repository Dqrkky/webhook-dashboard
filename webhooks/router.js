const loadProviders = require("./loader");
const providers = loadProviders();
const db = require("../db");
const { enqueueRetry } = require("./queue");

module.exports = async function webhookRouter(req, res) {
  const providerName = req.params.provider;
  const provider = providers[providerName];
  const event = {
    provider: providerName,
    timestamp: Date.now(),
    headers: req.headers,
    payload: req.body
  };
  if (!provider) return res.status(404).json({ error: "Unknown provider" });
  try {
    await provider.handle(req, res);
    await db.logEvent(event);
  } catch (err) {
    enqueueRetry(event, provider.handle);
    res.status(500).json({ error: "Queued for retry" });
  }
};