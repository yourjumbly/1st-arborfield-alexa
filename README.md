# 1st-arborfield-alexa
Alexa skill for 1st Arborfield Scouts

Started life as a project for my 9yo cub, Lara, as part of her personal challenge.

This skill is a custom alexa skill using NodeJS with AWS Lambda and will make use of the Online Scout Manager (OSM) rest API to fetch the calendar of events.  For more details about OSM please see [https://www.onlinescoutmanager.co.uk](https://www.onlinescoutmanager.co.uk)

<h2>Pre-Requisites</h2>
To use the code in this skill you will need:-

<ol><li>An AWS account with an IAM role set up to allow your Lambda to execute. As a minimum your IAM role will need access to write to Cloudwatch Logs.</li>
  <li>An amazon developer account from (https://developer.amazon.com/) to create your custom skill.</li>
  <li>An OSM account with leader access which has been API enabled (request this from OSM support who wil provide you with an API id and token).</li>
<li>Tp have installed npm and have used it to fetch and install amazon-date-parser and request-promise. If you've done this then you should have a node_modules folder at the root of your development folder.

<pre><code>npm install amazon-date-parser</code></pre>
<pre><code>npm install request-promise</code></pre
</li></ol>

<h2>Alexa Skill Setup</h2>
To configure your Alexa skill you will need to define the following things when setting up your custom skill type inside the Amazon Developer Console:-
<ul>
<li>An invocation name</l>
<li>Sample utterances</li>
<li>Slot configuration (see below)</li>
<li>A Lambda endpoint set up in your AWS account using the code from this repository</li>
<li>A description, detailed description, privacy policy, logo and example utterances... without these you cannot get your skill published</li>
</ul>

Our alexa skill invocation name is "first arborfield scouts"
As well as the default intents, we created a custom intent called "cubs" (because originally we were just catering for cubs) which has a number of utterances:-
<ul>
  <li>what's happening {EventDate} at {section}</li>
  <li>what's the plan for {section}</li>
  <li>what's on the plan {section} {EventDate}</li>
  <li>what's on the plan {section}</li>
  <li>what's on {section} {EventDate}</li>
  <li>what's on {section}</li>
  <li>what's the plan for {section} {EventDate}</li>
  <li>what's happening at {section} {EventDate}</li>
  <li>what's on at {section} {EventDate}</li></ul>
    
You'll notice that we used a slot to govern the date. This means that people can ask for a specific date e.g. "on Friday" or "on the 22nd November" or they can ask for a period such as "this week" or "next week".  Currently the skill doesn't support months or seasons.</br>
  
We also created a custom slot called "section" which can be either "Cubs", "Beavers" or "Scouts".  One day soon we'll update the skill so that Alexa will prompt you if you forget to supply a value for that slot when you ask her.

<h2>AWS Lambda</h2>
The code to fetch the scouting events runs inside AWS Lambda using NodeJS 8.10.  

You'll need to create a custom Lambda and link it to your alexa skill using the alexa skill id.

Then you need to zip the code from this repository (and the node_modules folder) and upload the zip file into your Lambda.

Remember to change the following values in configuration.js before saving your Lambda:
<pre><code>
module.exports.APP_ID = "amzn1.ask.skill.&lt;your skill id here - get this from the amazon developer console&gt;";

module.exports.CARD_TITLE = "&lt;Your scout group name here&gt; SCOUTS GROUP EVENTS";

module.exports.BEAVERS_DAY = 1; //day of week on which Beavers is held - Sunday = 0, Monday = 1...
module.exports.CUBS_DAY = 5; //day of week on which Cubs is held - Sunday = 0, Monday = 1...
module.exports.SCOUTS_DAY = 1; //day of week on which Scouts is held - Sunday = 0, Monday = 1...

module.exports.CUBS_SECTION_ID = "&lt;OSM Section Id for Cubs&gt;";
module.exports.CUBS_CURRENT_TERM = "&lt;OSM term Id for the current Cubs term&gt;";

module.exports.BEAVERS_SECTION_ID = "&lt;OSM Section Id for Beavers&gt;";
module.exports.BEAVERS_CURRENT_TERM = "&lt;OSM term Id for the current Beavers term&gt;";

module.exports.SCOUTS_SECTION_ID = "&lt;OSM Section Id for Scouts&gt;";
module.exports.SCOUTS_CURRENT_TERM = "&lt;OSM term Id for the current Scouts term&gt;";

module.exports.OSM_APP_ID = "&lt;OSM App Id - contact OSM Support for your Id&gt;";
module.exports.OSM_TOKEN = "&lt;OSM token - contact OSM support for yours&gt;";
module.exports.OSM_EMAIL_ID = "&lt;OSM email address for the token and appid above&gt;";
module.exports.OSM_PASSWORD = "&lt;OSM password for the email above&gt;";
</code></pre>

You can test your skill from within the amazon developer console. Here you can copy the JSON that it generates and feed it directly into your Lambda as test events, should you need to.  
  
  <h2>Ideas for the future</h2>
  <li>Tidy up the repeated code when checking dates</li>
  <li>Use JQuery or equivalent to find events within the JSON response from OSM</li>
  <li>Speed things up by removing some of the log statements</li>
  <li>Apply conversation to ask what day someone is interested in? or whether they are interested in cubs/scouts/beavers</li>
  </ul>
  
