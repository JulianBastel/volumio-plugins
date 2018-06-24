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
lircRpiConfig.prototype.saveConfig = function() 
{
    var self = this;

    actions.forEach
    (
        function(action, index, array) 
        {
             // Strings for data fields
            var s1 = action.concat('Enabled');
            var s2 = action.concat('Pin');

            // Strings for config
            var c1 = action.concat('.enabled');
            var c2 = action.concat('.pin');
            var c3 = action.concat('.value');

            self.config.set(c1, data[s1]);
            self.config.set(c2, data[s2]['value']);
            self.config.set(c3, 0);
        }
    );

    self.clearTriggers().then(self.createTriggers());
    self.commandRouter.pushToastMessage('success',"lircRpiConfig", "Configuration saved");
}




lircRpiConfig.prototype.getUIConfig = function() 
{
    var defer = libQ.defer();
    var self = this;
    self.logger.info("lircRpiConfig.prototype.getUIConfig");
    
    var lang_code = this.commandRouter.sharedVars.get('language_code');

    self.commandRouter.i18nJson(
        __dirname+'/i18n/strings_'+lang_code+'.json',
        __dirname+'/i18n/strings_en.json',
        __dirname + '/UIConfig.json'
        )
        .then(
                function(uiconf)
                {
                    var i = 0;
                    actions.forEach(function(action, index, array) 
                    {
                         // Strings for config
                        var c1 = action.concat('.enabled');
                        var c2 = action.concat('.pin');
                        
                        // accessor supposes actions and uiconfig items are in SAME order
                        // this is potentially dangerous: rewrite with a JSON search of "id" value ?
                        uiconf.sections[0].content[2*i].value         = self.config.get(c1);
                        uiconf.sections[0].content[2*i+1].value.value = self.config.get(c2);
                        uiconf.sections[0].content[2*i+1].value.label = self.config.get(c2).toString();
                        i = i + 1;
                    });
                    defer.resolve(uiconf);
                }
        )
        .fail(function()
        {
            defer.reject(new Error());
        });

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



lircRpiConfig.prototype._searchTracks = function (results) {

};
