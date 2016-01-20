/* Copyright (C) 2016, Jaguar Land Rover. All Rights Reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 

 */

var https = require('https');
var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var knex = require('knex')({
    client: 'mysql',
    connection: {
	host     : 'localhost',
	user     : 'username',
	password : 'password',
    }
});

var nodeName = "f-type";

var placesAPIKey = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';

var places = require('googleplaces-promises')(placesAPIKey);

//Provide valid SSL certificates for your server in the 'certs' directory. 
var sslOptions = {
  key: fs.readFileSync('certs/private-key.pem'),
  cert: fs.readFileSync('certs/certificate.pem')
};

var httpsServer = https.createServer(sslOptions,app);
httpsServer.listen(443,function(){console.log("Server listening.")});

app.use(bodyParser.json());

app.post('/',handleRequest);

function handleRequest(req,res){

    if(req.body.request.intent.name == undefined){
		alexaResponse.response.outputSpeech.text = "There was an error with Vehicle interaction";
		res.json(alexaResponse);
    }

    switch(req.body.request.intent.name){
    case "CarLocation":
		returnLocation(req,res);
	break;
    case "CarHVAC":
		manageClimate(req,res);
	break;
    }
}

function manageClimate(req,res){

    //add to the end of the endpoint: temp_right, temp_left    
    var nodeEndpoint = 'jlr.com/vin/'+nodeName+'/hvac/';

    //Add the value to set to at the end of this
    var nodeVal = "value=";
    nodeVal += req.body.request.intent.slots.temperature.value;

    var PythonShell = require('python-shell');

    var options = {
		mode: 'text',
		scriptPath: '/home/rvi/rvi_0.4.0/python/',
		args: [nodeEndpoint+"temp_left",nodeVal]
    };


    PythonShell.run('rvi_call.py', options, function (err, results) {
		if (err) throw err;
	  	// results is an array consisting of messages collected during execution                                     
		console.log('results: %j', results);
    });

    options.args = [nodeEndpoint+"temp_right",nodeVal];
    

    PythonShell.run('rvi_call.py', options, function (err, results) {
		if (err) throw err;
	  	// results is an array consisting of messages collected during execution                                     
		console.log('results: %j', results);
    });


    alexaResponse.response.outputSpeech.text = "I have set your vehicle's cabin temperature to "+req.body.request.intent.slots.temperature.value + " degrees";

    res.json(alexaResponse);
}


function returnLocation(req,res){

    var bigData;
    var placeInfo;

    //Get data from BigData DB 
    var query = knex.select('loc_time','loc_latitude','loc_longitude','loc_speed')
	.from('rvi.tracking_location')
	.orderBy('loc_time','desc')
	.limit(1);

    query.then(function(bd){
	bigData = bd;

	var location_ops = {
	    location:[
		bigData[0].loc_latitude, 
		bigData[0].loc_longitude
	    ],
	    radius : 305,
	    rankby: "prominence"
	}

	return places.placeSearch(location_ops);

    }).then(function(place_info){
		console.log(place_info);
		alexaResponse.response.outputSpeech.text = generateResponse(bigData[0],place_info.results);
		res.json(alexaResponse);
    });

}


//Replaces '&' with 'and', as '&' triggers SSML interpreting. 
function clearAmps(input){
    return input.replace("&","and");
}

function generateResponse(bdData, mapsData){

    var text = "Your vehicle is currently";
    
    text += " in "+mapsData[0].name + " near";
    text += " " + mapsData[1].name + ", " + mapsData[2].name + ", and " + mapsData[3].name + ".";  

    if(bdData.loc_speed > 0){
		text += " It is currently driving.";
    }else{
		text += " It is currently stopped.";
    }
    

    return text;
}

var alexaResponse = {
    "version": "1.0",
    "sessionAttributes": {},
    "response": {
	"outputSpeech": {
	    "type": "PlainText",
	    "text": "Your vehicle currently at "
	},
	"card": {
	    "type": "Simple",
	    "title": "Jaguar Land Rover RVI Demo",
	    "content": "The JLR RVI Demo was called. "
	},
	"reprompt": {
	    "outputSpeech": {
		"type": "PlainText",
		"text": "Can I help you with anything else?"
	    }
	},
	"shouldEndSession": true
    }
}



