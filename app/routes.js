const express = require('express')
const router = express.Router()

var _myData = {
    "includeValidation": "true",
    "accounts":
    {
        "employer-1": require(__dirname + '/data/employer-1.json')
    },
    "defaultAccountID": "employer-1",
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

// Add your routes here - above the module.exports line

require('./routes/1-0/routes.js')(router,JSON.parse(JSON.stringify(_myData)));

module.exports = router
