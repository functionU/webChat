const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "./uploads" });

const app = express();
app.post("/file", upload.single("file"), (req, res) => {
  console.log("Received a request with file:");
  console.log(req.file);
  res.send({
    code: 200,
    message: "ok",
  });
});
app.listen(3000);
