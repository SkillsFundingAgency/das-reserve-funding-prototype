const express = require('express')
const router = express.Router()

var _myData = {
    "includeValidation": "true",
    "accounts":
    {
        "employer-1": require(__dirname + '/data/employer-1.json')
    },
    "defaultAccountID": "employer-1",
}

// Add your routes here - above the module.exports line

require('./routes/1-0/routes.js')(router,JSON.parse(JSON.stringify(_myData)));

module.exports = router
