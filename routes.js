const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const request = require('request');

const user = require('./mongo/user.js');

const _path = __dirname + '/views/';
const _path_login = _path + 'login.html';
const _path_dashboard = _path + 'dashboard.html';
const _path_profile = _path + 'profile.html';
const _path_reports = _path + 'reports.html';
const _path_expenses = _path + 'expenses.html';

createUser('bobross', 'bobross@gmail.com', 'thepainter', true, 'Bob', 'Ross');

router.post('/login', function (req, res, next) {
    if (req.body.email && req.body.password) {
        user.authenticate(req.body.email, req.body.password, function (err, userLog) {
            console.log(err);
            console.log(userLog);
            if (err || !userLog) {
                req.session.retry = true;
                res.redirect('/');
            } else {
                console.log('AUTH : User [%s] authenticated successfully', userLog.username);
                console.log(userLog._id);
                req.session.userId = userLog._id;
                res.redirect('/dashboard');
            }
        });
    } else {
        res.send('Email or password missing.');
    }
});

router.get('/logout', function (req, res, next) {
    if (req.session) {
        console.log('AUTH : Session ID [%s] logging out', req.session.userId);
        req.session.destroy(function (err) {
            if (err) {
                console.error('|- FATAL DB ERROR');
            } else {
                console.log('|- Log out successful');
                res.redirect('/');
            }
        })
    }
});

router.get('/', (req, res, next) => {
    authenticate(req.session.userId, (err, accType) => {
        if (!err) {
            if (accType != null) { // fix depending on user
                res.redirect('/dashboard')
            } else {
                res.sendFile(_path_login);
            }
        } else {
            res.send('Internal Server Error');
        }
    });
});

router.get('/dashboard', (req, res) => {
    authenticate(req.session.userId, (err, accType) => {
        if (!err) {
            if (accType != null) { // fix depending on user
                res.sendFile(_path_dashboard);
            } else {
                console.log('AUTH : User unauthorized');
                res.redirect('/');
            }
        } else {
            res.send('Internal Server Error');
        }
    });
});

router.get('/profile', (req, res) => {
    authenticate(req.session.userId, (err, accType) => {
        if (!err) {
            if (accType != null) { // fix depending on user
                res.sendFile(_path_profile);
            } else {
                console.log('AUTH : User unauthorized');
                res.redirect('/');
            }
        } else {
            res.send('Internal Server Error');
        }
    });
});

router.get('/reports', (req, res) => {
    authenticate(req.session.userId, (err, accType) => {
        if (!err) {
            if (accType != null) { // fix depending on user
                res.sendFile(_path_reports);
            } else {
                console.log('AUTH : User unauthorized');
                res.redirect('/');
            }
        } else {
            res.send('Internal Server Error');
        }
    });
});

router.get('/expenses', (req, res) => {
    authenticate(req.session.userId, (err, accType) => {
        if (!err) {
            if (accType != null) { // fix depending on user
                res.sendFile(_path_expenses);
            } else {
                console.log('AUTH : User unauthorized');
                res.redirect('/');
            }
        } else {
            res.send('Internal Server Error');
        }
    });
});

function authenticate(userId, callback) {
    user.findById(userId).exec(function (error, userLog) {
        if (error) {
            console.log('AUTH : Error searching for userId [%s]', userId);
            callback(null);
        } else {
            if (userLog === null) {
                callback(null);
            } else {
                console.log('AUTH : user [%s] authorized', userLog.username);
                callback(null, userLog.accountType);
            }
        }
    });
    return null;
}

function createUser(username, email, password, accountType, name_first, name_last) {
    const now = Date.now();

    var purchaseHistory = [];

    var purchaseTypeList = ['Income', 'Food', 'Entertainment', 'Rent', 'Utilities', 'Savings', 'Personal'];

    for (var i = 0; i < 7; i++) {
        purchaseHistory[i] = {
            description: 'Autogenerated Description',
            cost: getRandomInt(100),
            purchaseType: purchaseTypeList[i % 7],
            datePurchased: now + i * 10,
            dateCreated: now,
        }
    };

    const userThing = {
        username: username,
        email: email,
        password: password,
        accountType: accountType,
        name_first: name_first,
        name_last: name_last,
        dateCreated: now,
        account: {
            balance: 1.23,
            purchaseTypeList: purchaseTypeList, // Default
            purchaseHistory: purchaseHistory,
        }
    };

    user.create(userThing, function (err, userAcc) {
        if (err) {
            console.log(err)
        } else {
            console.log('MONGODB : User [%s] created', username);
            console.log(userAcc.name_first);
        }
    });
}

// API

router.get('/data/expenses', (req, res) => {
    authenticate(req.session.userId, (err, accType) => {
        if (!err) {
            if (accType != null) {
                getDataExpenses(req.session.userId, function (data) {
                    res.send(data);
                });
            } else {
                console.log('AUTH : User unauthorized');
                res.redirect('/');
            }
        } else {
            res.send('Internal Server Error');
        }
    });
});

router.get('/data/expenses_pi', (req, res) => {
    authenticate(req.session.userId, (err, accType) => {
        if (!err) {
            if (accType != null) {
                getDataExpensesPi(req.session.userId, function (data) {
                    res.send(data);
                });
            } else {
                console.log('AUTH : User unauthorized');
                res.redirect('/');
            }
        } else {
            res.send('Internal Server Error');
        }
    });
});

router.get('/data/expenses_table', (req, res) => {
    authenticate(req.session.userId, (err, accType) => {
        if (!err) {
            if (accType != null) {
                getDataExpensesTable(req.session.userId, function (data) {
                    res.send(data);
                });
            } else {
                console.log('AUTH : User unauthorized');
                res.redirect('/');
            }
        } else {
            res.send('Internal Server Error');
        }
    });
});

router.get('/data/expenses_mandatory', (req, res) => {
    authenticate(req.session.userId, (err, accType) => {
        if (!err) {
            if (accType != null) {
                getDataExpensesMandatory(req.session.userId, function (data) {
                    res.send(data);
                });
            } else {
                console.log('AUTH : User unauthorized');
                res.redirect('/');
            }
        } else {
            res.send('Internal Server Error');
        }
    });
});

router.get('/data/expenses_nonmandatory', (req, res) => {
    authenticate(req.session.userId, (err, accType) => {
        if (!err) {
            if (accType != null) {
                getDataExpensesNonMandatory(req.session.userId, function (data) {
                    res.send(data);
                });
            } else {
                console.log('AUTH : User unauthorized');
                res.redirect('/');
            }
        } else {
            res.send('Internal Server Error');
        }
    });
});

router.get('/data/purchase_type', (req, res) => {
    authenticate(req.session.userId, (err, accType) => {
        if (!err) {
            if (accType != null) {
                getPurchaseType(req.session.userId, function (data) {
                    res.send(data);
                });
            } else {
                console.log('AUTH : User unauthorized');
                res.redirect('/');
            }
        } else {
            res.send('Internal Server Error');
        }
    });
});

router.get('/data/categories_table', (req, res) => {
    authenticate(req.session.userId, (err, accType) => {
        if (!err) {
            if (accType != null) {
                getDataCategoriesTable(req.session.userId, function (data) {
                    res.send(data);
                });
            } else {
                console.log('AUTH : User unauthorized');
                res.redirect('/');
            }
        } else {
            res.send('Internal Server Error');
        }
    });
});

router.post('/post/categories_table', (req, res) => {
    authenticate(req.session.userId, (err, accType) => {
        if (!err) {
            if (accType != null) {
                setDataCategoriesTable(req.session.userId, req.body, function () {
                    res.redirect('/profile');
                });
            } else {
                console.log('AUTH : User unauthorized');
                res.redirect('/');
            }
        } else {
            res.send('Internal Server Error');
        }
    });
});

router.post('/post/expense_new', (req, res) => {
    authenticate(req.session.userId, (err, accType) => {
        if (!err) {
            if (accType != null) {
                createExpense(req.session.userId, req.body, function () {
                    res.redirect('/expenses');
                });
            } else {
                console.log('AUTH : User unauthorized');
                res.redirect('/');
            }
        } else {
            res.send('Internal Server Error');
        }
    });
});

router.post('/post/expense_delete', (req, res) => {
    authenticate(req.session.userId, (err, accType) => {
        if (!err) {
            if (accType != null) {
                deleteExpense(req.session.userId, req.body, function () {
                    res.redirect('/expenses');
                });
            } else {
                console.log('AUTH : User unauthorized');
                res.redirect('/');
            }
        } else {
            res.send('Internal Server Error');
        }
    });
});

function getDataExpenses(userId, callback) {
    user.findById(userId).exec(function (error, userLog) {
        if (error) {
            console.log('AUTH : Error searching for userId [%s]', userId);
            callback(null);
        } else {
            if (userLog === null) {
                callback(null);
            } else {
                var out = [];

                for (var i = 0; i < userLog.account.purchaseHistory.length; i++) {
                    var item = userLog.account.purchaseHistory[i];

                    out[i] = [item.datePurchased, item.cost];
                }

                callback(out);
            }
        }
    });
}

function getDataExpensesPi(userId, callback) {
    user.findById(userId).exec(function (error, userLog) {
        if (error) {
            console.log('AUTH : Error searching for userId [%s]', userId);
            callback(null);
        } else {
            if (userLog === null) {
                callback(null);
            } else {
                var out = [];
                var outT = [];

                var total = 0;

                for (var i = 0; i < userLog.account.purchaseHistory.length; i++) {

                    var item = userLog.account.purchaseHistory[i];

                    if (outT[item.purchaseType] != null) {
                        outT[item.purchaseType].cost += item.cost;
                    } else {
                        outT[item.purchaseType] = {
                            cost: item.cost,
                        }
                    }

                    total += item.cost;

                }
                var index = 0;

                for (var thing in outT) {
                    out[index] = {
                        name: thing,
                        y: outT[thing].cost * 100.00 / total,
                    };
                    index++;
                }

                console.log(out);

                callback(out);
            }
        }
    });
}

function getDataExpensesTable(userId, callback) {
    user.findById(userId).exec(function (error, userLog) {
        if (error) {
            console.log('AUTH : Error searching for userId [%s]', userId);
            callback(null);
        } else {
            if (userLog === null) {
                callback(null);
            } else {
                var out = [];

                var data = userLog.account.purchaseHistory;

                for (var i = 0; i < data.length; i++) {
                    out[i] = {
                        description: data[i].description,
                        cost: data[i].cost,
                        purchaseType: data[i].purchaseType,
                        datePurchased: data[i].datePurchased
                    }
                }

                callback(out);
            }
        }
    });
}

function getDataExpensesMandatory(userId, callback) {
    user.findById(userId).exec(function (error, userLog) {
        if (error) {
            console.log('AUTH : Error searching for userId [%s]', userId);
            callback(null);
        } else {
            if (userLog === null) {
                callback(null);
            } else {
                var out = [];
                var outT = [];

                var total = 0;

                for (var i = 0; i < userLog.account.purchaseHistory.length; i++) {

                    var item = userLog.account.purchaseHistory[i];

                    var mandatory = false;

                    for (var a = 0; a < 7; a++) {
                        if (item.purchaseType === userLog.account.purchaseTypeList[a]) {
                            mandatory = true;
                        }
                    }

                    if (mandatory) {
                        if (outT[item.purchaseType] != null) {
                            outT[item.purchaseType].cost += item.cost;
                        } else {
                            outT[item.purchaseType] = {
                                cost: item.cost,
                            }
                        }

                        total += item.cost;
                    }
                }

                var index = 0;

                for (var thing in outT) {
                    out[index] = {
                        name: thing,
                        y: outT[thing].cost * 100.00 / total,
                    };
                    index++;
                }

                callback(out);
            }
        }
    });
}

function getDataExpensesNonMandatory(userId, callback) {
    user.findById(userId).exec(function (error, userLog) {
        if (error) {
            console.log('AUTH : Error searching for userId [%s]', userId);
            callback(null);
        } else {
            if (userLog === null) {
                callback(null);
            } else {
                var out = [];
                var outT = [];

                var total = 0;

                for (var i = 0; i < userLog.account.purchaseHistory.length; i++) {

                    var item = userLog.account.purchaseHistory[i];

                    var mandatory = false;

                    for (var a = 0; a < 7; a++) {
                        if (item.purchaseType === userLog.account.purchaseTypeList[a]) {
                            mandatory = true;
                        }
                    }

                    if (!mandatory) {
                        if (outT[item.purchaseType] != null) {
                            outT[item.purchaseType].cost += item.cost;
                        } else {
                            outT[item.purchaseType] = {
                                cost: item.cost,
                            }
                        }

                        total += item.cost;
                    }
                }

                var index = 0;

                for (var thing in outT) {
                    out[index] = {
                        name: thing,
                        y: outT[thing].cost * 100.00 / total,
                    };
                    index++;
                }

                callback(out);
            }
        }
    });
}

function getDataCategoriesTable(userId, callback) {
    user.findById(userId).exec(function (error, userLog) {
        if (error) {
            console.log('AUTH : Error searching for userId [%s]', userId);
            callback(null);
        } else {
            if (userLog === null) {
                callback(null);
            } else {
                var out = [];

                for (var i = 7; i < userLog.account.purchaseTypeList.length; i++) { // 7 hc
                    out[out.length] = {
                        category: userLog.account.purchaseTypeList[i],
                        value: '',
                    }
                }

                console.log(out);
                callback(out);
            }
        }
    });
}

function getPurchaseType(userId, callback) {
    user.findById(userId).exec(function (error, userLog) {
        if (error) {
            console.log('AUTH : Error searching for userId [%s]', userId);
            callback(null);
        } else {
            if (userLog === null) {
                callback(null);
            } else {
                callback(userLog.account.purchaseTypeList);
            }
        }
    });
}

function setDataCategoriesTable(userId, body, callback) {
    user.findById(userId).exec(function (error, userLog) {
        if (error) {
            console.log('AUTH : Error searching for userId [%s]', userId);
            callback(null);
        } else {
            if (userLog === null) {
                callback(null);
            } else {
                for (var i = 0; i < body.length; i++) {

                    var dup = false;

                    for (var a = 0; a < userLog.account.purchaseTypeList.length; a++) {
                        if (userLog.account.purchaseTypeList[a] === body[i].category) {
                            console.log('found dup');
                            dup = true;
                        }
                    }

                    if (!dup) {
                        userLog.account.purchaseTypeList.push(body[i].category);
                    }

                    var cost = body[i].value;

                    if (cost === '') {
                        cost = 0;
                    }

                    var d = Date.now();

                    var thing = {
                        description: 'Autogenerated description.',
                        cost: cost,
                        purchaseType: body[i].category,
                        datePurchased: d,
                        dateCreated: d,
                    };

                    userLog.account.purchaseHistory.push(thing);
                }

                userLog.save();

                callback();
            }
        }
    });
}

function createExpense(userId, body, callback) {
    user.findById(userId).exec(function (error, userLog) {
        if (error) {
            console.log('AUTH : Error searching for userId [%s]', userId);
            callback(null);
        } else {
            if (userLog === null) {
                callback(null);
            } else {
                var data = {
                    description: body.description,
                    cost: body.cost,
                    purchaseType: body.purchaseType,
                    datePurchased: body.datePurchased,
                    dateCreated: Date.now(),
                };

                userLog.account.purchaseHistory.push(data);
                userLog.save();
                callback();
            }
        }
    });
}

function deleteExpense(userId, body, callback) {
    user.findById(userId).exec(function (error, userLog) {
        if (error) {
            console.log('AUTH : Error searching for userId [%s]', userId);
            callback(null);
        } else {
            if (userLog === null) {
                callback(null);
            } else {
                console.log(body);

                var found = false;

                userLog.account.purchaseHistory.find(function (element) {
                    if (element != null && !found) {
                        if (element.purchaseType === body[0] && element.description === body[1]) {
                            console.log('this');
                            console.log(element);
                            userLog.account.purchaseHistory.pull({_id: element._id});
                            userLog.save().then(function () {
                                found = true;
                                callback();
                            });
                        }
                    }
                });
            }
        }
    });
}


// 5c5f6dbb0f23d0505c125942

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

router.get('*', (req, res) => {
    res.redirect('/dashboard');
});

module.exports = router;

/*

income
food
entertainment
rent
utility
savings
personal

for each
- budget - double
- expenses to date - double

 */