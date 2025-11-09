const AWS = require("aws-sdk");
const fs = require("fs");

const REGION = process.env.AWS_REGION || "us-east-1";
const S3_BUCKET = process.env.S3_BUCKET;

if (!S3_BUCKET) {
  console.warn(
    "Warning: S3_BUCKET env var not set. Set S3_BUCKET to your bucket name."
  );
}

AWS.config.update({
  region: REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const accessKeyId = AWS.config.credentials.accessKeyId;
const secretAccessKey = AWS.config.credentials.secretAccessKey;

console.log(accessKeyId, secretAccessKey);

const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();

/**
 * Upload buffer or file to S3 with the given key
 * @param {Buffer} buffer
 * @param {string} key
 * @param {string} contentType
 */
async function uploadToS3(buffer, key, contentType = "image/jpg") {
  const params = {
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  };
  return s3.putObject(params).promise();
}

/**
 * Get object from S3 as Buffer
 * @param {string} key
 * @returns {Buffer}
 */
async function getObjectFromS3(key) {
  const params = { Bucket: S3_BUCKET, Key: key };
  const data = await s3.getObject(params).promise();
  return data.Body; // Buffer
}

/**
 * Compare two images (bytes) using Rekognition
 * @param {Buffer} sourceImageBytes - reference image bytes
 * @param {Buffer} targetImageBytes - image to compare
 * @param {number} similarityThreshold
 */
async function compareFaces(
  sourceImageBytes,
  targetImageBytes,
  similarityThreshold = 70
) {
  const params = {
    SourceImage: { Bytes: sourceImageBytes },
    TargetImage: { Bytes: targetImageBytes },
    SimilarityThreshold: similarityThreshold,
  };
  const res = await rekognition.compareFaces(params).promise();
  return res;
}

module.exports = {
  uploadToS3,
  getObjectFromS3,
  compareFaces,
  S3_BUCKET,
  s3,
  rekognition,
};
