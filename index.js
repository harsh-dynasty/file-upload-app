require("dotenv").config();
const Grid = require("gridfs-stream");
const mongoose = require("mongoose");
const connection = require("./db");
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.static("public"));
let gfs;
connection();

const conn = mongoose.connection;
conn.once("open", function () {
  gfs = Grid(conn.db, mongoose.mongo);
  // gfs.collection("filesBucket");
});

const upload = require("./middleware/upload");
const gridfs = require("multer-gridfs-storage");
app.post("/file/upload", upload.single("file"), async (req, res) => {
  if (req.file === undefined) return res.send("you must select a file.");
  const fileURL = `http://localhost:8080/file/${req.file.filename}`;
  return res.redirect("/");
});

// media routes
app.get("/files", async (req, res) => {
  gfs.files.find().toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: "No file exist",
      });
    }
    return res.json(files);
  });
});
app.get("/file/:filename", async (req, res) => {
  try {
    const file = await gfs.files.findOne({ filename: req.params.filename });
    const readStream = gfs.createReadStream(file.filename);
    readStream.pipe(res);
  } catch (error) {
    res.send("not found");
  }
});

const port = process.env.PORT || 8080;
app.listen(port, console.log(`Listening on port ${port}...`));

app.get("/", (req, res) => {
  res.redirect("index.html");
});
