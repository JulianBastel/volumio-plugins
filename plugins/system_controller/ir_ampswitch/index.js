'use strict';

var libQ = require('kew');
var fs=require('fs-extra');
var config = new (require('v-conf'))();
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;


module.exports = irAmpswitch;
function irAmpswitch(context)
{
	var self = this;

	this.context = context;
	this.commandRouter = this.context.coreCommand;
	this.logger = this.context.logger;
	this.configManager = this.context.configManager;

    self.logger.info("irAmpswitch");
    
}


irAmpswitch.prototype.onVolumioStart = function()
{
	var self = this;
	var configFile=this.commandRouter.pluginManager.getConfigurationFile(this.context,'config.json');
	this.config = new (require('v-conf'))();
	this.config.loadFile(configFile);
    
    self.logger.info("irAmpswitch.prototype.onVolumioStart");

    return libQ.resolve();
}


irAmpswitch.prototype.onStart = function() 
{
    var self = this;
	var defer=libQ.defer();

    self.logger.info("irAmpswitch.prototype.onStart");

	// Once the Plugin has successfull started resolve the promise
	defer.resolve();

    return defer.promise;
};

irAmpswitch.prototype.onStop = function() 
{
    var self = this;
    var defer=libQ.defer();
    
    self.logger.info("irAmpswitch.prototype.onStop");

    // Once the Plugin has successfull stopped resolve the promise
    defer.resolve();

    return libQ.resolve();
};

irAmpswitch.prototype.onRestart = function() 
{
    
    var self = this;
    // Optional, use if you need it
    self.logger.info("irAmpswitch.prototype.onRestart");
};


// Configuration Methods -----------------------------------------------------------------------------
irAmpswitch.prototype.saveOptions = function (data) 
{
	var self = this;
    
    self.logger.info("irAmpswitch.prototype.saveOptions");
    
    self.commandRouter.pushToastMessage('info', "saveOptions", "called saveOptions");
}


irAmpswitch.prototype.getUIConfig = function() 
{
    var defer = libQ.defer();
    var self = this;
    self.logger.info("irAmpswitch.prototype.getUIConfig");
        
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

irAmpswitch.prototype.getConfigurationFiles = function() 
{
    self.logger.info("irAmpswitch.prototype.getConfigurationFiles");
	return ['config.json'];
}

irAmpswitch.prototype.setUIConfig = function(data) 
{
	var self = this;
	//Perform your installation tasks here
    self.logger.info("irAmpswitch.prototype.setUIConfig");
};

irAmpswitch.prototype.getConf = function(varName) 
{
	var self = this;
	//Perform your installation tasks here
    self.logger.info("irAmpswitch.prototype.getConf");
};

irAmpswitch.prototype.setConf = function(varName, varValue) 
{
	var self = this;
	//Perform your installation tasks here
    self.logger.info("irAmpswitch.prototype.setConf");
};