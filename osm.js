/**
 * Arborfield Cubs and Scouts
 * Lara Button 2018
 */
var request = require('request-promise'); // "Request" library
var Config = require('./configuration');

const OSM_BASE_URL = "https://www.onlinescoutmanager.co.uk/";

var UserId = null;
var Secret = null;

var authenticate = function(callback) {

    // requesting access token from refresh token
    let authOptions = {
        url: OSM_BASE_URL + "users.php?action=authorise",
        form: {
          apiid: Config.OSM_APP_ID,
          token: Config.OSM_TOKEN,
          email: Config.OSM_EMAIL_ID,
          password: Config.OSM_PASSWORD
        },
        json: true
       };

    console.log("sending authentication request to " + OSM_BASE_URL + "users.php?action=authorise");

    request.post(authOptions).then((body) => {
        console.log("got response from authorise endpoint");
        if (body) {
            UserId = body.userid;
            Secret = body.secret;
            console.log ('UserId is ' + UserId + " and secret is " + Secret);
            callback(null);
        } else {
            console.log('Unable to get user id and secret, body is null. ');
            callback("No body");
        }
    })
    .catch((error) => {
        console.log('Unable to authorise access with OSM: ' + error);
        callback(error);
    });
};

var getProgramme = function(section, callback) {

    var sectionId = Config.CUBS_SECTION_ID;
    var termId = Config.CUBS_CURRENT_TERM;

    if(section === "Beavers") {
        sectionId = Config.BEAVERS_SECTION_ID;
        termId = Config.BEAVERS_CURRENT_TERM;
    } else if(section === "Scouts") {
        sectionId = Config.SCOUTS_SECTION_ID;
        termId = Config.SCOUTS_CURRENT_TERM;
    }

    console.log("Sending request for GetProgrammeSummary to OSM with userId " + UserId + ", secret " + Secret + ", sectionId " + sectionId + " and termId " + termId);

    var options = {
        url: OSM_BASE_URL + "ext/programme/?action=getProgrammeSummary&sectionid=" + sectionId + "&termid=" + termId,
        form: {
            "apiid": Config.OSM_APP_ID,
            "token": Config.OSM_TOKEN,
            "secret": Secret,
            "userid": UserId
        },
        json: true
      };

      console.log("Sending request to " + options.url);

    request.post(options).then(function(body) {
        console.log("got response from getProgrammeSummary");
        if (body) {
            console.log ('got response from programme; number of items is ' + body.items.length);
            callback(body.items, null);
        } else {
            console.log('Unable to get programme.');
            callback(null, "No body");
        }
    }).catch(function (error) {
        console.log('Unable to get programme: ' + error);
        callback(null, error);
    });

};

module.exports.authenticate = authenticate;
module.exports.getProgramme = getProgramme;