module.exports = function (router,_myData) {

    var version = "16-0";

    function randomStr(len) { 
        var ans = ''
            arr = 'abcdefghijklimnopqrstuvwxyz'; 
        for (var i = len; i > 0; i--) { 
            ans += arr[Math.floor(Math.random() * arr.length)]; 
        } 
        return ans;
    }

    function randomItem(_items){
        return _items[Math.floor(Math.random()*_items.length)];
    }

    function randomBoolean(_chance){
        return Math.random() < _chance
    }

    function setVisibleReservations(req){
        req.session.myData.accounts[req.session.myData.account].reservations.forEach(function(_reservation, index) {
            _reservation.visible = (index < req.session.myData.count)
        });
    }

    function setExpiredReservations(req){
        req.session.myData.accounts[req.session.myData.account].reservations.forEach(function(_reservation, index) {
            var _date
            req.session.myData.startDates.forEach(function(_startDate, index) {
                if(_startDate.id == _reservation.startDate){
                    _date = _startDate
                }
            });
            if(_reservation.status == "expired" && !_date.expired){
                _reservation.status = "available"
            } else if(_date.expired && _reservation.status != "used") {
                _reservation.status = "expired"
            }
        });
    }

    function setActiveProviders(req){
        req.session.myData.accounts[req.session.myData.account].reservations.forEach(function(_reservation, index) {
            var _ep = req.session.myData.existingproviders
            if(_reservation.provider){
                if(_ep == 2){
                    _reservation.provideractive = true
                } else if(_ep == 1 && _reservation.provider == "TRAINING UK") {
                    _reservation.provideractive = true
                } else {
                    _reservation.provideractive = false  
                }
            }
        });
    }

    function returnProviderID(req,_name){
        var _valueToReturn = "12345678"
        req.session.myData.accounts[req.session.myData.account].providers.forEach(function(_provider, index) {
            if(_name == _provider.name) {
                _valueToReturn = _provider.id
            }
        });
        return _valueToReturn;
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

    function setReservationData(req){
        var _account = req.session.myData.accounts[req.session.myData.account]
        _account.courselabels = []
        _account.reservations.forEach(function(_reservation, index) {
            // Employer
            // _reservation.searchstring = _reservation.entity
            //Course
            req.session.myData.courses.list.forEach(function(_course, index) {
                if(_course.value == _reservation.course){
                    _reservation.courselabel = _course.name + " - Level " + _course.level
                }
            });
            //Course labels
            if (_account.courselabels.indexOf(_reservation.courselabel) == -1) {
                _account.courselabels.push(_reservation.courselabel)
            }
            _account.courselabels.sort(function(a,b){
                if (a.toUpperCase() < b.toUpperCase()){
                    return -1
                } else if(a.toUpperCase() > b.toUpperCase()){
                    return 1
                }
                return 0;
            });
            //Start date label
            req.session.myData.startDates.forEach(function(_startDate, index) {
                if(_startDate.id == _reservation.startDate){
                    _reservation.startDatelabel = _startDate.range
                }
            });
        });
    }

    function sortReservations(req){
        var _reservations = req.session.myData.accounts[req.session.myData.account].reservations
        _reservations.sort(function(a,b){

            //Course Name
            var _a_courseName = "",
                _b_courseName = ""
            req.session.myData.courses.list.forEach(function(_course, index) {
                if(_course.value == a.course) {
                    _a_courseName = _course.name
                }
                if(_course.value == b.course) {
                    _b_courseName = _course.name
                }
            });

            //Date index
            var _a_dateIndex = 0,
                _b_dateIndex = 0;
            req.session.myData.startDates.forEach(function(_startDate, _dateIndex) {
                if(_startDate.id == a.startDate) {
                    _a_dateIndex = _dateIndex
                } else if (_startDate.id == b.startDate) {
                    _b_dateIndex = _dateIndex
                }
            });
            
            //Sort on employer name FIRST
            if (a.entity.toUpperCase() < b.entity.toUpperCase()){
                return -1;
            } else if(a.entity.toUpperCase() > b.entity.toUpperCase()){
                return 1;
            } else {
                //Sort on course name
                if(_a_courseName.toUpperCase() < _b_courseName.toUpperCase()) {
                    return -1;
                } else if (_a_courseName.toUpperCase() > _b_courseName.toUpperCase()) {
                    return 1;
                } else {
                    //Sort on start date
                    if(_a_dateIndex > _b_dateIndex) {
                        return -1;
                    } else if (_a_dateIndex < _b_dateIndex) {
                        return 1;
                    }
                }
            }
            return 0;
        })
    }

    function sortEmployers(req){
        var _employers = req.session.myData.accounts[req.session.myData.account].employers
        if(_employers){
            _employers.sort(function(a,b){
                //Sort on employer name
                if (a.name.toUpperCase() < b.name.toUpperCase()){
                    return -1;
                } else if(a.name.toUpperCase() > b.name.toUpperCase()){
                    return 1;
                } else {
                    return 0;
                }
            })
        }
    }

    function setDefaultAnswers(req, _type){
        // Employer 
        var _empStartDate = req.session.myData.startDates[0].id,
            _proStartDate = req.session.myData.startDates[0].id,
            _empSet = false,
            _proSet = false
        req.session.myData.startDates.forEach(function(_startDate, index) {
            if(_startDate.empmvs == true && !_empSet){
                _empStartDate = _startDate.id
                _empSet = true
            }
            if(_startDate.promvs == true && !_proSet){
                _proStartDate = _startDate.id
                _proSet = true
            }
        });
        req.session.myData.whichOrgAnswer = req.session.myData.whichOrgAnswer || req.session.myData.accounts[req.session.myData.emp].entities[0].id
        req.session.myData.whichCourseAnswer = req.session.myData.whichCourseAnswer || req.session.myData.courses.list[0].value
        req.session.myData.whichStartDateAnswer = req.session.myData.whichStartDateAnswer || _empStartDate

        // TODO adding provider pages answers
        req.session.myData.selectedReservation == req.session.myData.selectedReservation || req.session.myData.accounts[req.session.myData.account].reservations[0].id
        req.session.myData.selectedProvider = req.session.myData.selectedProvider || {
            "name": "TRAINING UK",
            "id": "12345678"
        }
        req.session.myData.addProvider == req.session.myData.addProvider || false

        // Provider
        req.session.myData.selectedEmployer = req.session.myData.selectedEmployer || req.session.myData.accounts[req.session.myData.pro].employers[0].id
        req.session.myData.whichTrainingCourseAnswer = req.session.myData.whichTrainingCourseAnswer || req.session.myData.courses.list[0].value
        req.session.myData.whichTrainingStartDateAnswer = req.session.myData.whichTrainingStartDateAnswer || _proStartDate
    }

    function setAccountInfo(req, _type){

        //Set type based on pages
        req.session.myData.type = req.query.t || req.session.myData.type
        var _type = req.session.myData.type
            _pathname = req._parsedUrl.pathname,
            _page = _pathname.substring(_pathname.lastIndexOf("/") + 1, _pathname.length),
            _providerPages = [
                "provider-home",
                "reserve-check-answers-pro",
                "reserve-choose-org-pro",
                "reserve-choose-training",
                "reserve-confirm-org",
                "reserve-confirmation-pro",
                "reserve-reservations-pro"
            ],
            _employerPages = [
                "employer-home",
                "reserve-check-answers",
                "reserve-choose-org",
                "reserve-choose-course",
                "reserve-choose-start-date",
                "reserve-confirmation",
                "reserve-reservations",
                "reserve-choose-provider",
                "reserve-choose-provider-2",
                "reserve-choose-provider-3",
                "reserve-choose-provider-3-b",
                "reserve-enter-provider",
                "reserve-confirm-provider",
                "reserve-confirm-provider-b",
                "reserve-delete-provider",
                "reserve-delete-provider-confirmation",
                "reserve-added-provider-confirmation",
                "reserve-manage-reservation",
                "reserve-dropout"
            ]
        if(_providerPages.indexOf(_page) > -1){
            _type = "pro"
        } else if(_employerPages.indexOf(_page) > -1){
            _type = "emp"
        }
        req.session.myData.type = _type
        
        // Accounts
        req.session.myData.emp = req.query.emp || req.session.myData.emp
        req.session.myData.pro = req.query.pro || req.session.myData.pro
        req.session.myData.account = (_type == "emp") ? req.session.myData.emp : req.session.myData.pro
        //Account name
        var _account = req.session.myData.accounts[req.session.myData.account]
        req.session.myData.name = req.query.n || (req.session.myData.name || _account.name)
        _account.name = req.session.myData.name
        //Entity name
        if(_type == "emp"){
            req.session.myData.ename = req.query.en || (req.session.myData.ename || _account.entities[0].name)
            _account.entities[0].name = req.session.myData.ename
        }
    }

    function createProviderData(req, _count){

        req.session.myData.generatedReservations = []

        for (i = 0; i < _count; i++) {

            var _reservation = {
                "id": randomStr(10),
                "startDate": "",
                "course": "",
                "entity": "",
                "status": "available",
                "visible": false,
                "owned": true
            }

            //Start date
            _reservation.startDate = randomItem(req.session.myData.startDates).id

            //Course
            _reservation.course = randomItem(req.session.myData.accounts["pro-1"].courses)

            //Entity
            _reservation.entity = randomItem(req.session.myData.accounts["pro-1"].employers).name

            // Status
            if(_reservation.startDate == "aug2019" || _reservation.startDate == "sep2019"){
                // Previous months - set to either "expired" or "used"
                if(randomBoolean(0.7)){
                    _reservation.status = "used"
                } else {
                    _reservation.status = "expired"
                }
            } else if(randomBoolean(0.1)){
                // Current and future months - set some to used
                _reservation.status = "used"
            }

            // Owned
            _reservation.owned = randomBoolean(0.3)

            //Add to list
            req.session.myData.generatedReservations.push(_reservation)
            
        }

    }

    function reset(req){
        req.session.myData = JSON.parse(JSON.stringify(_myData))
        req.session.myData.startDates = [
            {
                "id": "jun2019",
                "name": "June 2019",
                "range": "Jun 2019 to Aug 2019",
                "endDate": new Date("09-01-2019"),
            },
            {
                "id": "jul2019",
                "name": "July 2019",
                "range": "Jul 2019 to Sep 2019",
                "endDate": new Date("10-01-2019"),
            },
            {
                "id": "aug2019",
                "name": "August 2019",
                "range": "Aug 2019 to Oct 2019",
                "endDate": new Date("11-01-2019")
            },
            {
                "id": "sep2019",
                "name": "September 2019",
                "range": "Sep 2019 to Nov 2019",
                "endDate": new Date("12-01-2019")
            },
            {
                "id": "oct2019",
                "name": "October 2019",
                "range": "Oct 2019 to Dec 2019",
                "endDate": new Date("01-01-2020"),
                "empmvs": true,
                "promvs": true
            },
            {
                "id": "nov2019",
                "name": "November 2019",
                "range": "Nov 2019 to Jan 2020",
                "endDate": new Date("02-01-2020"),
                "promvs": true,
                "empmvs": true
            },
            {
                "id": "dec2019",
                "name": "December 2019",
                "range": "Dec 2019 to Feb 2020",
                "endDate": new Date("03-01-2020"),
                "promvs": true,
                "empmvs": true
            },
            {
                "id": "jan2020",
                "name": "January 2020",
                "range": "Jan 2020 to Mar 2020",
                "endDate": new Date("04-01-2020"),
                "promvs": true,
                "empmvs": true
            },
            {
                "id": "feb2020",
                "name": "February 2020",
                "range": "Feb 2020 to Apr 2020",
                "endDate": new Date("05-01-2020"),
                "promvs": true,
                "empmvs": true
            },
            {
                "id": "mar2020",
                "name": "March 2020",
                "range": "Mar 2020 to May 2020",
                "endDate": new Date("06-01-2020"),
                "promvs": true,
                "empmvs": true
            }
        ]
        //Set expired true/false against each date object
        req.session.myData.startDates.forEach(function(_startDate, index) {
            _startDate.expired = (new Date().setHours(0,0,0,0) >= _startDate.endDate)
        });

        req.session.myData.type = "pro"
        req.session.myData.count = 999999
        req.session.myData.limit = 15
        req.session.myData.emplimit = "no"
        req.session.myData.existingproviders = 1
        req.session.myData.hidedates = "no"
        req.session.myData.reservationsadded = 0
        req.session.myData.upcoming = "false"
        req.session.myData.paused = "false"
        req.session.myData.paging = "false"
        req.session.myData.search = "true"
        req.session.myData.filters = "true"

        //Create fake data - only used when new json data files need to be generated
        // createProviderData(req,2000)

    }

    // Every GET amd POST
    router.all('/' + version + '/*', function (req, res, next) {

        if(!req.session.myData || req.query.r) {
            reset(req)
        }

        //version
        req.session.myData.version = version
        
        // Reset page validation to false by default. Will only be set to true, if applicable, on a POST of a page
        req.session.myData.validationErrors = {}
        req.session.myData.validationError = "false"
        req.session.myData.includeValidation =  req.query.iv || req.session.myData.includeValidation

        //Account info
        setAccountInfo(req)

        //Visible reservations
        req.session.myData.count = Number(req.query.c || req.session.myData.count)
        var _account = req.session.myData.accounts[req.session.myData.account]
        if(req.query.c || !_account.visibleSet){
            _account.visibleSet = true
            setVisibleReservations(req)
        }

        //Expired reservations
        setExpiredReservations(req)

        //Sort reservations
        sortReservations(req)

        //Sort employers
        sortEmployers(req)

        //Restrictions
        req.session.myData.limit = req.query.l || req.session.myData.limit
        req.session.myData.upcoming = req.query.up || req.session.myData.upcoming
        req.session.myData.emplimit = req.query.el || req.session.myData.emplimit
        req.session.myData.hidedates = req.query.d || req.session.myData.hidedates
        req.session.myData.paused = req.query.p || req.session.myData.paused

        //Existing provider relationships
        req.session.myData.existingproviders = req.query.ep || req.session.myData.existingproviders
        if(req.query.ep || !_account.activeProvidersSet) {
            _account.activeProvidersSet = true
            setActiveProviders(req)
        }

        // Components
        req.session.myData.paging = req.query.c_pg || req.session.myData.paging
        req.session.myData.search = req.query.c_sr || req.session.myData.search
        req.session.myData.filters = req.query.c_ft || req.session.myData.filters

        //Dropout type
        req.session.myData.dropout = req.query.do || req.session.myData.dropout

        //End of two months from now
        var _EndOfTwoMonthsFromNow = new Date()
        _EndOfTwoMonthsFromNow.setMonth(_EndOfTwoMonthsFromNow.getMonth() + 3);
        _EndOfTwoMonthsFromNow.setDate(0);
        req.session.myData.EndOfTwoMonthsFromNowDateFriendly = _EndOfTwoMonthsFromNow.getDate() + " " + req.session.myData.months[_EndOfTwoMonthsFromNow.getMonth()] + " " + _EndOfTwoMonthsFromNow.getFullYear()

        // Set default answers
        setDefaultAnswers(req, "emp")
        
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
    
        // setVisibleReservations(req)
        sortReservations(req)

        res.render(version + '/reserve-reservations', {
            myData:req.session.myData
        });

    });

    // Your reservations - Provider
    router.get('/' + version + '/reserve-reservations-pro', function (req, res) {
        
        // setVisibleReservations(req)
        sortReservations(req)
        setReservationData(req)

        //Search
        var _reservations = req.session.myData.accounts[req.session.myData.account].reservations
        //Clear search
        req.session.myData.searchapplied = false

        var _searchQ = req.query.q
        if(_searchQ || _searchQ == ""){
            _searchQ = _searchQ.trim()
            if(_searchQ != ""){

                //Defaults
                req.session.myData.searchTerm = _searchQ
                req.session.myData.searchapplied = true
                _reservations.forEach(function(_reservation, index) {
                    _reservation.search = true
                })

                function doSearch(_v){
                    if(_v == "version1"){
                        // Version 1: check for matches on whole search query
                        _reservations.forEach(function(_reservation, index) {
                            _reservation.search = false
                            var _searchWithin = _reservation.entity + " " + _reservation.courselabel
                            if(_searchWithin.toUpperCase().indexOf(_searchQ.toUpperCase()) != -1) {
                                _reservation.search = true
                                _reservation.searchorder
                            }
                        });
                    } else if(_v == "version1"){
                        // Version 2: Check for matches - ON EACH PART OF SEARCH QUERY
                        var _searchQParts = _searchQ.split(" ");
                        _reservations.forEach(function(_reservation, index) {
                            _reservation.search = false
                            var _searchWithin = _reservation.entity + " " + _reservation.courselabel
                            _searchQParts.forEach(function(_searchQPart, index) {
                                if(_searchWithin.toUpperCase().indexOf(_searchQPart.toUpperCase()) != -1) {
                                    _reservation.search = true
                                    _reservation.searchorder
                                }
                            });
                        });
                    }
                }

                doSearch("version1")
            }
        }

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

        //Search
        var _employers = req.session.myData.accounts[req.session.myData.account].employers
        //Clear search
        req.session.myData.empsearchapplied = false

        var _searchQ = req.query.q
        if(_searchQ || _searchQ == ""){
            _searchQ = _searchQ.trim()
            if(_searchQ != ""){

                //Defaults
                req.session.myData.empsearchTerm = _searchQ
                req.session.myData.empsearchapplied = true
                _employers.forEach(function(_employer, index) {
                    _employer.search = true
                })

                function doSearch(_v){
                    if(_v == "version1"){
                        // Version 1: check for matches on whole search query
                        _employers.forEach(function(_employer, index) {
                            _employer.search = false
                            var _searchWithin = _employer.name
                            if(_searchWithin.toUpperCase().indexOf(_searchQ.toUpperCase()) != -1) {
                                _employer.search = true
                            }
                        });
                    } else if(_v == "version2"){
                        // Version 2: Check for matches - ON EACH PART OF SEARCH QUERY
                        var _searchQParts = _searchQ.split(" ");
                        _employers.forEach(function(_employer, index) {
                            _employer.search = false
                            var _searchWithin = _employer.name
                            _searchQParts.forEach(function(_searchQPart, index) {
                                if(_searchWithin.toUpperCase().indexOf(_searchQPart.toUpperCase()) != -1) {
                                    _employer.search = true
                                }
                            });
                        });
                    }
                }

                doSearch("version1")
            }
        }
        
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
            if(req.session.myData.emplimit == "no" || req.session.myData.reservationsadded < req.session.myData.emplimit) {
                if(req.session.myData.confirmOrgAnswer == "yes") {
                    res.redirect(301, '/' + version + '/reserve-choose-training');
                } else {
                    res.redirect(301, '/' + version + '/reserve-choose-org-pro');
                }
            } else {
                res.redirect(301, '/' + version + '/reserve-limit-reached');
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
        // Answers
        req.session.myData.knowCourseAnswerTemp = req.body.knowCourseAnswer
        req.session.myData.whichCourseAnswerTemp = req.body.whichCourseAnswer
        //Set default answer if includeValidation is false and no answer given
        if(req.session.myData.includeValidation == "false"){
            req.session.myData.knowCourseAnswerTemp = req.session.myData.knowCourseAnswerTemp || "yes"
            req.session.myData.whichCourseAnswerTemp = req.session.myData.whichCourseAnswerTemp || req.session.myData.courses.list[0].value
        }
        // Validation
        if(!req.session.myData.knowCourseAnswerTemp) {
            req.session.myData.validationError = "true"
            req.session.myData.validationErrors.knowCourseAnswer = {
                "anchor": "knowCourse-1",
                "message": "Select whether you know which apprenticeship training your apprentice will take"
            }
        }
        if(req.session.myData.knowCourseAnswerTemp == "yes" && !req.session.myData.whichCourseAnswerTemp) {
            req.session.myData.validationError = "true"
            req.session.myData.validationErrors.whichCourseAnswer = {
                "anchor": "whichCourse-1",
                "message": "Select which apprenticeship training your apprentice will take"
            }
        }
        // Next action
        if(req.session.myData.validationError == "true") {
            res.render(version + '/reserve-choose-course', {
                myData: req.session.myData
            });
        } else {
            req.session.myData.knowCourseAnswer = req.session.myData.knowCourseAnswerTemp
            req.session.myData.whichCourseAnswer = req.session.myData.whichCourseAnswerTemp
            req.session.myData.knowCourseAnswerTemp = ""
            req.session.myData.whichCourseAnswerTemp = ""
            if(req.session.myData.knowCourseAnswer == "no") {
                req.session.myData.dropout = "course"
                res.redirect(301, '/' + version + '/reserve-dropout');
            } else {
                res.redirect(301, '/' + version + '/reserve-choose-start-date');
            }
        }
    });

    // Drop out - course
    router.get('/' + version + '/reserve-dropout', function (req, res) {
        res.render(version + '/reserve-dropout', {
            myData:req.session.myData
        });
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

            if(req.session.myData.whichStartDateAnswer == "dontknow") {
                req.session.myData.dropout = "date"
                res.redirect(301, '/' + version + '/reserve-dropout');
            } else {
                if(req.session.myData.existingproviders == 0){
                    res.redirect(301, '/' + version + '/reserve-choose-provider-2');
                } else {
                    res.redirect(301, '/' + version + '/reserve-choose-provider');
                }
            }
            
        }
    });

    // Choose provider
    router.get('/' + version + '/reserve-choose-provider', function (req, res) {
        res.render(version + '/reserve-choose-provider', {
            myData:req.session.myData
        });
    });

    router.post('/' + version + '/reserve-choose-provider', function (req, res) {

        // Answer
        req.session.myData.whichProviderAnswerTemp = req.body.whichProviderAnswer
        //Set default answer if includeValidation is false and no answer given
        if(req.session.myData.includeValidation == "false"){
            req.session.myData.whichProviderAnswerTemp = req.session.myData.whichProviderAnswerTemp || "yes"
        }
        // Validation
        if(!req.session.myData.whichProviderAnswerTemp) {
            req.session.myData.validationError = "true"
            var _message = "Select whether to assign this reservation or not"
            if(req.session.myData.existingproviders == 1){
                //Same message for now
                _message = _message
            }
            req.session.myData.validationErrors.whichProviderAnswer = {
                "anchor": "whichProvider-1",
                "message": _message
            }
        }
        // Next action
        if(req.session.myData.validationError == "true") {
            res.render(version + '/reserve-choose-provider', {
                myData: req.session.myData
            });
        } else {
            req.session.myData.whichProviderAnswer = req.session.myData.whichProviderAnswerTemp
            req.session.myData.whichProviderAnswerTemp = ""
            if(req.session.myData.existingproviders == 1){
                if(req.session.myData.whichProviderAnswer == "yes") {
                    req.session.myData.selectedProvider = {
                        "name": "TRAINING UK",
                        "id": "12345678" 
                    }
                    req.session.myData.addProvider = true
                    res.redirect(301, '/' + version + '/reserve-check-answers');
                } else {
                    res.redirect(301, '/' + version + '/reserve-choose-provider-2');
                }
            } else {
                if(req.session.myData.whichProviderAnswer == "yes") {
                    res.redirect(301, '/' + version + '/reserve-choose-provider-3');
                } else {
                    req.session.myData.addProvider = false
                    res.redirect(301, '/' + version + '/reserve-check-answers');
                }
            }
        }
    });

    // Choose provider 2
    router.get('/' + version + '/reserve-choose-provider-2', function (req, res) {
        res.render(version + '/reserve-choose-provider-2', {
            myData:req.session.myData
        });
    });

    router.post('/' + version + '/reserve-choose-provider-2', function (req, res) {
        // Answers
        req.session.myData.whichProvider2AnswerTemp = req.body.whichProvider2Answer
        req.session.myData.ukprnAnswerTemp = req.body.ukprnAnswer.trim()
        //Set default answer if includeValidation is false and no answer given
        if(req.session.myData.includeValidation == "false"){
            req.session.myData.whichProvider2AnswerTemp = req.session.myData.whichProvider2AnswerTemp || "yes"
            req.session.myData.ukprnAnswerTemp = req.session.myData.ukprnAnswerTemp || "12345678"
        }
        //
        // Validation
        //
        // Neither radio button selected
        if(!req.session.myData.whichProvider2AnswerTemp) {
            req.session.myData.validationError = "true"
            req.session.myData.validationErrors.whichProvider2Answer = {
                "anchor": "whichProvider2-1",
                "message": "Select whether to assign this reservation or not"
            }
        }
        // Yes selected
        if(req.session.myData.whichProvider2AnswerTemp == "yes") {
            // No UKPRN entered
            if(!req.session.myData.ukprnAnswerTemp) {
                req.session.myData.validationError = "true"
                req.session.myData.validationErrors.ukprnAnswer = {
                    "anchor": "ukprn-1",
                    "message": "Number not recognised. Check the number you've entered is correct or contact your training provider for help"
                }
            // if not valid (not a number, not 8 digits long)
            } else if(isNaN(req.session.myData.ukprnAnswerTemp) || req.session.myData.ukprnAnswerTemp.length != 8) {
                req.session.myData.validationError = "true"
                req.session.myData.validationErrors.ukprnAnswer = {
                    "anchor": "ukprn-1",
                    "message": "Number not recognised. Check the number you've entered is correct or contact your training provider for help"
                }
            // if not a match
            } else if(req.session.myData.ukprnAnswerTemp == "00000000"){
                req.session.myData.validationError = "true"
                req.session.myData.validationErrors.ukprnAnswer = {
                    "anchor": "ukprn-1",
                    "message": "Number not recognised. Check the number you've entered is correct or contact your training provider for help"
                }
            }
        }
        // Next action
        if(req.session.myData.validationError == "true") {
            res.render(version + '/reserve-choose-provider-2', {
                myData: req.session.myData
            });
        } else {
            req.session.myData.whichProvider2Answer = req.session.myData.whichProvider2AnswerTemp
            req.session.myData.ukprnAnswer = req.session.myData.ukprnAnswerTemp
            req.session.myData.whichProvider2AnswerTemp = ""
            req.session.myData.ukprnAnswerTemp = ""

            if(req.session.myData.whichProvider2Answer == "no") {
                req.session.myData.addProvider = false
                res.redirect(301, '/' + version + '/reserve-check-answers');
            } else {
                req.session.myData.selectedProvider = {
                    "name": "TRAINING UK",
                    "id": req.session.myData.ukprnAnswer 
                }
                req.session.myData.addProvider = true
                res.redirect(301, '/' + version + '/reserve-confirm-provider');
            }
        }
    });

    // Choose provider 3
    router.get('/' + version + '/reserve-choose-provider-3', function (req, res) {
        res.render(version + '/reserve-choose-provider-3', {
            myData:req.session.myData
        });
    });

    router.post('/' + version + '/reserve-choose-provider-3', function (req, res) {

        // Answers
        req.session.myData.whichProvider3AnswerTemp = req.body.whichProvider3Answer
        req.session.myData.ukprnAnswerTemp = req.body.ukprnAnswer.trim()
        //Set default answer if includeValidation is false and no answer given
        if(req.session.myData.includeValidation == "false"){
            req.session.myData.whichProvider3AnswerTemp = req.session.myData.whichProvider3AnswerTemp || "TRAINING UK"
            req.session.myData.ukprnAnswerTemp = req.session.myData.ukprnAnswerTemp || "12345678"
        }
        //
        // Validation
        //
        // Neither radio button selected
        if(!req.session.myData.whichProvider3AnswerTemp) {
            req.session.myData.validationError = "true"
            req.session.myData.validationErrors.whichProvider3Answer = {
                "anchor": "whichProvider3-1",
                "message": "Select whether to assign this reservation or not"
            }
        }
        // Other selected
        if(req.session.myData.whichProvider3AnswerTemp == "other") {
            // No UKPRN entered
            if(!req.session.myData.ukprnAnswerTemp) {
                req.session.myData.validationError = "true"
                req.session.myData.validationErrors.ukprnAnswer = {
                    "anchor": "ukprn-1",
                    "message": "Number not recognised. Check the number you've entered is correct or contact your training provider for help"
                }
            // if not valid (not a number, not 8 digits long)
            } else if(isNaN(req.session.myData.ukprnAnswerTemp) || req.session.myData.ukprnAnswerTemp.length != 8) {
                req.session.myData.validationError = "true"
                req.session.myData.validationErrors.ukprnAnswer = {
                    "anchor": "ukprn-1",
                    "message": "Number not recognised. Check the number you've entered is correct or contact your training provider for help"
                }
            // if not a match
            } else if(req.session.myData.ukprnAnswerTemp == "00000000"){
                req.session.myData.validationError = "true"
                req.session.myData.validationErrors.ukprnAnswer = {
                    "anchor": "ukprn-1",
                    "message": "Number not recognised. Check the number you've entered is correct or contact your training provider for help"
                }
            }
        }
        // Next action
        if(req.session.myData.validationError == "true") {
            res.render(version + '/reserve-choose-provider-3', {
                myData: req.session.myData
            });
        } else {
            // Selected Provider data
            req.session.myData.selectedProvider = {
                "name": (req.session.myData.whichProvider3AnswerTemp != "other") ? req.session.myData.whichProvider3AnswerTemp : "TRAINING UK",
                "id": (req.session.myData.whichProvider3AnswerTemp != "other") ? returnProviderID(req,req.session.myData.whichProvider3AnswerTemp) : req.session.myData.ukprnAnswerTemp
            }
            req.session.myData.addProvider = true
            
            req.session.myData.whichProvider3Answer = req.session.myData.whichProvider3AnswerTemp
            req.session.myData.ukprnAnswer = req.session.myData.ukprnAnswerTemp
            req.session.myData.whichProvider3AnswerTemp = ""
            req.session.myData.ukprnAnswerTemp = ""

            if(req.session.myData.whichProvider3Answer == "other") {
                res.redirect(301, '/' + version + '/reserve-confirm-provider');
            } else {
                res.redirect(301, '/' + version + '/reserve-check-answers');
            }
        }
    });

    // Choose provider 3 b (from manage)
    router.get('/' + version + '/reserve-choose-provider-3-b', function (req, res) {
        req.session.myData.selectedReservation = req.query.reservation || req.session.myData.accounts[req.session.myData.account].reservations[0].id
        res.render(version + '/reserve-choose-provider-3-b', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/reserve-choose-provider-3-b', function (req, res) {

        // Answers
        req.session.myData.whichProvider3AnswerTemp = req.body.whichProvider3Answer
        req.session.myData.ukprnAnswerTemp = req.body.ukprnAnswer.trim()
        //Set default answer if includeValidation is false and no answer given
        if(req.session.myData.includeValidation == "false"){
            req.session.myData.whichProvider3AnswerTemp = req.session.myData.whichProvider3AnswerTemp || "TRAINING UK"
            req.session.myData.ukprnAnswerTemp = req.session.myData.ukprnAnswerTemp || "12345678"
        }
        //
        // Validation
        //
        // Neither radio button selected
        if(!req.session.myData.whichProvider3AnswerTemp) {
            req.session.myData.validationError = "true"
            req.session.myData.validationErrors.whichProvider3Answer = {
                "anchor": "whichProvider3-1",
                "message": "Select whether to assign this reservation or not"
            }
        }
        // Other selected
        if(req.session.myData.whichProvider3AnswerTemp == "other") {
            // No UKPRN entered
            if(!req.session.myData.ukprnAnswerTemp) {
                req.session.myData.validationError = "true"
                req.session.myData.validationErrors.ukprnAnswer = {
                    "anchor": "ukprn-1",
                    "message": "Number not recognised. Check the number you've entered is correct or contact your training provider for help"
                }
            // if not valid (not a number, not 8 digits long)
            } else if(isNaN(req.session.myData.ukprnAnswerTemp) || req.session.myData.ukprnAnswerTemp.length != 8) {
                req.session.myData.validationError = "true"
                req.session.myData.validationErrors.ukprnAnswer = {
                    "anchor": "ukprn-1",
                    "message": "Number not recognised. Check the number you've entered is correct or contact your training provider for help"
                }
            // if not a match
            } else if(req.session.myData.ukprnAnswerTemp == "00000000"){
                req.session.myData.validationError = "true"
                req.session.myData.validationErrors.ukprnAnswer = {
                    "anchor": "ukprn-1",
                    "message": "Number not recognised. Check the number you've entered is correct or contact your training provider for help"
                }
            }
        }
        // Next action
        if(req.session.myData.validationError == "true") {
            res.render(version + '/reserve-choose-provider-3-b', {
                myData: req.session.myData
            });
        } else {
            // Selected Provider data
            req.session.myData.selectedProvider = {
                "name": (req.session.myData.whichProvider3AnswerTemp != "other") ? req.session.myData.whichProvider3AnswerTemp : "TRAINING UK",
                "id": (req.session.myData.whichProvider3AnswerTemp != "other") ? returnProviderID(req,req.session.myData.whichProvider3AnswerTemp) : req.session.myData.ukprnAnswerTemp
            }
            
            req.session.myData.whichProvider3Answer = req.session.myData.whichProvider3AnswerTemp
            req.session.myData.ukprnAnswer = req.session.myData.ukprnAnswerTemp
            req.session.myData.whichProvider3AnswerTemp = ""
            req.session.myData.ukprnAnswerTemp = ""

            if(req.session.myData.whichProvider3Answer == "other") {
                res.redirect(301, '/' + version + '/reserve-confirm-provider-b');
            } else {
                //Change provider on reservation
                var _reservation = returnReservationData(req, req.session.myData.selectedReservation)
                if(_reservation.item){
                    _reservation.item.provider = req.session.myData.whichProvider3Answer
                    _reservation.item.provideractive = true
                }
                res.redirect(301, '/' + version + '/reserve-added-provider-confirmation');
            }
        }
    });

    // Enter provider (from manage)
    router.get('/' + version + '/reserve-enter-provider', function (req, res) {
        req.session.myData.selectedReservation = req.query.reservation || req.session.myData.accounts[req.session.myData.account].reservations[0].id
        res.render(version + '/reserve-enter-provider', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/reserve-enter-provider', function (req, res) {

        // Answers
        req.session.myData.ukprnAnswerTemp = req.body.ukprnAnswer.trim()
        //Set default answer if includeValidation is false and no answer given
        if(req.session.myData.includeValidation == "false"){
            req.session.myData.ukprnAnswerTemp = req.session.myData.ukprnAnswerTemp || "12345678"
        }
        //
        // Validation
        //
        // Other selected

        // No UKPRN entered
        if(!req.session.myData.ukprnAnswerTemp) {
            req.session.myData.validationError = "true"
            req.session.myData.validationErrors.ukprnAnswer = {
                "anchor": "ukprn-1",
                "message": "Number not recognised. Check the number you've entered is correct or contact your training provider for help"
            }
        // if not valid (not a number, not 8 digits long)
        } else if(isNaN(req.session.myData.ukprnAnswerTemp) || req.session.myData.ukprnAnswerTemp.length != 8) {
            req.session.myData.validationError = "true"
            req.session.myData.validationErrors.ukprnAnswer = {
                "anchor": "ukprn-1",
                "message": "Number not recognised. Check the number you've entered is correct or contact your training provider for help"
            }
        // if not a match
        } else if(req.session.myData.ukprnAnswerTemp == "00000000"){
            req.session.myData.validationError = "true"
            req.session.myData.validationErrors.ukprnAnswer = {
                "anchor": "ukprn-1",
                "message": "Number not recognised. Check the number you've entered is correct or contact your training provider for help"
            }
        }

        // Next action
        if(req.session.myData.validationError == "true") {
            res.render(version + '/reserve-enter-provider', {
                myData: req.session.myData
            });
        } else {
            req.session.myData.ukprnAnswer = req.session.myData.ukprnAnswerTemp
            req.session.myData.ukprnAnswerTemp = ""

            // Selected Provider data
            req.session.myData.selectedProvider = {
                "name": "TRAINING UK",
                "id": req.session.myData.ukprnAnswer
            }

            res.redirect(301, '/' + version + '/reserve-confirm-provider-b');
        }
    });

    // Confirm provider
    router.get('/' + version + '/reserve-confirm-provider', function (req, res) {
        res.render(version + '/reserve-confirm-provider', {
            myData:req.session.myData
        });
    });

    // Confirm provider b (from manage)
    router.get('/' + version + '/reserve-confirm-provider-b', function (req, res) {
        res.render(version + '/reserve-confirm-provider-b', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/reserve-confirm-provider-b', function (req, res) {
        //Add provider to reservation
        var _reservation = returnReservationData(req, req.session.myData.selectedReservation)
        if(_reservation.item){
            _reservation.item.provider = "TRAINING UK"
            _reservation.item.provideractive = true
        }
        res.redirect(301, '/' + version + '/reserve-added-provider-confirmation');
    });

    // Provider added/changed confirmation
    router.get('/' + version + '/reserve-added-provider-confirmation', function (req, res) {
        res.render(version + '/reserve-added-provider-confirmation', {
            myData:req.session.myData
        });
    });

    // Delete provider
    router.get('/' + version + '/reserve-delete-provider', function (req, res) {
        req.session.myData.selectedReservation = req.query.reservation || req.session.myData.accounts[req.session.myData.account].reservations[0].id
        res.render(version + '/reserve-delete-provider', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/reserve-delete-provider', function (req, res) {
        // Answer
        // req.session.myData.deleteAnswerTemp = req.body.deleteAnswer
        //Set default answer if includeValidation is false and no answer given
        // if(req.session.myData.includeValidation == "false"){
        //     req.session.myData.deleteAnswerTemp = req.session.myData.deleteAnswerTemp || 'yes'
        // }
        // Validation
        // if(!req.session.myData.deleteAnswerTemp) {
        //     req.session.myData.validationError = "true"
        //     req.session.myData.validationErrors.deleteAnswer = {
        //         "anchor": "delete-1",
        //         "message": "[to do]"
        //     }
        // }
        // Next action
        // if(req.session.myData.validationError == "true") {
        //     res.render(version + '/reserve-delete-provider', {
        //         myData: req.session.myData
        //     });
        // } else {
            // req.session.myData.deleteAnswer = req.session.myData.deleteAnswerTemp
            // req.session.myData.deleteAnswerTemp = ""
            // if(req.session.myData.deleteAnswer == "yes"){
                //Delete provider from reservation
                var _reservation = returnReservationData(req, req.session.myData.selectedReservation)
                if(_reservation.item){
                    _reservation.item.provideractive = false
                }
                res.redirect(301, '/' + version + '/reserve-delete-provider-confirmation');
            // } else {
            //     res.redirect(301, '/' + version + '/reserve-reservations');
            // }
        // }
    });

    // Delete provider confirmation
    router.get('/' + version + '/reserve-delete-provider-confirmation', function (req, res) {
        res.render(version + '/reserve-delete-provider-confirmation', {
            myData:req.session.myData
        });
    });

    // Manage reservation
    router.get('/' + version + '/reserve-manage-reservation', function (req, res) {
        req.session.myData.selectedReservation = req.query.reservation || req.session.myData.accounts[req.session.myData.account].reservations[0].id
        var _reservation = returnReservationData(req, req.session.myData.selectedReservation)
        req.session.myData.selectedProvider = {
            "name": _reservation.item.provider,
            "id": returnProviderID(req,_reservation.item.provider)
        }
        res.render(version + '/reserve-manage-reservation', {
            myData:req.session.myData
        });
    });

    // Choose training (provider)
    router.get('/' + version + '/reserve-choose-training', function (req, res) {
        res.render(version + '/reserve-choose-training', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/reserve-choose-training', function (req, res) {
        // Answers
        req.session.myData.whichTrainingCourseAnswerTemp = req.body.whichTrainingCourseAnswer
        req.session.myData.whichTrainingStartDateAnswerTemp = req.body.whichTrainingStartDateAnswer

        //Set default answer if includeValidation is false and no answer given
        if(req.session.myData.includeValidation == "false"){
            req.session.myData.whichTrainingCourseAnswerTemp = req.session.myData.whichTrainingCourseAnswerTemp || req.session.myData.courses.list[0].value
            req.session.myData.whichTrainingStartDateAnswerTemp = req.session.myData.whichTrainingStartDateAnswerTemp || req.session.myData.startDates[0].id
        }
        // Validation - course
        if(!req.session.myData.whichTrainingCourseAnswerTemp) {
            req.session.myData.validationError = "true"
            req.session.myData.validationErrors.whichTrainingCourseAnswer = {
                "anchor": "whichTrainingCourse-1",
                "message": "Select a course"
            }
        }
        // Validation - start date
        if(!req.session.myData.whichTrainingStartDateAnswerTemp) {
            req.session.myData.validationError = "true"
            req.session.myData.validationErrors.whichTrainingStartDateAnswer = {
                "anchor": "whichTrainingStartDate-1",
                "message": "Select a start date"
            }
        }
        // Next action
        if(req.session.myData.validationError == "true") {
            res.render(version + '/reserve-choose-training', {
                myData: req.session.myData
            });
        } else {
            req.session.myData.whichTrainingCourseAnswer = req.session.myData.whichTrainingCourseAnswerTemp
            req.session.myData.whichTrainingStartDateAnswer = req.session.myData.whichTrainingStartDateAnswerTemp
            req.session.myData.whichTrainingCourseAnswerTemp = ""
            req.session.myData.whichTrainingStartDateAnswerTemp = ""
            res.redirect(301, '/' + version + '/reserve-check-answers-pro');
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
                var _reservationToAdd = {
                    "id": randomStr(10),
                    "startDate": req.session.myData.whichStartDateAnswer,
                    "course": req.session.myData.whichCourseAnswer,
                    "entity": req.session.myData.whichOrgAnswer,
                    "status": "available",
                    "visible": true
                }
                // TODO add provider info
                if(req.session.myData.addProvider == true) {
                    _reservationToAdd.provider = req.session.myData.selectedProvider.name
                    _reservationToAdd.provideractive = true
                }
                _account.reservations.unshift(_reservationToAdd)
                sortReservations(req)
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

    // Check answers (pro)
    router.get('/' + version + '/reserve-check-answers-pro', function (req, res) {
        res.render(version + '/reserve-check-answers-pro', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/reserve-check-answers-pro', function (req, res) {
        var _account = req.session.myData.accounts[req.session.myData.account],
            _selectedEmployerName = ""
        _account.employers.forEach(function(_employer, index) {
            if(req.session.myData.selectedEmployer == _employer.id) {
                _selectedEmployerName = _employer.name
            }
        });
        
        _account.reservations.unshift(
            {
                "id": randomStr(10),
                "startDate": req.session.myData.whichTrainingStartDateAnswer,
                "course": req.session.myData.whichTrainingCourseAnswer,
                "entity": _selectedEmployerName,
                "status": "available",
                "visible": true,
                "owned": true
            }
        )
        sortReservations(req)
        req.session.myData.reservationsadded = req.session.myData.reservationsadded + 1
        res.redirect(301, '/' + version + '/reserve-confirmation-pro');
    });

    // Confirmation
    router.get('/' + version + '/reserve-confirmation', function (req, res) {
        req.session.myData.whichOrgAnswer = req.session.myData.whichOrgAnswer || req.session.myData.accounts[req.session.myData.account].entities[0].id
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
            res.redirect(301, '/' + version + '/employer-home');
        }
    });

    // Confirmation (pro)
    router.get('/' + version + '/reserve-confirmation-pro', function (req, res) {
        
        res.render(version + '/reserve-confirmation-pro', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/reserve-confirmation-pro', function (req, res) {
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
            res.render(version + '/reserve-confirmation-pro', {
                myData: req.session.myData
            });
        } else {
            req.session.myData.whatNextAnswer = req.session.myData.whatNextAnswerTemp
            req.session.myData.whatNextAnswerTemp = ""
            // TODO multiple exit routes
            res.redirect(301, '/' + version + '/provider-home');
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
                if(req.session.myData.type == "pro"){
                    res.redirect(301, '/' + version + '/reserve-reservations-pro');
                } else {
                    res.redirect(301, '/' + version + '/reserve-reservations');
                }
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

    // Funding paused
    router.get('/' + version + '/reserve-funding-paused', function (req, res) {
        res.render(version + '/reserve-funding-paused', {
            myData:req.session.myData
        });
    });

    //No permission
    router.get('/' + version + '/reserve-no-permission', function (req, res) {
        res.render(version + '/reserve-no-permission', {
            myData:req.session.myData
        });
    });

    //Non EOI
    router.get('/' + version + '/reserve-non-eoi', function (req, res) {
        res.render(version + '/reserve-non-eoi', {
            myData:req.session.myData
        });
    });

    //  Errors 
    // 403
    router.get('/' + version + '/reserve-403', function (req, res) {
        res.render(version + '/reserve-403', {
            myData:req.session.myData
        });
    });
    // 404
    router.get('/' + version + '/reserve-404', function (req, res) {
        res.render(version + '/reserve-404', {
            myData:req.session.myData
        });
    });
    // 500
    router.get('/' + version + '/reserve-500', function (req, res) {
        res.render(version + '/reserve-500', {
            myData:req.session.myData
        });
    });

 };