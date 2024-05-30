const express = require("express");
const { google } = require("googleapis");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");

const app = express();

const storage = multer.diskStorage({
  destination: "uploads",
  filename: function (req, file, cb) {
    const extension = file.originalname.split(".").pop();
    cb(null, `${file.fieldname}-${Date.now()}.${extension}`);
  },
});

const upload = multer({ storage: storage });

app.use(cors());

const auth = new google.auth.GoogleAuth({
  keyFile: "key.json",
  scopes: [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.metadata",
    "https://www.googleapis.com/auth/drive.appdata",
    "https://www.googleapis.com/auth/drive.scripts",
  ],
});

const drive = google.drive({ version: "v3", auth });

const PARENT_FOLDER_ID = "1OjHoLAGOiqF4r8m7ZXMSxuUp_OFFsDNK"

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/upload", upload.array("files"), async (req, res) => {
  try {
    const uploadedFiles = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      const response = await drive.files.create({
        requestBody: {
          name: file.originalname,
          mimeType: file.mimetype,
          parents: [PARENT_FOLDER_ID],
          includePermissionsForView: "published",
        },
        media: {
          body: fs.createReadStream(file.path),
        },
      });

      uploadedFiles.push(response.data);
    }

    res.json({ files: uploadedFiles });

    for (let i = 0; i < req.files.length; i++) {
      fs.unlink(req.files[i].path, (err) => {
        console.log("File deleted:", req.files[i].path);
        if (err) {
          console.error("Error deleting file:", err);
        }
      });
    }
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/files", async (req, res) => {
  try {
    const response = await drive.files.list({
      q: `'${PARENT_FOLDER_ID}' in parents`,
      fields: "files(id, name, mimeType, size, createdTime)",
    });

    res.json({ files: response.data.files });
  } catch (error) {
    console.error("Error retrieving files:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(5000, () => {
  console.log("App is running on port 5000");
});
