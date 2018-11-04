/**
 * Arborfield Cubs and Scouts
 * Lara Button 2018
 */
const AWSregion = 'eu-west-1';
const Beavers = "Beavers";
const Cubs = "Cubs";
const Scouts = "Scouts";
const AWS = require('aws-sdk');
var OSM = require('./osm');
var Config = require('./configuration');
var AmazonDateParser = require('amazon-date-parser');

AWS.config.update({
    region: AWSregion
});

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

var programme = {
};



/**
 * Emmas Thoughts is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var Scouting = function () {
    AlexaSkill.call(this, Config.APP_ID);
};

// Extend AlexaSkill
Scouting.prototype = Object.create(AlexaSkill.prototype);
Scouting.prototype.constructor = Scouting;

Scouting.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    //console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

Scouting.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    //console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    response.ask("you can ask first arborfield scouts what's happening today, this week, next week, tomorrow or on Friday, or, you can say stop or cancel");
};

/**
 * Overridden to show that a subclass can override this function to teardown session state.
 */
Scouting.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    //console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

Scouting.prototype.intentHandlers = {
    "cubs": function (intent, session, response) {
        handleScoutsRequest(intent, response);
    },

    "AMAZON.FallbackIntent": function (intent, session, response) {
        handleScoutsRequest(intent, response);
    },


    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("you can ask first arborfield scouts what's happening today, this week, next week, tomorrow or on a specific day, or, you can say stop or cancel");
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    }
};

function getNextDayOfWeek(orignalDate, dayOfWeek) {

    var resultDate = new Date(orignalDate);

    resultDate.setDate(orignalDate.getDate() + (7 + dayOfWeek - orignalDate.getDay()) % 7);

    return resultDate;
;}

/**
 * Notifies the user whats on at cubs at the next session
 */
function handleScoutsRequest(intent, response) {

    var section = Cubs;
    //work out which section it is
    if (intent.slots != null && intent.slots.section != null) {

        console.log("trying to find events for " + intent.slots.section.value);
        switch(intent.slots.section.value) {
            case "cubs":
                section = Cubs;
                break;
            case "beavers":
                section = Beavers;
                break;
            case "scouts":
                section = Scouts
                break;
        }
    } else {
        console.log("No section provided in intent - defaulting to cubs");
    }

    console.log("Selected section is " + section);

    var speechOutput = "I don't know";
    var cardContent = "I don't know";

    //load up the list of events
     OSM.authenticate(function(error) {

        if(error) {
            console.log("error authenticating with OSM: " + error);
            response.tellWithCard(speechOutput, Config.CARD_TITLE, cardContent);
        } else {
            console.log("authenticated");

           OSM.getProgramme(section, function(items, error) {

                if (error) {
                    console.log("error getting items: " + error);
                    produceOutput(response, speechOutput, cardContent);
                } else {
                    console.log("continuing...");
                    programme.items = items;
                    evaluateCalendar(section, intent, response);
                }                

            });
        }    
    });
   
}

function getRegularWeekday(section) {
    var weekday = 1;
    if (section === Cubs) {
        weekday = Config.CUBS_DAY;
    } else if (section === Beavers) {
        weekday = Config.BEAVERS_DAY;
    } else if (section === Scouts) {
        weekday = Config.SCOUTS_DAY;
    }
    return weekday;
}


function evaluateCalendar(section, intent, response) {

    console.log(JSON.stringify(programme));

    var speechOutput = "I don't know";
    var cardContent = "I don't know";

    var weekday = getRegularWeekday(section);

    //if there is not EventDate slot then assume they mean this week which, for cubs, is the next Friday
    var dateToCheck = getNextDayOfWeek(new Date(Date.now()), weekday);

    //check that it is a specific day, or a week
    if (intent.slots != null && intent.slots.EventDate != null && intent.slots.EventDate.value != null) {
        console.log("The date we received was " + intent.slots.EventDate.value);
        //try parsing it as a specific date
        dateToCheck = new Date(intent.slots.EventDate.value);
    } else {
        console.log("Defaulted the date as there was no slot");
    }
        
    console.log("requested date " + dateToCheck);
    if (dateToCheck != null && dateToCheck != NaN && dateToCheck != "NaN" && dateToCheck != "Invalid Date") {
        
        var month = dateToCheck.getMonth()+1;
        var monthText = "" + month;
        if( month < 10) {
            monthText = "0" + month;
        }
        var day = dateToCheck.getDate();
        var dayText = "" + day;
        if (day < 10) {
            dayText = "0" + day;
        }

        var formattedDate = dateToCheck.getFullYear() + "-" + monthText + "-" + dayText;
        console.log("requested date in format " + formattedDate);
        
        //needs to cope with special events such as camp or rememberance parade
        //for every event in the JSON
        var event = null;
        var foundAMatch = false;
        for (var counter = 0; counter < programme.items.length; counter++) {
            event = programme.items[counter];
            
            //check to see if the date matches the one requested
            if(formattedDate == event.meetingdate) {
                console.log("Found a match for the date");
                foundAMatch = true;
                //if it does then the speechoutput should be set to the event description

                console.log("Trying to say month " + monthText + " and day " + dayText);
                var mainText = "On " + "<say-as interpret-as='date'>????" + monthText + dayText + "</say-as> " + section + " have planned, " + event.title;
                cardContent = "Date: " + dayText+ "/" + monthText + "\n" + "Event: " + event.title;

                if(event.starttime != "00:00:00" && event.endtime != "00:00:00") {
                    mainText = mainText + " from " + "<say-as interpret-as='time'>" + event.starttime + "</say-as> until <say-as interpret-as='time'>" + event.endtime + "</say-as>";
                    cardContent = cardContent + "\nStart: " + event.starttime.substr(0, 5) + "\nEnd: " + event.endtime.substr(0,5) ;
                }

                if(event.notesforparents != null && event.notesforparents.length > 0) {
                    mainText = mainText + " Note: " + event.notesforparents + ".";
                    cardContent = cardContent + "\nNotes: " + event.notesforparents;
                }
                speechOutput = mainText;
                
                break;
            } 

            //if, at the end of the loop, no match is found, the speechoutput should say there are no events planned
            if(!foundAMatch) {
                speechOutput = "There are no events planned for the requested date.";
            }
        }

    } else if(dateToCheck === null || dateToCheck === NaN || dateToCheck == "NaN" || dateToCheck == "Invalid Date") {
        console.log("Is this a week? " +  dateToCheck);

        speechOutput = "I do not recognise that date.";

        //try converting it to a known week
        var parsedWeek = new AmazonDateParser(intent.slots.EventDate.value);

        if(parsedWeek != null && parsedWeek.startDate != null && parsedWeek.endDate != null) {
                console.log("About to look for events between " + parsedWeek.startDate + " and " + parsedWeek.endDate);

            //for each event in the JSON, turn the event date into a real date
            var foundAMatch = false;
            var collectionOfEvents = [];
            var countOfEvents = 0;
            for (var counter = 0; counter < programme.items.length; counter++) {

                    //check to see if that date falls between the start and the end of the requested week
                    var event = programme.items[counter];
                    var programmeDate = Date.parse(event.meetingdate);

                    if(programmeDate === null || programmeDate === NaN || programmeDate == "NaN" || programmeDate == "Invalid Date") {
                        console.log("could not parse date");
                    } else {
                        //if it does, add it to a collection of events
                        console.log("Checking date " + event.meetingdate);
                        if(programmeDate >= parsedWeek.startDate && programmeDate <= parsedWeek.endDate){
                            collectionOfEvents[countOfEvents] = event;
                            countOfEvents++;
                        }
                    }
            }

            //once you've built the collection of events
            console.log("Matched " + collectionOfEvents.length + "events");
            if(collectionOfEvents.length > 0) {
                cardContent = "";
                var mainText = "";
                //loop through them all and read them all out and also add a summary onto the card content
                for (var counter = 0; counter < collectionOfEvents.length; counter++) {
                    var event = collectionOfEvents[counter];
                    var eventDate = new Date(Date.parse(event.meetingdate));

                    //you might want to re-use the code from above for constructing the text and card content
                    var month = eventDate.getMonth()+1;
                    var monthText = "" + month;
                    if( month < 10) {
                        monthText = "0" + month;
                    }
                    var day = eventDate.getDate();
                    var dayText = "" + day;
                    if (day < 10) {
                        dayText = "0" + day;
                    }

                    if(mainText != "") {
                        mainText = mainText + ". ";
                    }
                    mainText = mainText + "On " + "<say-as interpret-as='date'>????" + monthText + dayText + "</say-as> " + section + " have planned, " + event.title;
                    cardContent = cardContent + "\n\nDate: " + dayText+ "/" + monthText + "\n" + "Event: " + event.title;

                    if(event.starttime != "00:00:00" && event.endtime != "00:00:00") {
                        mainText = mainText + " from " + "<say-as interpret-as='time'>" + event.starttime + "</say-as> until <say-as interpret-as='time'>" + event.endtime + "</say-as>";
                        cardContent = cardContent + "\nStart: " + event.starttime.substr(0, 5) + "\nEnd: " + event.endtime.substr(0,5) ;
                    }

                    if(event.notesforparents != null && event.notesforparents.length > 0) {
                        mainText = mainText + " Note: " + event.notesforparents;
                        cardContent = cardContent + "\nNotes: " + event.notesforparents;
                    }
                    
                }
                speechOutput = mainText;
            } else {
                console.log("no events have been found");
                speechOutput = "No events have been planned for the requested period - try asking for next week instead";
            }
        }
        //if it has got here then the date isn't a week either and we should probably give up!
    }

    produceOutput(response, speechOutput, cardContent);
}

function produceOutput(response, speakMe, showMe) {

    var speechOptions = {type: "SSML", speech: "<speak>" + speakMe + "</speak>"};
    response.tellWithCard(speechOptions, Config.CARD_TITLE, showMe);
}


// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    
    // Create an instance of the Emmas Thought skill.
    var thought = new Scouting();
    
    thought.execute(event, context);
};