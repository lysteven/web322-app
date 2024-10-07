const fs = require("fs");

module.exports = {
    items: [],
    categories: [],

    initialize: function () {
        return new Promise((resolve, reject) => {
            fs.readFile('./data/items.json', 'utf8', (itemsErr, itemsData) => {
                if (itemsErr) {
                    reject(itemsErr);
                }
                this.items = JSON.parse(itemsData);
                fs.readFile('./data/categories.json', 'utf8', (categoriesErr, categoriesData) => {
                    if (categoriesErr) {
                        reject(categoriesErr);
                    }
                    this.categories = JSON.parse(categoriesData);
                    resolve(true);
                });
            });
        });
    },
    getAllitemss: function () {
        return new Promise((resolve, reject) => {
            if (!this.items.length) {
                reject("no results returned");
            } else {
                resolve(this.items);
            }
        });
    },
    getPublishedItems: function ()  {
        return new Promise((resolve, reject) => {
            let publishedItems = this.items.filter(q => q.published);
            if (!publishedItems.length) {
                reject("no results returned");
            } else {
                resolve(publishedItems);
            }
        });
    },
    getCategories: function () {
        return new Promise((resolve, reject) => {
            if (!this.categories.length) {
                reject("no results returned");
            } else {
                resolve(this.categories);
            }
        });
    }
}