'use strict';

var libQ = require('kew');
var fs=require('fs-extra');
var config = new (require('v-conf'))();
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000');

//declare global status variable
var status = 'na';


module.exports = irAmpswitch;
function irAmpswitch(context)
{
    var self = this;

    this.context = context;
    this.commandRouter = this.context.coreCommand;
    this.logger = this.context.logger;
    this.configManager = this.context.configManager;
    
    // Setup Debugger
    self.logger.ASdebug = function(data) 
    {
        self.logger.info('[ASDebug] ' + data);
    };

    self.shutdown;
}


irAmpswitch.prototype.onVolumioStart = function()
{
    var self = this;
    var configFile = this.commandRouter.pluginManager.getConfigurationFile(this.context,'config.json');
    this.config = new (require('v-conf'))();
    this.config.loadFile(configFile);
    
    return libQ.resolve();
}


irAmpswitch.prototype.onStart = function() 
{
    var self = this;
    var defer = libQ.defer();
    
    // read and parse status once
    socket.emit('getState','');
    socket.once('pushState', self.parseStatus.bind(self));
    
    
    // listen to every subsequent status report from Volumio
    // status is pushed after every playback action, so we will be
    // notified if the status changes
    socket.on('pushState', self.parseStatus.bind(self));

    // Once the Plugin has successfull started resolve the promise
    defer.resolve();

    return defer.promise;
};

irAmpswitch.prototype.onStop = function() 
{
    var self = this;
    var defer=libQ.defer();

    // Once the Plugin has successfull stopped resolve the promise
    defer.resolve();

    return libQ.resolve();
};

irAmpswitch.prototype.onRestart = function() 
{
    var self = this;

};


// Configuration Methods -----------------------------------------------------------------------------
irAmpswitch.prototype.saveOptions = function(data)
{
    var self = this;
    self.logger.info("irAmpswitch.prototype.saveOptions");
    
    
    self.config.set('delay', data.delay_setting);
    
    self.commandRouter.pushToastMessage('info', "saveOptions", "called saveOptions");
}




// a pushState event has happened. Check whether it differs from the last known status and
// switch output port on or off respectively
irAmpswitch.prototype.parseStatus = function(state) 
{
    var self = this;
    var delay = self.config.get('delay');
    self.logger.ASdebug('irAmpswitch.prototype.parseStatus');
    
    
    self.logger.ASdebug('CurState: ' + state.status + ' PrevState: ' + status);

    clearTimeout(self.OffTimerID);
    if(state.status=='play' && state.status!=status)
    {
        status=state.status;
        self.config.get('latched')? self.pulse(self.config.get('on_pulse_width')) : self.on();
    } 
    else if((state.status=='pause' || state.status=='stop') && (status!='pause' && status!='stop'))
    {
                self.logger.ASdebug('InitTimeout - Amp off in: ' + delay + ' ms');
                self.OffTimerID = setTimeout
                (
                    function() 
                    {
                        status=state.status;
                        self.config.get('latched')? self.pulse(self.config.get('off_pulse_width')) : self.off();
                    }, 
                    delay
                );
    }
    
};

// switch outport port on
irAmpswitch.prototype.on = function() 
{
    var self = this;
    self.logger.ASdebug('irAmpswitch.prototype.on irsend send_once siemens KEY_POWER');

    self.logger.ASdebug('Togle GPIO: ON');
    
    exec
    (
        "usr/bin/irsend send_once siemens KEY_POWER", 
        {
          uid: 1000,
          gid: 1000
        },
        function (error, stdout, stderr) 
        {
            if(error)
            {
                self.logger.info('can not send command')
            }
        }
    );
};


//switch output port off
irAmpswitch.prototype.off = function() 
{
    var self = this;
    self.logger.ASdebug('irAmpswitch.prototype.off irsend send_once siemens KEY_POWER');
    
    exec
    (
        "usr/bin/irsend send_once siemens KEY_POWER", 
        {
          uid: 1000,
          gid: 1000
        },
        function (error, stdout, stderr) 
        {
            if(error)
            {
                self.logger.info('can not send command')
            }
        }
    );
};


irAmpswitch.prototype.getUIConfig = function() 
{
    var defer = libQ.defer();
    var self = this;
    self.logger.info("irAmpswitch.prototype.getUIConfig start");
        
    var lang_code = this.commandRouter.sharedVars.get('language_code');
    
    //var stdOut = execSync("/opt/squeezelite -l | grep '^\\s*[a-z]\\{2,10\\}:[A-Z]*=[a-z]*[A-Z,]\\{0,\\}\\(=[0-1]\\)\\{0,2\\}'").toString().split(/\r?\n/);

    //var stdOut = execSync("usr/bin/irsend list "" "" ").toString();

    
   // self.logger.info("irAmpswitch.prototype.getUIConfig:" + stdOut);
    

    self.commandRouter.i18nJson
    (
        __dirname+'/i18n/strings_'+lang_code+'.json',
        __dirname+'/i18n/strings_en.json',
        __dirname + '/UIConfig.json'
    )
    .then
    (
        function(uiconf)
        {
            uiconf.sections[0].content[0].value = self.config.get('delay');
            defer.resolve(uiconf);
        }
    )
    .fail
    (
        function()
        {
            defer.reject(new Error());
        }
    );

    self.logger.info("irAmpswitch.prototype.getUIConfig stop");
    
    return defer.promise;
};


irAmpswitch.prototype.getConfigurationFiles = function() 
{
    return ['config.json'];
}

irAmpswitch.prototype.setUIConfig = function(data) 
{
    var self = this;
    //Perform your installation tasks here
};


irAmpswitch.prototype.getConf = function(varName) 
{
    var self = this;
    //Perform your installation tasks here
};


irAmpswitch.prototype.setConf = function(varName, varValue) 
{
    var self = this;
    //Perform your installation tasks here
};
