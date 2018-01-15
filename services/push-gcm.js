var request = require('request');

let App;
let log;

/**
 * Servicio de envío de Pushes de Google
 * @private
 * @memberOf module:tb-push
 */
class GCMPush{

  /**
   * Crea una instancia del servicio de GoogleCloudMessage
   * @param  {Object} _app              Objeto App de la aplicación
   * @param  {Object} options           Objeto con las credenciales para el servici
   * @param  {String} options.serverKey    Clave de Api de GCM
   * @param  {String} options.url       Url de envio de notificaciones de GCM
   */
  constructor(_app, options){
    App = _app;
    log = App.log.child({module:'GCMPush'});
    log.debug("ENTRA EN GCM");
    this.options = options;
  }

  /**
   * Envia notificación push a través del servicio seleccionado
   * @param {string} service                          Servicio a través del cual se enviará la notificación push (google|ios)
   * @param {Object} payload                          Objecto con información sobre el envio de la notificación
   * @param {string} payload.to                       Push_token al cual se envia la notificación.
   * @param {Object} payload.data                     Objecto que contiene el payload que se quiere enviar.   
   * @param {Object} payload.data.alert               Objeto con la información principal del push, como título y mensaje
   * @param {String} payload.data.alert.title         Título del push
   * @param {String} payload.data.alert.body          Mensaje del push
   * @param {String} [payload.data.icon]              Icono de la notificación
   * @param {Object} [payload.data.payload]           Objeto con información adicional 
   * @param {String} [payload.data.threadId]          ThreadId de la notificación
   * @return {Promise<Object>} Una promesa con el objeto push 
  */
  sendPush(to, payload) {
    log.debug("sendPushRetry GMC");
    return new Promise((resolve,reject) => {
      send(to,payload,this.options)
        .then(res => {
          log.debug(res);
          if(res.error && res.error.action == "retry"){
            log.trace("primer reintento");
            sendDelayed(to,payload,this.options, 1000)
              .then(res => {
                if(res.error && res.error.action == "retry"){
                  log.trace("segundo reintento");
                  sendDelayed(to,payload,this.options, 2000)
                    .then(res => {
                      if(res.error && res.error.action == "retry"){
                        log.trace("tercer reintento");
                        sendDelayed(to,payload,this.options, 4000)
                          .then(resolve)
                          .catch(reject);
                      }else{
                        resolve(res);
                      }
                    });
                }else{
                  resolve(res);
                }
              });
          }else{
            resolve(res);
          }
        })
        .catch(reject);
    });
  }

}

function handlerResultSend(to, status, resp){
  var ret = null;
  log.trace("handlerResultSend");
  if(status == 200){
    if(resp.results){ 
      // for(var i = 0; i<results.length; i++){
        if(resp.results[0].error){
          switch(resp.results[0].error){
            case "NotRegistered":
            case "InvalidRegistration":
              ret = {id:to,error:{action:"del"},resp:resp.results[0]};
            break;
            case "Unavailable":
            case "InternalServerError":
            case "DeviceMessageRateExceeded":
              ret = {id:to,error:{action:"retry"},resp:resp};
            break;
            default:
              ret = {id:to,error:{action:"no_retry"},resp:resp};
            break;
          }
          
        }else{
          ret = {id:to,resp:resp.results[0]};
        }
      // }
    }else{
      ret = {id:to,error:{action:"no_retry"},resp:resp};
    }
  }else if(status == 400 || status == 401){
    
    ret = {id:to,error:{action:"no_retry"},resp:{msg:resp,status:status}};
    
  }else if(status >= 500){
    // ids.forEach(function(elem){
      ret = {id:to,error:{action:"retry"},resp:{msg:resp,status:status}};
    // });
  }else{
    ret = {id:to,error:{action:"no_retry"},resp:{msg:resp,status:500}};
  }
  return ret;
}

function send(to, data, options){
  log.trace("entra en send function");
  return new Promise((resolve, reject) => {
    log.debug(data);
    var payload = {
      data: data.payload,
      to:to
    };

    if(data.icon || data.alert){
      var notification = data.alert || {};
      notification.icon = data.icon;
      payload.notification = notification;
    }

    if(data.threadId)
      payload["thread-id"] = data.threadId;
      
    log.debug(payload);
    var headers = {
      'Authorization':'key='+options.serverKey,
      'Content-Type':'application/json;charset=UTF-8'
    };
    log.debug(headers);
    var req = request({
      headers: headers,
      json:true,
      uri: options.url,
      body: payload,
      method: 'POST'
    }, function (err, res, body) {
      if(err){
        resolve(handlerResultSend(to,null,err));
      }else{
        resolve(handlerResultSend(to,res.statusCode,body));
      }
    });
  });
}

function sendDelayed(to, data, options, delay){
  return new Promise((resolve,reject) => {
    setTimeout(arg => {
      send(to,data,options)
        .then(resolve)
        .catch(reject);
    }, delay);
  });
}


module.exports = GCMPush;