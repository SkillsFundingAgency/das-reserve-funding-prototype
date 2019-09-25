const express = require('express')
const router = express.Router()

// Base session data
var _myData = {
    "includeValidation": "true",
    "accounts":
    {
        "emp-1": require(__dirname + '/data/emp-1.json')
    },
    "defaultEmpAccount": "emp-1",
    "defaultProAccount": "pro-1",
    "defaultAccountID": "emp-1",
    "defaultType": "emp",
    "courses": require(__dirname + '/data/courses.json'),
    "startDates": [
        {
            "id": "aug2019",
            "name": "August 2019",
            "range": "Aug 2019 to Oct 2019"
        },
        {
            "id": "sep2019",
            "name": "September 2019",
            "range": "Sep 2019 to Nov 2019"
        },
        {
            "id": "oct2019",
            "name": "October 2019",
            "range": "Oct 2019 to Dec 2019"
        }
    ]
}

require('./routes/14-0/routes.js')(router,JSON.parse(JSON.stringify(_myData)));

module.exports = router
