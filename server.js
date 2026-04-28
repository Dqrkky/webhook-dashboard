const express = require("express");
const bodyParser = require("body-parser");
const webhookRouter = require("./webhooks/router");
const db = require("./db");
const WebSocket = require("ws");
const auth = require("./auth");

const app = express();

// Slack & Discord need raw body
//app.use((req,res,next)=>{
//  let data="";
//  req.on("data",chunk=>data+=chunk);
//  req.on("end",()=>{req.rawBody=data;next();});
//});

app.use(express.json());

// Auth login
app.post("/login", auth.login);

// Webhook route
app.post("/webhook/:provider", webhookRouter);

// Dashboard endpoints
app.get("/dashboard/events", auth.verify, (req,res)=>res.json(db.getEvents()));
app.get("/dashboard/stats", auth.verify, (req,res)=>res.json(db.getStats()));

// WebSocket
const wss = new WebSocket.Server({ noServer:true });

function broadcast(event) {
  wss.clients.forEach(c=>{
    if(c.readyState===WebSocket.OPEN) c.send(JSON.stringify(event));
  });
}

// Hook db logger
// const originalLog=db.logEvent;
// db.logEvent = async(event) => {
//   await originalLog(event);
//   broadcast(event);
// };

function withBroadcast(original) {
  return async (event) => {
    await original(event);
    broadcast(event);
  };
}

db.logEvent = withBroadcast(db.logEvent);

const server = app.listen(3000,()=>console.log("Server running on http://localhost:3000"));
server.on("upgrade", (req, socket, head) => {
  if(req.url==="/ws") wss.handleUpgrade(req, socket, head, ws =>
    wss.emit("connection", ws, req)
  );
});
