module.exports = function (router,_myData) {

    var version = "1-0";

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

    // Your reservations
    router.get('/' + version + '/funding-reservations', function (req, res) {
        res.render(version + '/funding-reservations', {
            myData:req.session.myData
        });
    });

    // Start
    router.get('/' + version + '/funding-start', function (req, res) {
        res.render(version + '/funding-start', {
            myData:req.session.myData
        });
    });

    // Choose organisation
    router.get('/' + version + '/funding-choose-org', function (req, res) {
        res.render(version + '/funding-choose-org', {
            myData:req.session.myData
        });
    });
    router.post('/' + version + '/funding-choose-org', function (req, res) {
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
            res.render(version + '/funding-choose-org', {
                myData: req.session.myData
            });
        } else {
            req.session.myData.whichOrgAnswer = req.session.myData.whichOrgAnswerTemp
            res.redirect(301, '/' + version + '/funding-choose-course');
        }
    });

    // Choose course
    router.get('/' + version + '/funding-choose-course', function (req, res) {
        res.render(version + '/funding-choose-course', {
            myData:req.session.myData
        });
    });


 };

