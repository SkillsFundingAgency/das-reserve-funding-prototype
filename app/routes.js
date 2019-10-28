const express = require('express')
const router = express.Router()

// Base session data
var _myData = {
    "includeValidation": "true",
    "accounts":
    {
        "emp-1": require(__dirname + '/data/emp-1.json'),
        "pro-1": require(__dirname + '/data/pro-1.json')
    },
    "emp": "emp-1",
    "pro": "pro-1",
    "account": "emp-1",
    "type": "emp",
    "courses": require(__dirname + '/data/courses.json'),
    "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
}

require('./routes/14-0/routes.js')(router,JSON.parse(JSON.stringify(_myData)));
require('./routes/15-0/routes.js')(router,JSON.parse(JSON.stringify(_myData)));
require('./routes/16-0/routes.js')(router,JSON.parse(JSON.stringify(_myData)));
require('./routes/17-0/routes.js')(router,JSON.parse(JSON.stringify(_myData)));

module.exports = router
