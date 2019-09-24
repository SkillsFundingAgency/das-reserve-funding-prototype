module.exports = function (router,_myData) {

    var version = "14-0";

    //Random function
    function randomStr(len) { 
        var ans = ''
            arr = 'abcdefghijklimnopqrstuvwxyz'; 
        for (var i = len; i > 0; i--) { 
            ans += arr[Math.floor(Math.random() * arr.length)]; 
        } 
        return ans;
    }

    function resetSession(req){
        req.session.myData = JSON.parse(JSON.stringify(_myData))
        req.session.myData.accountID = req.session.myData.defaultAccountID
    }

    router.all('/' + version + '/*', function (req, res, next) {

        if(!req.session.myData || req.query.resetSession) {
            resetSession(req)
        }
        
        // Reset page validation to false by default. Will only be set to true, if applicable, on a POST of a page
        req.session.myData.validationErrors = {}
        req.session.myData.validationError = "false"
        req.session.myData.includeValidation =  req.query.includeValidation || req.session.myData.includeValidation

        next()
    });

    // Employer home
    router.get('/' + version + '/employer-home', function (req, res) {
        res.render(version + '/employer-home', {
            myData:req.session.myData
        });
    });

    // Your reservations
    router.get('/' + version + '/reserve-reservations', function (req, res) {
        res.render(version + '/reserve-reservations', {
            myData:req.session.myData
        });
    });

    // Start
    router.get('/' + version + '/reserve-start', function (req, res) {
        res.render(version + '/reserve-start', {
            myData:req.session.myData
        });
    });

    // Choose organisation
    router.get('/' + version + '/reserve-choose-org', function (req, res) {
        res.render(version + '/reserve-choose-org', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/reserve-choose-org', function (req, res) {
        var _account = req.session.myData.accounts[req.session.myData.accountID]
        // Answer
        req.session.myData.whichOrgAnswerTemp = req.body.whichOrgAnswer
        //Set default answer if includeValidation is false and no answer given
        if(req.session.myData.includeValidation == "false"){
            req.session.myData.whichOrgAnswerTemp = req.session.myData.whichOrgAnswerTemp || _account.entities[0].id
        }
        // Validation
        if(!req.session.myData.whichOrgAnswerTemp) {
            req.session.myData.validationError = "true"
            req.session.myData.validationErrors.whichOrgAnswer = {
                "anchor": "whichOrg-1",
                "message": "Select an organisation"
            }
        }
        // Next action
        if(req.session.myData.validationError == "true") {
            res.render(version + '/reserve-choose-org', {
                myData: req.session.myData
            });
        } else {
            req.session.myData.whichOrgAnswer = req.session.myData.whichOrgAnswerTemp
            req.session.myData.whichOrgAnswerTemp = ""
            res.redirect(301, '/' + version + '/reserve-choose-course');
        }
    });

    // Choose course
    router.get('/' + version + '/reserve-choose-course', function (req, res) {
        res.render(version + '/reserve-choose-course', {
            myData:req.session.myData
        });
    });
    // TODO
    router.post('/' + version + '/reserve-choose-course', function (req, res) {
        var _account = req.session.myData.accounts[req.session.myData.accountID],
            _courses = req.session.myData.courses.list
        // Answer
        req.session.myData.whichCourseAnswerTemp = req.body.whichCourseAnswer
        //Set default answer if includeValidation is false and no answer given
        if(req.session.myData.includeValidation == "false"){
            req.session.myData.whichCourseAnswerTemp = req.session.myData.whichCourseAnswerTemp || _courses[0].value
        }
        // Validation
        if(!req.session.myData.whichCourseAnswerTemp) {
            req.session.myData.validationError = "true"
            req.session.myData.validationErrors.whichCourseAnswer = {
                "anchor": "whichCourse-1",
                "message": "Select a course"
            }
        }
        // Next action
        if(req.session.myData.validationError == "true") {
            res.render(version + '/reserve-choose-course', {
                myData: req.session.myData
            });
        } else {
            req.session.myData.whichCourseAnswer = req.session.myData.whichCourseAnswerTemp
            req.session.myData.whichCourseAnswerTemp = ""
            res.redirect(301, '/' + version + '/reserve-choose-start-date');
        }
    });

    // Choose start date
    router.get('/' + version + '/reserve-choose-start-date', function (req, res) {
        res.render(version + '/reserve-choose-start-date', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/reserve-choose-start-date', function (req, res) {
        var _account = req.session.myData.accounts[req.session.myData.accountID]
        // Answer
        req.session.myData.whichStartDateAnswerTemp = req.body.whichStartDateAnswer
        //Set default answer if includeValidation is false and no answer given
        if(req.session.myData.includeValidation == "false"){
            req.session.myData.whichStartDateAnswerTemp = req.session.myData.whichStartDateAnswerTemp || req.session.myData.startDates[0].id
        }
        // Validation
        if(!req.session.myData.whichStartDateAnswerTemp) {
            req.session.myData.validationError = "true"
            req.session.myData.validationErrors.whichStartDateAnswer = {
                "anchor": "whichStartDate-1",
                "message": "Select a start date"
            }
        }
        // Next action
        if(req.session.myData.validationError == "true") {
            res.render(version + '/reserve-choose-start-date', {
                myData: req.session.myData
            });
        } else {
            req.session.myData.whichStartDateAnswer = req.session.myData.whichStartDateAnswerTemp
            req.session.myData.whichStartDateAnswerTemp = ""
            res.redirect(301, '/' + version + '/reserve-check-answers');
        }
    });

    // Check answers
    router.get('/' + version + '/reserve-check-answers', function (req, res) {
        res.render(version + '/reserve-check-answers', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/reserve-check-answers', function (req, res) {
        var _account = req.session.myData.accounts[req.session.myData.accountID]
        
        //Selected entity
        var _selectedEntityID = req.session.myData.whichOrgAnswer,
            _selectedEntity = _account.entities[0]
        if(_selectedEntityID){
            _account.entities.forEach(function(_entity) {
                if(_entity.id == _selectedEntityID){
                    _selectedEntity = _entity
                }
            });
        }

        // Answer
        req.session.myData.reserveNowAnswerTemp = req.body.reserveNowAnswer
        //Set default answer if includeValidation is false and no answer given
        if(req.session.myData.includeValidation == "false"){
            req.session.myData.reserveNowAnswerTemp = req.session.myData.reserveNowAnswerTemp || 'yes'
        }
        // Validation
        if(!req.session.myData.reserveNowAnswerTemp) {
            req.session.myData.validationError = "true"
            req.session.myData.validationErrors.reserveNowAnswer = {
                "anchor": "reserveNow-1",
                "message": "Select whether you want to reserve funding or not"
            }
        }
        // Next action
        if(req.session.myData.validationError == "true") {
            res.render(version + '/reserve-check-answers', {
                myData: req.session.myData
            });
        } else {
            req.session.myData.reserveNowAnswer = req.session.myData.reserveNowAnswerTemp
            req.session.myData.reserveNowAnswerTemp = ""
            if(req.session.myData.reserveNowAnswer == "yes"){
                var _id = randomStr(10),
                    _reservationObject = {
                        "id": _id,
                        "startDate": req.session.myData.whichStartDateAnswer,
                        "course": req.session.myData.whichCourseAnswer,
                        "entity": _selectedEntityID,
                        "status": "available",
                        "created": new Date()
                    }
                _account.reservations.push(_reservationObject)
                _selectedEntity.reservations.push(_reservationObject)
                res.redirect(301, '/' + version + '/reserve-confirmation');
            } else {
                res.redirect(301, '/' + version + '/employer-home');
            }
            
        }
    });

    // Confirmation
    router.get('/' + version + '/reserve-confirmation', function (req, res) {
        res.render(version + '/reserve-confirmation', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/reserve-confirmation', function (req, res) {
        var _account = req.session.myData.accounts[req.session.myData.accountID]

        // Answer
        req.session.myData.whatNextAnswerTemp = req.body.whatNextAnswer
        //Set default answer if includeValidation is false and no answer given
        if(req.session.myData.includeValidation == "false"){
            req.session.myData.whatNextAnswerTemp = req.session.myData.whatNextAnswerTemp || 'home'
        }
        // Validation
        if(!req.session.myData.whatNextAnswerTemp) {
            req.session.myData.validationError = "true"
            req.session.myData.validationErrors.whatNextAnswer = {
                "anchor": "whatNext-1",
                "message": "Select what you would like to do next"
            }
        }
        // Next action
        if(req.session.myData.validationError == "true") {
            res.render(version + '/reserve-confirmation', {
                myData: req.session.myData
            });
        } else {
            req.session.myData.whatNextAnswer = req.session.myData.whatNextAnswerTemp
            req.session.myData.whatNextAnswerTemp = ""
            // TODO multiple exit routes
            res.redirect(301, '/' + version + '/employer-home');
        }
    });


 };

