const AWS = require('aws-sdk');
const express = require('express');
const app = express();
//const fs = require('fs');
const multer = require('multer'); 
const upload = multer();
require('dotenv').config();

const app_port = process.env.APP_PORT || 8080;

app.post('/upload', upload.single('image'), (req, res) => {
  // Read the image file from the request
  const file = req.file;
  //fs.writeFileSync(`tmp/${file.originalname}`, file.buffer); // save the image in tmp folder
  // Configure the AWS S3 client
  const s3 = new AWS.S3({
    //region: process.env.AWS_S3_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });

  // Set the parameters for the S3 upload
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `uploads/${file.originalname}`,
    Body: file.buffer,
    //ACL (Access Control List) is a predefined policy in Amazon S3 (Simple Storage Service) that allows any user to read an object in a bucket.
    ACL: 'public-read',
  };

  // Upload the image to S3
  s3.upload(params, (error, data) => {
    if (error) {
      // Handle the error
      res.status(500).send(error);
    } else {
      // Return the URL of the uploaded image
      res.send(data.Location);
    }
  });
});

app.listen(app_port, ()=>{
    console.group();
    console.log('\x1b[42m','app listening to: '+app_port,'\x1b[0m');
    console.groupEnd();
});



