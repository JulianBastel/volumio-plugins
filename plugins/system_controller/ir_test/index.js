'use strict';

var libQ = require('kew');
var fs=require('fs-extra');
var config = new (require('v-conf'))();
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;


module.exports = irTest;
function irTest(context)
{
	var self = this;

	this.context = context;
	this.commandRouter = this.context.coreCommand;
    self.commandRouter = this.context.coreCommand;
	this.logger = this.context.logger;
    self.logger = this.context.logger;
	this.configManager = this.context.configManager;
}


irTest.prototype.onVolumioStart = function()
{
	var self = this;
    self.logger.info("irTest.prototype.onVolumioStart");
    
	var configFile=this.commandRouter.pluginManager.getConfigurationFile(this.context,'config.json');
	this.config = new (require('v-conf'))();
	this.config.loadFile(configFile);

    return libQ.resolve();
}

irTest.prototype.onStart = function() 
{
    var self = this;
    self.logger.info("irTest.prototype.onStart");
    
	var defer=libQ.defer();


	// Once the Plugin has successfull started resolve the promise
	defer.resolve();

    return defer.promise;
};

irTest.prototype.onStop = function() 
{
    var self = this;
    self.logger.info("irTest.prototype.onStop");
    
    
    var defer=libQ.defer();

    // Once the Plugin has successfull stopped resolve the promise
    defer.resolve();

    return libQ.resolve();
};

irTest.prototype.onRestart = function() 
{
    var self = this;
    self.logger.info("irTest.prototype.onRestart");
    // Optional, use if you need it
};


// Configuration Methods -----------------------------------------------------------------------------

irTest.prototype.saveIROptions = function (data) 
{
	var self = this;
    self.logger.info("irTest.prototype.saveIROptions");
    
    self.commandRouter.pushToastMessage('info', "saveIROptions", "called saveIROptions");
}

irTest.prototype.getUIConfig = function() 
{
    var defer = libQ.defer();
    var self = this;
    self.logger.info("irTest.prototype.getUIConfig");
    
    
    var lang_code = this.commandRouter.sharedVars.get('language_code');

    self.commandRouter.i18nJson(__dirname+'/i18n/strings_'+lang_code+'.json',
        __dirname+'/i18n/strings_en.json',
        __dirname + '/UIConfig.json')
        .then(function(uiconf)
        {


            defer.resolve(uiconf);
        })
        .fail(function()
        {
            defer.reject(new Error());
        });

    return defer.promise;
};

irTest.prototype.getConfigurationFiles = function() 
{
    self.logger.info("irTest.prototype.getConfigurationFiles");
	return ['config.json'];
}

irTest.prototype.setUIConfig = function(data) 
{
	var self = this;
	//Perform your installation tasks here
    self.logger.info("irTest.prototype.setUIConfig");
};

irTest.prototype.getConf = function(varName) 
{
	var self = this;
	//Perform your installation tasks here
    self.logger.info("irTest.prototype.getConf");
};

irTest.prototype.setConf = function(varName, varValue)
{
	var self = this;
	//Perform your installation tasks here
    self.logger.info("irTest.prototype.setConf");
};
