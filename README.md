# 1st-arborfield-alexa
Alexa skill for 1st Arborfield Scouts

Started life as a project for my 9yo cub, Lara, as part of her personal challenge.

This skill is a custom alexa skill using NodeJS with AWS Lambda and will make use of the Online Scout Manager (OSM) rest API to fetch the calendar of events.  For more details about OSM please see [https://www.onlinescoutmanager.co.uk](https://www.onlinescoutmanager.co.uk)

<h2>Pre-Requisites</h2>
To use the code in this skill you will need:-

<ol><li>An AWS account with an IAM role set up to allow your Lambda to execute</li>
  <li>You will need an amazon developer account from (https://developer.amazon.com/) to create your custom skill.</li>
  <li>An OSM account with leader access which has been API enabled (request this from OSM support who wil provide you with an API id and token)</li>
<li>Install npm and have used it to fetch and install amazon-date-parser

<pre><code>npm install amazon-date-parser</code></pre></li></ol>

<h2>Usage</h2>



Our alexa skill invocation name is "first arborfield scouts"
As well as the default intents, we created a custom intent called "cubs" which has three utterances:-
<ul><li>what's the plan for cubs {EventDate}</li>
  <li>what's happening at cubs {EventDate}</li>
  <li>what's on at cubs {EventDate}</li></ul>
  
  You'll notice that we used a slot to govern the date. This means that people can ask for a specific date e.g. "on Friday" or "on the 22nd November" or they can ask for a period such as "this week" or "next week".  Currently the skill doesn't support months or seasons.
  
  
  <h2>Ideas for the future</h2>
  <ul><li>Turn beavers/cubs/scouts into a slot so we can support all three, not just cubs</li>
  <li>Apply conversation to ask what day someone is interested in? or whether they are interested in cubs/scouts/beavers</li>
  </ul>
  
