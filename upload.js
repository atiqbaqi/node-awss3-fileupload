const AWS = require('aws-sdk');
const express = require('express');
const app = express();
const path = require("path");
//const fs = require('fs');
const multer = require('multer'); 

const MIME_TYPES = ["image/png", "image/jpg", "image/jpeg"]; // add "application/pdf" for pdf files
const MAX_SIZE = 1024 * 1024 * 5;//6MB
const upload = multer({
  limits: {fileSize: MAX_SIZE},
  fileFilter: (req, file, cb) => {
    if (MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        // req.body[file.fieldname] = file.originalname
        req.upload_error = true;
        cb(new Error("Only .png, .jpg, or .jpeg format allowed!"));
    }
}, 
});
require('dotenv').config();

const app_port = process.env.APP_PORT || 8080;

app.post('/upload', upload.single('image'), (req, res) => {
  // Read the image file from the request
  const file = req.file;

  // File name formatting to avoid duplicate file name issues
  const fileExt = path.extname(file.originalname);
  const fileName = Date.now()+fileExt;
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
    Key: `uploads/${fileName}`,
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
      console.log(data.Location);
      res.send(data.Location);
    }
  });
});

app.listen(app_port, ()=>{
    console.group();
    console.log('\x1b[42m','app listening to: '+app_port,'\x1b[0m');
    console.groupEnd();
});



