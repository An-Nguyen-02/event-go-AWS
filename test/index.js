const fs = require('fs')
const originalBinaryData = fs.readFileSync('jpeg-home.jpeg');
const originalBase64EncodedData = Buffer.from(originalBinaryData).toString('base64');

// Upload the base64-encoded data to S3

// Retrieve the base64-encoded data from S3
const originalBinaryData1 = fs.readFileSync('test.jpg');
const retrievedBase64EncodedData = Buffer.from(originalBinaryData1).toString('base64');

// Decode the retrieved base64-encoded data

// Compare the original binary data with the decoded binary data
const isDataEqual = originalBinaryData.equals(originalBinaryData1);
console.log(retrievedBase64EncodedData);