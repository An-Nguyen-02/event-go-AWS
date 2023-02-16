var AWS = require('aws-sdk');

const { buildResponse } = require("./postgres")

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const secretKey = process.env.SECRET_KEY
const accessKey = process.env.ACCESS_KEY

const s3 = new AWS.S3({
  region,
  accessKeyId: accessKey,
  secretAccessKey: secretKey
})


async function uploadFile(file, fileType, key) {
  var params = {
    Bucket: bucketName,
    Key: key,
    Body: file,
    ContentType: fileType
  };

  try {
    await s3.upload(params).promise();
    return buildResponse(200, "Image uploaded successfully")
  } catch (err) {
    return buildResponse(500, `Error uploading file: ${err}`)
  }
}

async function deleteFile(fileName, id) {
  var params = {
    Bucket: bucketName,
    Key: fileName
  };

  try {
    await s3.deleteObject(params).promise();
    if (typeof id === "number"){

      return buildResponse(200, `Successfully delete ${fileName} of event ${id} `)
    }
    return buildResponse(200, `Successfully delete ${fileName} of organizer ${id}`)
  } catch (err) {
    return buildResponse(500, `Error deleting event image: ${err}`)
  }
}

async function getSignedUrl(key) {
  var params = {
    Bucket: bucketName,
    Key: key,
    Expires: 86400 // URL will expire in 1 day
  };
  params.Expires = 86400


  try {
    var url = await s3.getSignedUrlPromise('getObject', params);
    return buildResponse(200, url);
  } catch (err) {
    return buildResponse(500, `Error generating signed URL: ${err}`)
  }
}

module.exports = {
    getSignedUrl,
    uploadFile,
    deleteFile
}