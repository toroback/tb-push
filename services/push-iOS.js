var apn = require('apn');

let App;
let log;


class iOSPush{
  constructor(_app, config){
    App = _app;
    log = App.log.child({module:'iOSPush'});

    log.trace("ENTRA EN iOSPush");

    if(config){
      var cert = App.certsPath + config.cert;
      var passphrase = config.passphrase
      
      this.options = {};
      this.options.pfx = cert || null;
      this.options.passphrase = passphrase || null;
      this.options.production = config.production != null? config.production: true;

      this.topic = config.bundleId;

      log.debug(this.options);

      if(this.options.pfx){
        this.apnConnection = new apn.Provider(this.options);
        log.trace("New Connection")
      }
    }
  }

  sendPush(to, data) {
    return new Promise((resolve, reject) => {

      //var myDevice = new apn.Device(to);
      var note = new apn.Notification();
      note.retryLimit = -1;
      let connection = this.apnConnection;
      // console.log(to.toString('hex'));
      // note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
      if(data.badge != undefined)
        note.badge = data.badge;

      note.sound = data.sound;
      note.alert = data.alert;
      note.payload = data.payload;
      note.category = data.category;
      // log.trace(`category: &{data.category}`)
      // note.topic = "net.a2system.momentual";
      if(this.topic)
        note.topic = this.topic;

      if(data.threadId)
        note["thread-id"] = data.threadId;

      if(data.contentAvailabel != undefined)
        note.contentAvailabel = data.contentAvailabel;
      
      if(connection){
        let deviceTokens = [];
        deviceTokens.push(to);
        connection.send(note, deviceTokens)
          .then(response => {
            response.sent.forEach(token => {
              //notificationSent(user, token);
              resolve(handlerResultSend(token,true,null,note));
            });
            response.failed.forEach(failure => {
              if (failure.error) {
                // A transport-level error occurred (e.g. network problem)
                //notificationError(user, failure.device, failure.error);
                log.error(deviceTokens);
                log.error(failure);
                reject(new Error("network error"));
              } else {
                // `failure.status` is the HTTP status code
                // `failure.response` is the JSON payload
                //notificationFailed(user, failure.device, failure.status, failure.response);
                log.error(failure);
                reject(new Error(`Error Status: ${failure.status}, ${failure.response.reason}`));
              }
            });      
          })
      }else{
        reject(new Error("not apn conections"));
      }

    });
  }

}

function handlerResultSend(to, send, err, resp){
  var ret = null;
  if(send){
    ret = {id:to,resp:resp};
  }else{
    switch(err){
      case 2:
      case 5:
      case 7:
      case 8:
        ret = {id:to,error:{action:"no_retry"},resp:{error:err}}; 
      break;
      case 513:
        ret = {id:to,error:{action:"no_retry"},resp:{error:{status:err,msg:"certificate error"}}}; 
      break;
      default:

        ret = {id:to,error:{action:"retry"},resp:{error:err.toString()}};
      break;
    }
  }
  return ret;
}



module.exports = iOSPush;
