/*********************************************************************************

WEB322 – Assignment 04
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Steven Ly
Student ID: 101444214
Date: October 28 2024
Glitch Web App URL: https://stevenlyweb322-assignment3-1.glitch.me
GitHub Repository URL: https://github.com/lysteven/web322-app

********************************************************************************/ 


const express = require('express');
const storeService = require('./store-service');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');  // Import Handlebars directly
const PORT = process.env.PORT || 8080;
const upload = multer();
const app = express();
cloudinary.config({
    cloud_name: 'djjdy3gyf',
    api_key: '915157472213428',
    api_secret: 'A0kol7FdiyFNSz9btX_m4gp9VIQ',
    secure: true
});


app.use(express.static('public'));

app.use(function(req, res, next) { // Middleware function to set local variables for the view template engine (Handlebars) 
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

// Registering helpers for Handlebars view engine (exphbs)
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
        navLink: function(url, options) {
            return '<li class="nav-item"><a ' + 
                   (url == app.locals.activeRoute ? ' class="nav-link active" ' : ' class="nav-link" ') + 
                   'href="' + url + '">' + options.fn(this) + "</a></li>";
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            return (lvalue != rvalue) ? options.inverse(this) : options.fn(this);
        },
        safeHTML: function (context) {
            return new Handlebars.SafeString(context);  // Use SafeString from imported Handlebars
        }
    }
}));

app.set('view engine', '.hbs');
app.set("views", __dirname + "/views");

// Define routes for the app 
app.get("/", (req, res) => {
    res.redirect("/Shop");
});

app.get('/About', (req, res) => { // Define a route for the "/About" endpoint
    res.render('about');
});

app.get('/items/add', (req, res) => { // Define a route for the "/items/add" endpoint
    res.render('addItem');
});

app.get("/Shop", async (req, res) => { // Define a route for the "/Shop" endpoint
    let viewData = {}; // Declare an object to store properties for the view
    try { // Try to obtain items and categories from the store service
        let items = req.query.category ? 
            await storeService.getPublishedItemsByCategory(req.query.category) : 
            await storeService.getPublishedItems();
// Sort items by itemDate in descending order
        items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
        viewData.items = items;
        viewData.item = items[0];
    } catch (err) {
        viewData.message = "no results";
    }
// Obtain the full list of categories
    try {
        viewData.categories = await storeService.getCategories();
    } catch (err) {
        viewData.categoriesMessage = "no results";
    }

    res.render("shop", { data: viewData });
});

app.get('/Shop/:id', async (req, res) => { // Define a route for the "/Shop/:id" endpoint
    // Declare an object to store properties for the view
    let viewData = {};
    try {
        // Obtain the item by "id" and store in viewData
        viewData.item = await storeService.getItemById(req.params.id);
        // If there's a "category" query, filter the returned items by category
        if (req.query.category) {
            viewData.items = await storeService.getPublishedItemsByCategory(req.query.category);
        } else {
            viewData.items = await storeService.getPublishedItems();
        }
        // Sort items by itemDate in descending order
        viewData.items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
        // Obtain the full list of categories
        viewData.categories = await storeService.getCategories();
    } catch (err) {
        console.error(err);
        viewData.message = "No results found";
    }
    // Render the "shop" view with all of the data (viewData)
    res.render('shop', { data: viewData });
});


app.get('/Categories', (req, res) => { // Define a route for the "/Categories" endpoint
    storeService.getCategories()
        .then(data => {
            res.render("categories", { categories: data });
        })
        .catch(() => {
            res.render("categories", { message: "No categories available" });
        });
});

app.get('/item/:value', (req, res) => { // Define a route for the "/item/:value" endpoint
    storeService.getItemById(req.params.value)
        .then(item => res.json(item))
        .catch(err => res.status(404).json({ message: err }));
});

app.get('/Items', (req, res) => { // Define a route for the "/Items" endpoint
    storeService.getAllItems()
        .then(data => {
            res.render('items', { items: data });
        })
        .catch(err => {
            res.render('items', { message: "no results" });
        });
});
app.post('/items/add', upload.single('featureImage'), (req, res) => { // Define a route for the "/items/add" endpoint
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) resolve(result);
                    else reject(error);
                });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            return result;
        }

        upload(req).then(uploaded => processItem(uploaded.url))
            .catch(err => {
                console.error("Cloudinary upload failed:", err);
                res.status(500).send("Image upload failed");
            });
    } else {
        processItem("");
    }

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;
        storeService.addItem(req.body)
            .then(() => res.redirect('/Items'))
            .catch(err => res.status(500).send("Failed to add item"));
    }
});

storeService.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Express http server listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.log('Failed to initialize the store service, Please check the server console.', err);
    });

app.use((req, res) => {
    res.status(404).render("404 - Page Not Found");
});
