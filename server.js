/*********************************************************************************

WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Steven Ly
Student ID: 101444214
Date: October 07 2024
Glitch Web App URL: https://stevenlyweb322-assignment3.glitch.me
GitHub Repository URL: https://github.com/lysteven/web322-app

********************************************************************************/ 


var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var storeservice = require("./store-service");
var app = express();
const path = require('path');

app.use(express.static('public'));
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifer = require('streamifier');
const upload = multer();

cloudinary.config({
    cloud_name: 'djjdy3gyf',
    api_key: '915157472213428',
    api_secret: 'A0kol7FdiyFNSz9btX_m4gp9VIQ',
    secure: true
});
function onHttpStart () {
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.get("/", (req,res) => {
    res.redirect('/about');
});

app.get("/about", (req,res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));
});

app.post("/items/add", upload.single('featureImage'), (req, res) => {
    
if(req.file){
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }

    upload(req).then((uploaded)=>{
        processItem(uploaded.url);
    });
}else{
    processItem("");
}
 
function processItem(imageUrl){
    req.body.featureImage = imageUrl;

    // TODO: Process the req.body and add it as a new Item before redirecting to /items
} 

})
app.get("/shop", (req, res) => {
        storeservice.getPublishedItems().then((items) => {
            const publishedItems = items.filter(item => item.published);
            res.json(publishedItems);
        }).catch((err) => {
            res.json({ message: err });
        });
    });

app.get("/items", (req, res) => {
    storeservice.getAllitemss().then((items) => {
        res.json(items);
    }).catch((err) => {
        res.json( {message: err});
    });
});

app.get("/items/add", (req, res) => {
    res.sendFile(path.join(__dirname, '/views/addItem.html'));
});

app.get("/categories", (req, res) => {
    storeservice.getCategories().then((categories) => {
        res.json(categories);   
    }).catch((err) => {
        res.json( {message: err});
    });
});

app.get("*", (req, res) => {
    res.send("Page Not Found", 404);
});

storeservice.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart);
}).catch((err) => {
    console.log(err);
});