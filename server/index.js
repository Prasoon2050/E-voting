const express = require("express");
const AWS = require("aws-sdk");
const multer = require("multer");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const upload = multer({ dest: "uploads/" });

const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();

// Bucket name
const BUCKET_NAME = "e-vote-blockchain";

// ✅ API: Upload user image and store with userId
app.post("/upload/:userId", upload.single("image"), async (req, res) => {
  const userId = req.params.userId;
  const fileContent = fs.readFileSync(req.file.path);

  const params = {
    Bucket: BUCKET_NAME,
    Key: `${userId}.jpg`, // store with userId
    Body: fileContent,
    ContentType: req.file.mimetype,
  };

  try {
    await s3.putObject(params).promise();
    fs.unlinkSync(req.file.path); // remove local temp file
    res.json({ message: "Image uploaded successfully", userId });
  } catch (err) {
    res.status(500).json({ error: "Error uploading image", details: err });
  }
});

// ✅ API: Compare test image with stored image by userId
app.post("/compare/:userId", upload.single("testImage"), async (req, res) => {
  const userId = req.params.userId;
  const testImageBytes = fs.readFileSync(req.file.path);

  try {
    // Get stored image from S3
    const storedImage = await s3
      .getObject({ Bucket: BUCKET_NAME, Key: `${userId}.jpg` })
      .promise();

    const params = {
      SourceImage: { Bytes: storedImage.Body },
      TargetImage: { Bytes: testImageBytes },
      SimilarityThreshold: 70,
    };

    const response = await rekognition.compareFaces(params).promise();
    fs.unlinkSync(req.file.path); // remove temp test image

    if (response.FaceMatches.length > 0) {
      const match = response.FaceMatches[0];
      res.json({
        matched: true,
        similarity: match.Similarity.toFixed(2) + "%",
      });
    } else {
      res.json({ matched: false, similarity: "0%" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error comparing faces", details: err });
  }
});

// Start server
app.listen(3000, () => console.log("Server running on port 3000"));
