/*********************************************************************************

WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Steven Ly
Student ID: 101444214
Date: October 07 2024
Cyclic Web App URL: _______________________________________________________
GitHub Repository URL: https://github.com/lysteven/web322-app

********************************************************************************/ 


var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var storeservice = require("./store-service");
var app = express();
const path = require('path');

app.use(express.static('public'));

function onHttpStart () {
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.get("/", (req,res) => {
    res.redirect('/about');
});

app.get("/about", (req,res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));
});


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