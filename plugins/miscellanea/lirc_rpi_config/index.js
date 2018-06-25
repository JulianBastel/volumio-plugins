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
    self.config.set("IRSender.enabled", data.IRSender);
    
    if( ((self.config.get("IRReceiver.pin") != data.IRReceiverGPIO.value) && (data.IRReceiver)) || ((self.config.get("IRSender.pin") != data.IRSenderGPIO.value) && (data.IRSender)))
    {
        self.logger.info("lircRpiConfig.prototype.saveConfig pin change");
                
        self.config.set("IRReceiver.pin"    , data.IRReceiverGPIO.value);
        self.config.set("IRSender.pin"      , data.IRSenderGPIO.value);
        self.writeBootStr(data);
        responseData = 
        {
            title: self.commandRouter.getI18nString("PLUGIN_NAME"),
            message: self.commandRouter.getI18nString("REBOOT_MSG"),
            size: "lg",
            buttons: 
            [
                {
                    name: self.commandRouter.getI18nString("COMMON.RESTART"),
                    class: "btn btn-default",
                    emit: "reboot",
                    payload: ""
                },
                {
                    name: self.commandRouter.getI18nString("COMMON.CONTINUE"),
                    class: "btn btn-info",
                    emit: "callMethod",
                    payload: {"endpoint":"miscellanea/lirc_rpi_config", "method":"closeModals"}
                }
            ]
        }
        self.commandRouter.broadcastMessage("openModal", responseData);
    }
    else 
    {
        self.commandRouter.pushToastMessage("info", self.commandRouter.getI18nString("PLUGIN_NAME"), self.commandRouter.getI18nString("NO_CHANGES"));
    }
    



    self.logger.info("lircRpiConfig.prototype.saveConfig stop");
    
    self.commandRouter.pushToastMessage('success',"lircRpiConfig", "Configuration saved");
}


lircRpiConfig.prototype.closeModals = function() 
{
    var self = this;

    self.commandRouter.closeModals();
};



// The functions "writeBootStr" and "rmBootStr" are derived from "writeI2SDAC" and "disableI2SDAC" of
// Volumio's i2s_dacs plugin; many thanks to its coders for the inspiration

lircRpiConfig.prototype.writeBootStr = function(data) 
{
    var self = this;
    var gpioOut = "gpio_out_pin=";
    var gpioIn  = "gpio_in_pin=";
    
    var bootstring = "dtoverlay=lirc-rpi";
    var searchexp = new RegExp(lircOverlayBanner + "dtoverlay=.*" + os.EOL);
    var configFile = "/boot/config.txt";
    var newConfigTxt;

    self.logger.info("lircRpiConfig.prototype.writeBootStr start");
    
    if (data.IRReceiver) 
    {
        bootstring =  bootstring.concat(",gpio_in_pin=" + data.IRReceiverGPIO.value.toString());
    }
    
    if (data.IRSender) 
    {
        bootstring =  bootstring.concat(",gpio_out_pin=" + data.IRSenderGPIO.value.toString());
    }

    bootstring =  bootstring.concat(os.EOL);
    
    
    fs.readFile
    (   
        configFile, 
        "utf8", 
        function (error, configTxt) 
        {
            if (error) 
            {
                self.logger.error("Error reading " + configFile + ": " + error);
                self.commandRouter.pushToastMessage("error", self.commandRouter.getI18nString("PLUGIN_NAME"), self.commandRouter.getI18nString("ERR_READ") + configFile + ": " + error);
            } 
            else 
            {
                newConfigTxt = configTxt.replace(searchexp, lircOverlayBanner + bootstring);
                if (configTxt == newConfigTxt && configTxt.search(lircOverlayBanner + bootstring) == -1) 
                {
                    newConfigTxt = configTxt + os.EOL + lircOverlayBanner + bootstring + os.EOL;
                }
                fs.writeFile(configFile, newConfigTxt, "utf8", function (error) 
                {
                    if (error) 
                    {
                        self.logger.error("Error writing " + configFile + ": " + error);
                        self.commandRouter.pushToastMessage("error", self.commandRouter.getI18nString("PLUGIN_NAME"), self.commandRouter.getI18nString("ERR_WRITE") + configFile + ": " + error);
                    }
                });
            }
        }
    );
    
    self.logger.info("lircRpiConfig.prototype.writeBootStr stop");
};





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
                    uiconf.sections[0].content[3].value.label = self.config.get("IRSender.pin").toString();
                    
                    
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


