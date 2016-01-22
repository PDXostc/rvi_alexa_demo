Amazon Echo RVI Demo
--------------------

The Amazon Echo RVI demo is a method of demoing interaction using an Amazon Echo to interact with RVI services.

Two demos are currently included:
 - HVAC temperature adjustment
 - Vehicle location with relative points-of-interest provided by the Google Places API.

The service is written in Javascript supported by NodeJS using third-party modules.


How it works
------------
Node creates an https server which Amazon Echo Requests are sent to - the service running on the box handles the request and interacts with RVI services, then generates a response that is sent back to the echo.

The Vehicle location demo accesses the BigData database and fetches the most recent vehicle latitude and longitude, and calls Google's Places API to get the vehicle's colloquial position as well as 3 nearby location names. It then returns those names in a phrase to the echo to be spoke.

The HVAC Temperature demo receives the specified temperature and passes the value onto a local python script which sets and sends RVI the appropriate message - updating the HVAC system's temperature. In the future we hope to have NodeJS send RVI messages directly.

Dependencies
------------

- An Amazon Echo
- A Working RVI installation
- An SSL certificate - Amazon requires this

The following NodeJS modules are used and included in the package.json file.

* express
* googleplaces-promises
* knex
* python-shell
* body-parser

```npm install``` to install them.

Requirements
------------
Setting up an Amazon Echo demo requires several interacting pieces.

Intents
-------
Amazon Echo Skills use *Intents* to define the incoming data from the voice request, and how to interpret it before sending to the web service. [See the Amazon documentation](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/defining-the-voice-interface#The Intent Schema) for more details

```
{
  "intents": [
    {
      "intent": "CarLocation",
      "slots": [
      ]
    },
    {
     "intent": "CarHVAC",
     "slots": [
        {
          "name":"temperature",
          "type":"TEMPERATURES"
        },
        {
          "name":"fanSpeed",
          "type":"AMAZON.NUMBER"
        },
        {
          "name":"seatHeaterLevel",
          "type":"LIST_OF_LEVELS"
        }
      ]
    }
  ]
}

```

Custom Slot Types
-----------------

For the Temperature
#### TEMPERATURES
```
fifteen
sixteen
seventeen
eighteen
nineteen
twenty
twenty one
twenty two
twenty three
twenty four
twenty five
twenty six
twenty seven
twenty eight
twenty nine
twenty thirty
```

For the Fan
#### LIST_OF_LEVELS

```
high
medium
low
off
```


Utterances
----------
Amazon Echo Skills are activated using *utterances*, which are tied to an intent. [See the Amazon documentation](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/defining-the-voice-interface#The Sample Utterances File)


```
CarLocation where it is.
CarLocation what it's location is
CarLocation where it's located
CarLocation where it is located

CarHVAC set cabin temperature to {temperature}
CarHVAC set cabin temperature to {temperature} degrees
CarHVAC set temperature to {temperature}
CarHVAC set temperature to {temperature} degrees
```
