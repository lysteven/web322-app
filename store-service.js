const fs = require("fs").promises; // uses fs.promises API for more oganized async/await

let items = [];
let categories = [];


module.exports = { // Export the store service object with methods for data access and manipulation
     initialize: async function() {
        try {
            const itemsData = await fs.readFile('./data/items.json', 'utf8'); // Read the items.json file as a string
            items = JSON.parse(itemsData);
            console.log("Items loaded:", items);
            const categoriesData = await fs.readFile('./data/categories.json', 'utf8');
            categories = JSON.parse(categoriesData);
        } catch (err) {
            throw new Error("Unable to initialize data, please check the server console: " + err.message);
        }
    },

    addItem: async function (itemData) { // Add a new item to the items array and save it to the items.json file 
        try {
            const currentDate = new Date();
            const postDate = currentDate.toISOString().split("T")[0];
            itemData.postDate = postDate;
            
            
            itemData.id = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1; 

            items.push(itemData);

            
            await fs.writeFile("./data/items.json", JSON.stringify(items, null, 2));

            return itemData;
        } catch (err) {
            throw new Error("Error saving the new item, please check the server console: " + err.message);
        }
    },

    getAllItems: async function() { // Get all items from the items array 
        if (items.length === 0) {
            throw new Error("No items available, please check the server console");
        }
        return items;
    },

    getPublishedItems: async function() { // Get all published items from the items array 
        const publishedItems = items.filter(item => item.published === true); // converts the category to a number 
        if (publishedItems.length === 0) {
            throw new Error("No published items found, please check the server console");
        }
        return publishedItems;
    },
    
    getPublishedItemsByCategory: async function(category) {
        return items.filter(item => item.category === Number(category) && item.published === true); // converts the category to a number 
    },
    getCategories: async function() {
        if (categories.length === 0) { // Check if the categories array is empty 
            throw new Error("No categories found, please check the server console");
        }
        return categories;
    },
    getItemsByCategory: async function(category) {
        const filteredItems = items.filter(item => item.category === category); // converts the category to a number 
        if (filteredItems.length === 0) {
            throw new Error(`No items found for category, please check the server console: ${category}`);
        }
        return filteredItems;
    },

    getItemsByMinDate: async function(minDateStr) {
        const filteredItems = items.filter(item => new Date(item.postDate) >= new Date(minDateStr)); // converts the minDateStr to a Date object 
        if (filteredItems.length === 0) {
            throw new Error(`No items found with date after, please cgheck the server console: ${minDateStr}`);
        }
        return filteredItems;
    },

    getItemById: async function(id) {
        const item = items.find(item => item.id === Number(id)); // converts the id to a number 
        if (!item) {
            throw new Error(`No item found with id, please check the server console: ${id}`);
        }
        return item;
    },
};
