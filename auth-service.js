const bcrypt = require('bcryptjs');
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema({
    "userName":  {
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String
});

var loginHistorySchema = new Schema({
    "dateTime": Date,
    "userAgent": String
});

userSchema.add({ loginHistory: [loginHistorySchema] });

let User; // to be defined on new connection (see initialize)

let pass = encodeURIComponent("2NhvOVygYCOP0X1O");

module.exports = {
    initialize: function () {
        return new Promise(function (resolve, reject) {
            let db = mongoose.createConnection(`mongodb+srv://sly24:${pass}@clustersly.gvyseso.mongodb.net/?retryWrites=true&w=majority&appName=Clustersly`);
            db.on('error', (err)=>{
                reject(err); // reject the promise with the provided error
            });
            db.once('open', ()=>{
                User = db.model("users", userSchema);
                resolve();
            });
        });
    },
    registerUser: function (userData) {
        return new Promise((resolve, reject) => {
            if (userData.password !== userData.password2) {
                reject("Passwords do not match");
            } else {
                bcrypt.hash(userData.password, 10).then(hash => {
                    userData.password = hash;
                    let newUser = new User(userData);
                    
                    newUser.save() // No callback, directly handle the promise
                        .then(() => resolve("User registered successfully"))
                        .catch(err => {
                            if (err.code === 11000) {
                                reject("User Name already taken");
                            } else {
                                reject(`There was an error creating the user: ${err}`);
                            }
                        });
                }).catch(() => {
                    reject("There was an error encrypting the password");
                });
            }
        });
    },
    
    checkUser: function (userData) {
        return new Promise(function (resolve, reject) {
            User.find({userName: userData.userName}).exec().then((users) => {
                if (!users.length) {
                    reject(`Unable to find user: ${userData.userName}`);
                }
                else{
                    bcrypt.compare(userData.password, users[0].password).then((result) => {
                        if (!result) {
                            reject(`Incorrect Password for user: ${userData.userName}`);
                        }
                        else {
                            users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                            User.updateOne({userName: userData.userName}, {$set: {
                                    loginHistory: users[0].loginHistory
                                }
                            }).exec().then(() => {
                                resolve(users[0]);
                            }).catch((err) => {
                                reject(`There was an error verifying the user: ${err}`);
                            });
                        }
                    });
                }
            }).catch((err) => {
                reject(`Unable to find user: ${userData.userName}`);
            });
        });
    }
};
