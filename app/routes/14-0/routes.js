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

    function setVisibleReservations(req){
        req.session.myData.accounts[req.session.myData.account].reservations.forEach(function(_reservation, index) {
            _reservation.visible = (index < req.session.myData.count) || req.session.myData.type == "pro"
        });
    }

    function returnReservationData(req, _id){
        var _returnReservation = {
            "item": null,
            "index": 0
        }
        if(_id){
            req.session.myData.accounts[req.session.myData.account].reservations.forEach(function(_reservation, index) {
                if(_id == _reservation.id) {
                    _returnReservation.item = _reservation
                    _returnReservation.index = index
                }
            }); 
        }
        return _returnReservation
    }

    function reset(req){
        req.session.myData = JSON.parse(JSON.stringify(_myData))
        req.session.myData.count = 8
        req.session.myData.limit = 10
        req.session.myData.upcoming = "false"
        setVisibleReservations(req)
    }

    router.all('/' + version + '/*', function (req, res, next) {

        if(!req.session.myData || req.query.reset) {
            reset(req)
        }
        
        // Reset page validation to false by default. Will only be set to true, if applicable, on a POST of a page
        req.session.myData.validationErrors = {}
        req.session.myData.validationError = "false"
        req.session.myData.includeValidation =  req.query.includeValidation || req.session.myData.includeValidation

        // Query string values
        //
        // Accounts
        req.session.myData.type = req.query.type || req.session.myData.type
        req.session.myData.emp = req.query.emp || req.session.myData.emp
        req.session.myData.pro = req.query.pro || req.session.myData.pro
        req.session.myData.account = (req.session.myData.type == "emp") ? req.session.myData.emp : req.session.myData.pro
        //Account name
        var _account = req.session.myData.accounts[req.session.myData.account]
        req.session.myData.name = req.query.name || (req.session.myData.name || _account.name)
        _account.name = req.session.myData.name
        //Entity name
        if(req.session.myData.type == "emp"){
            req.session.myData.ename = req.query.ename || (req.session.myData.ename || _account.entities[0].name)
            _account.entities[0].name = req.session.myData.ename
        }
        //Visible reservations
        req.session.myData.count = Number(req.query.count || req.session.myData.count)
        if(req.query.count){
            setVisibleReservations(req)
        }
        //Restrictions
        req.session.myData.limit = req.query.limit || req.session.myData.limit
        req.session.myData.upcoming = req.query.upcoming || req.session.myData.upcoming
        
        next()
    });

    // Prototype setup
    router.get('/' + version + '/setup', function (req, res) {
        req.session.myData.version = version
        res.render(version + '/setup', {
            myData:req.session.myData
        });
    });

    // Employer home
    router.get('/' + version + '/employer-home', function (req, res) {
        res.render(version + '/employer-home', {
            myData:req.session.myData
        });
    });

    // Provider home
    router.get('/' + version + '/provider-home', function (req, res) {
        res.render(version + '/provider-home', {
            myData:req.session.myData
        });
    });

    // Your reservations
    router.get('/' + version + '/reserve-reservations', function (req, res) {
        res.render(version + '/reserve-reservations', {
            myData:req.session.myData
        });
    });

    // Your reservations - Provider
    router.get('/' + version + '/reserve-reservations-pro', function (req, res) {
        res.render(version + '/reserve-reservations-pro', {
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
        var _account = req.session.myData.accounts[req.session.myData.account]
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

    // Choose organisation - pro
    router.get('/' + version + '/reserve-choose-org-pro', function (req, res) {
        res.render(version + '/reserve-choose-org-pro', {
            myData:req.session.myData
        });
    });

    // Confirm organisation
    router.get('/' + version + '/reserve-confirm-org', function (req, res) {
        req.session.myData.selectedEmployer = req.query.employer || req.session.myData.accounts[req.session.myData.account].employers[0].id
        res.render(version + '/reserve-confirm-org', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/reserve-confirm-org', function (req, res) {
        // Answer
        req.session.myData.confirmOrgAnswerTemp = req.body.confirmOrgAnswer
        //Set default answer if includeValidation is false and no answer given
        if(req.session.myData.includeValidation == "false"){
            req.session.myData.confirmOrgAnswerTemp = req.session.myData.confirmOrgAnswerTemp || "yes"
        }
        // Validation
        if(!req.session.myData.confirmOrgAnswerTemp) {
            req.session.myData.validationError = "true"
            req.session.myData.validationErrors.confirmOrgAnswer = {
                "anchor": "confirmOrg-1",
                "message": "Select whether to secure funds for this employer or not"
            }
        }
        // Next action
        if(req.session.myData.validationError == "true") {
            res.render(version + '/reserve-confirm-org', {
                myData: req.session.myData
            });
        } else {
            req.session.myData.confirmOrgAnswer = req.session.myData.confirmOrgAnswerTemp
            req.session.myData.confirmOrgAnswerTemp = ""
            if(req.session.myData.confirmOrgAnswer == "yes") {
                res.redirect(301, '/' + version + '/reserve-choose-training');
            } else {
                res.redirect(301, '/' + version + '/reserve-choose-org-pro');
            }
        }
    });

    // Choose course
    router.get('/' + version + '/reserve-choose-course', function (req, res) {
        res.render(version + '/reserve-choose-course', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/reserve-choose-course', function (req, res) {
        // Answer
        req.session.myData.whichCourseAnswerTemp = req.body.whichCourseAnswer
        //Set default answer if includeValidation is false and no answer given
        if(req.session.myData.includeValidation == "false"){
            req.session.myData.whichCourseAnswerTemp = req.session.myData.whichCourseAnswerTemp || req.session.myData.courses.list[0].value
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
        var _account = req.session.myData.accounts[req.session.myData.account]
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
                _account.reservations.unshift(
                    {
                        "id": randomStr(10),
                        "startDate": req.session.myData.whichStartDateAnswer,
                        "course": req.session.myData.whichCourseAnswer,
                        "entity": req.session.myData.whichOrgAnswer,
                        "status": "available",
                        "visible": true
                    }
                )
                res.redirect(301, '/' + version + '/reserve-confirmation');
            } else {
                if(req.session.myData.type == "pro"){
                    res.redirect(301, '/' + version + '/provider-home');
                } else {
                    res.redirect(301, '/' + version + '/employer-home');
                }
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
            if(req.session.myData.type == "pro"){
                res.redirect(301, '/' + version + '/provider-home');
            } else {
                res.redirect(301, '/' + version + '/employer-home');
            }
        }
    });

    // Delete
    router.get('/' + version + '/reserve-delete', function (req, res) {
        req.session.myData.selectedReservation = req.query.delete || req.session.myData.accounts[req.session.myData.account].reservations[0].id
        res.render(version + '/reserve-delete', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/reserve-delete', function (req, res) {
        var _account = req.session.myData.accounts[req.session.myData.account]
        // Answer
        req.session.myData.deleteAnswerTemp = req.body.deleteAnswer
        //Set default answer if includeValidation is false and no answer given
        if(req.session.myData.includeValidation == "false"){
            req.session.myData.deleteAnswerTemp = req.session.myData.deleteAnswerTemp || 'yes'
        }
        // Validation
        if(!req.session.myData.deleteAnswerTemp) {
            req.session.myData.validationError = "true"
            req.session.myData.validationErrors.deleteAnswer = {
                "anchor": "delete-1",
                "message": "Select whether you want to delete this reservation"
            }
        }
        // Next action
        if(req.session.myData.validationError == "true") {
            res.render(version + '/reserve-delete', {
                myData: req.session.myData
            });
        } else {
            req.session.myData.deleteAnswer = req.session.myData.deleteAnswerTemp
            req.session.myData.deleteAnswerTemp = ""
            if(req.session.myData.deleteAnswer == "yes"){
                //Delete reservation
                var _reservation = returnReservationData(req, req.session.myData.selectedReservation)
                if(_reservation.item){
                    _reservation.item.visible = false
                }
                res.redirect(301, '/' + version + '/reserve-delete-confirmation');
            } else {
                res.redirect(301, '/' + version + '/reserve-reservations');
            }
        }
    });

    // Delete Confirmation
    router.get('/' + version + '/reserve-delete-confirmation', function (req, res) {
        res.render(version + '/reserve-delete-confirmation', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/reserve-delete-confirmation', function (req, res) {
        // Answer
        req.session.myData.deleteWhatNextAnswerTemp = req.body.deleteWhatNextAnswer
        //Set default answer if includeValidation is false and no answer given
        if(req.session.myData.includeValidation == "false"){
            req.session.myData.deleteWhatNextAnswerTemp = req.session.myData.deleteWhatNextAnswerTemp || 'manage'
        }
        // Validation
        if(!req.session.myData.deleteWhatNextAnswerTemp) {
            req.session.myData.validationError = "true"
            req.session.myData.validationErrors.deleteWhatNextAnswer = {
                "anchor": "delete-1",
                "message": "Select what you want to do next"
            }
        }
        // Next action
        if(req.session.myData.validationError == "true") {
            res.render(version + '/reserve-delete-confirmation', {
                myData: req.session.myData
            });
        } else {
            req.session.myData.deleteWhatNextAnswer = req.session.myData.deleteWhatNextAnswerTemp
            req.session.myData.deleteWhatNextAnswerTemp = ""
            if(req.session.myData.deleteWhatNextAnswer == "home"){
                if(req.session.myData.type == "pro"){
                    res.redirect(301, '/' + version + '/provider-home');
                } else {
                    res.redirect(301, '/' + version + '/employer-home');
                }
            } else {
                res.redirect(301, '/' + version + '/reserve-reservations');
            }
        }
    });

    // Limit reached
    router.get('/' + version + '/reserve-limit-reached', function (req, res) {
        res.render(version + '/reserve-limit-reached', {
            myData:req.session.myData
        });
    });

    // Upcoming
    router.get('/' + version + '/reserve-upcoming', function (req, res) {
        res.render(version + '/reserve-upcoming', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/reserve-upcoming', function (req, res) {
        if(req.body.upcominghide == "upcominghide"){
            req.session.myData.upcoming = "false"
        }
        res.redirect(301, '/' + version + '/reserve-start');
    });

 };