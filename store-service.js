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
    getAllitems: function () {
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
    },
    addItem: function (itemData) {
        return new Promise((resolve, reject) => {
            if (itemData.published == undefined) {
                itemData.published = false;
            } else {
                itemData.published = true;
            }
            itemData.id = this.items.length + 1;
            this.items.push(itemData);

            resolve(true);
        });
    },
    getItemsByCategory: function (category) {
        return new Promise((resolve, reject) => {
            let itemsByCategory = this.items.filter(q => q.category == category);
            if (!filtered.length) {
                reject("no results returned");
            } else {
                resolve(filtered);
            }
        });
    },
    getItemsByMinDate: function (minDateStr) {
        return new Promise((resolve, reject) => {
            let filtered = this.items.filter(q => new Date(q.postDate) >=  new Date(minDateStr));{
                console.log("The postDate value is greater than minDateStr")
            }
            if (!filtered.length) {
                reject("no results returned");
            } else {
                resolve(filtered);
            }
        });
    },
    getItemById: function (id) {
        return new Promise((resolve, reject) => {
            let filtered = this.items.find(q => q.id == id);
            if (!filtered) {
                reject("no results returned");
            } else {
                resolve(filtered);
            }
        });
    }
}