const retryQueue = [];
const deadLetterQueue = [];
const MAX_ATTEMPTS = 5;

function enqueueRetry(event, handler) {
  retryQueue.push({ event, handler, attempts: 0 });
}

function processQueue() {
  for (let i = retryQueue.length - 1; i >= 0; i--) {
    const item = retryQueue[i];
    if (item.attempts >= MAX_ATTEMPTS) {
      deadLetterQueue.push(item);
      retryQueue.splice(i, 1);
      continue;
    }
    try {
      item.handler(item.event);
      retryQueue.splice(i, 1);
    } catch (err) {
      item.attempts++;
      console.log("Retry failed", item.attempts);
    }
  }
}

setInterval(processQueue, 10000);
module.exports = { enqueueRetry, retryQueue, deadLetterQueue };