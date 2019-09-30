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
        },
        {
            "id": "nov2019",
            "name": "November 2019",
            "range": "Nov 2019 to Jan 2020"
        },
        {
            "id": "dec2019",
            "name": "December 2019",
            "range": "Dec 2019 to Feb 2020"
        },
        {
            "id": "jan2020",
            "name": "January 2020",
            "range": "Jan 2020 to Mar 2020"
        },
        {
            "id": "feb2020",
            "name": "February 2020",
            "range": "Feb 2020 to Apr 2020"
        }
    ]
}

require('./routes/14-0/routes.js')(router,JSON.parse(JSON.stringify(_myData)));

module.exports = router
