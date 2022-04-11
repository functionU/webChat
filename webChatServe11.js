const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server, Socket } = require("socket.io");
const { json } = require("express");
const io = new Server(server, { cors: true });
const fs = require("fs");
let bodyParser = require("body-parser");
let socketArray = [];
let socketIdArray = [];

app.use(bodyParser.json({ limit: "5000mb" }));
app.use(bodyParser.urlencoded({ limit: "5000mb", extended: true }));
app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Max-Age": 1728000,
    "Access-Control-Allow-Origin": req.headers.origin || "*",
    "Access-Control-Allow-Headers": "X-Requested-With,Content-Type",
    "Access-Control-Allow-Methods": "PUT,POST,GET,DELETE,OPTIONS",
  });
  req.method === "OPTIONS" ? res.status(204).end() : next();
});
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/public/", express.static("./public/"));
app.use("/img/", express.static("./img/"));
app.engine("html", require("express-art-template"));

io.on("connection", (socket) => {
  socketArray.push(socket);
  let mysocket;
  socket.on("loginServe", (data) => {
    data.id = socket.id;
    mysocket = data;
    socketIdArray.push(mysocket);
    socket.emit("logined", socket.id);
    io.emit("userNumber", socketIdArray);
  });
  socket.on("message", (data) => {
    socket.emit("message", data);
    socketArray.map((item) => {
      if (item.id == data.to) {
        item.emit("message", data);
      }
    });
    // socket.broadcast.emit("message", data);
    // socket.emit("message", data);
  });
  socket.on("disconnect", () => {
    let index = socketIdArray.indexOf(mysocket);
    socketIdArray.splice(index, 1);
    io.emit("logined", socketIdArray);
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
app.get("/", function (req, res) {
  res.render("index.html");
});
app.post("/file", (req, res) => {
  console.log(req.body);
  let buffer = Buffer.from(req.body.file);
  console.log(buffer);
  // let content = [...req.body.file];
  // var buf = new ArrayBuffer(req.body.file * 2);
  // content.map((item, index) => {
  //   buf[index] = item.charCodeAt();
  // });
  // console.log(buf[0]);

  let fileName = "uploads/" + req.body.name;
  fs.writeFileSync(fileName, buffer, function () {
    console.log("fineshed");
  });
  fs.readdir("uploads/", function (err, data) {
    res.send(data);
  });
});
