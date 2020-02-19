# AsoEbi-Server
## About this project ##

### What is Aso ebi collections platform? ###

Families usually help fund celebrating their life events through the culture of aso ebi (literally means clothes of the family).  The family chooses fabric (either locally made or imported, sometimes with the help of a fabric retailer or wholesaler). The chosen fabric is then sold at a much much higher price than purchase cost.

The culture of aso ebi spans across the various cultures of Nigeria. Events usually have fabric selected for male and female respectively; as well as for friends of parents and friends of the couple (in the case of weddings). Hence, an 
event may have up to 4 aso ebi, especially when any of the celebrants belong to societies and members of that group want to stand out from other party guests
Firstly, 

## Directory structure ##

```
.
+-- /api [Node.js backend using Express.js, Mongoose] 
|   +-- /config
|       +-- [config files to initialize the API, e.g. environment variables, db config or Express router]
|   +-- /controllers
|       +-- [Express controllers for the REST API]
|   +-- /mail-templates
|       +-- [hbs templates for default e-mails]
|   +-- /models
|       +-- [Mongoose models]
|   +--/validations
|       +--[Joy Validation]
|   +--/DB
|       +--[Database Connection]
|   +-- /services
|       +-- [Different general-purpose services/utils that can be used in controllers or other parts of the API when necessary. E.g. file operations, mailing, throwing errors, etc.]
|   +-- app.js [The main entry point where the app is started/initialized]
```

## Getting started ##

* Install a git client (like the git CLI)
* Install an IDE (like Visual Studio Code, Atom, WebStorm). Or use vim/emacs if you're hardcore. Visual Studio Code is recommended, because it has great commandline integration and Javascript building/debugging features. Manual compilation is also possible with the Gulp CLI.
* Install [NodeJS 10.16.0 or newer](https://nodejs.org/en/download/).
* Install [MongoDB 3.0.10](https://www.mongodb.com/download-center#community) (3.2.x does not have certain Aggregation features that the project needs, so it is not supported).
* Add `NODE_PATH` to environment variables with value `%AppData%\npm\node_modules`.
* Add `%AppData%\npm\` to the front of your `PATH` environment variable.
* Use your favorite git client to clone the repository.
* Enter the project folder and run the following commands to get all the right files in the right place.
