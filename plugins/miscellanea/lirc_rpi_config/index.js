'use strict';

var libQ = require('kew');
var fs=require('fs-extra');
var config = new (require('v-conf'))();
var exec = require('child_process').exec;
var path = require('path');
var os = require('os');
var Gpio = require('onoff').Gpio;
var sleep = require('sleep');
var hwShutdown = false;
var shutdownCtrl, initShutdown;
var lircOverlayBanner = "#### RemotePi lirc setting below: do not alter ####" + os.EOL;


module.exports = lircRpiConfig;
function lircRpiConfig(context) 
{
    var self = this;

    this.context = context;
    this.commandRouter = this.context.coreCommand;
    this.logger = this.context.logger;
    this.configManager = this.context.configManager;

}



lircRpiConfig.prototype.onVolumioStart = function()
{
    var self = this;
    var configFile=this.commandRouter.pluginManager.getConfigurationFile(this.context,'config.json');
    this.config = new (require('v-conf'))();
    this.config.loadFile(configFile);

    return libQ.resolve();
}

lircRpiConfig.prototype.onStart = function() 
{
    var self = this;
    var defer=libQ.defer();


    // Once the Plugin has successfull started resolve the promise
    defer.resolve();

    return defer.promise;
};

lircRpiConfig.prototype.onStop = function() 
{
    var self = this;
    var defer=libQ.defer();

    // Once the Plugin has successfull stopped resolve the promise
    defer.resolve();

    return libQ.resolve();
};

lircRpiConfig.prototype.onRestart = function() 
{
    var self = this;
    // Optional, use if you need it
};


// Configuration Methods -----------------------------------------------------------------------------
lircRpiConfig.prototype.saveConfig = function(data) 
{
    var self = this;
    var responseData;
        
    self.logger.info("lircRpiConfig.prototype.saveConfig start");

    
    self.config.set("IRReceiver.enabled", data.IRReceiver);
    
    if(self.config.get("IRReceiver.pin") != data.IRReceiverGPIO.value)
    {
        self.logger.info("lircRpiConfig.prototype.saveConfig IRReceiver.pin change");
        self.config.set("IRReceiver.pin"    , data.IRReceiverGPIO.value);
    }
    

    self.config.set("IRSender.enabled", data.IRSender);
    self.config.set("IRSender.pin"    , data.IRSenderGPIO.value);

    self.logger.info("lircRpiConfig.prototype.saveConfig stop");
    
    self.commandRouter.pushToastMessage('success',"lircRpiConfig", "Configuration saved");
}




lircRpiConfig.prototype.getUIConfig = function() 
{
    var defer = libQ.defer();
    var self = this;
    self.logger.info("lircRpiConfig.prototype.getUIConfig start");
    
    var lang_code = this.commandRouter.sharedVars.get('language_code');

    self.commandRouter.i18nJson(
        __dirname+'/i18n/strings_'+ lang_code +'.json',
        __dirname+'/i18n/strings_en.json',
        __dirname + '/UIConfig.json'
        )
        .then(
                function(uiconf)
                {

                    
                    // Strings for config
                    uiconf.sections[0].content[0].value = self.config.get("IRReceiver.enabled");
                    uiconf.sections[0].content[1].value.value = self.config.get("IRReceiver.pin");
                    uiconf.sections[0].content[1].value.label = self.config.get("IRReceiver.pin").toString();

                    uiconf.sections[0].content[2].value = self.config.get("IRSender.enabled");
                    uiconf.sections[0].content[3].value.value = self.config.get("IRSender.pin");
                    //uiconf.sections[0].content[3].value.label = self.config.get("IRSender.pin").toString();
                    
                    
                    defer.resolve(uiconf);
                }
             )
        .fail(
                function()
                {
                    defer.reject(new Error());
                }
             );

    self.logger.info("lircRpiConfig.prototype.getUIConfig stop");
             
    return defer.promise;
};

lircRpiConfig.prototype.getConfigurationFiles = function() 
{
    return ['config.json'];
}

lircRpiConfig.prototype.setUIConfig = function(data) 
{
    var self = this;
    //Perform your installation tasks here
};

lircRpiConfig.prototype.getConf = function(varName) 
{
    var self = this;
    //Perform your installation tasks here
};

lircRpiConfig.prototype.setConf = function(varName, varValue) 
{
    var self = this;
    //Perform your installation tasks here
};


