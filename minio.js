require('dotenv').config();
const { S3_ENDPOINT: endPoint, S3_ACCESSKEY: accessKey, S3_SECRETKEY: secretKey } = process.env;
const Minio = require('minio');
const fs = require('fs');

const minioClient = new Minio.Client({
  endPoint,
  accessKey,
  secretKey,
});

const fPut = async (bucket, object, filePath) => {
  return await minioClient.fPutObject(bucket, object, filePath);
};
