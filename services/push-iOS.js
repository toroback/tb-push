var apn = require('apn');

let App;
let log;

/**
 * Servicio de envío de notificaciones Push de Apple
 * @private
 * @memberOf module:tb-push
 */
class iOSPush{

   /**
   * Crea una instancia del servicio de Apple
   * @param  {Object} _app                  Objeto App de la aplicación
   * @param  {Object} config                Objeto con las credenciales para el servicio
   * @param  {String} config.cert           Path, relativo a la carpeta "cert", del certificado de push de Apple 
   * @param  {String} config.passphrase     Contraseña para el certificado 
   * @param  {String} config.production     Indica si el certificado es de producción o no
   * @param  {String} config.bundleId       BundleId del proyecto de iOS
   */
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


      if(this.options.pfx){
        this.apnConnection = new apn.Provider(this.options);
        log.trace("New Connection")
      }
    }
  }

  /**
   * Envia una notificación push
   * @param  {String}  to                       Device token al que enviar la notificación
   * @param  {Object}  data                     Objeto con la toda información del push
   * @param  {Object}  data.alert               Objeto con la información principal del push, como título y mensaje
   * @param  {String}  data.alert.title         Título del push
   * @param  {String}  data.alert.body          Mensaje del push
   * @param  {Object}  [data.payload]           Objeto con información adicional 
   * @param  {String}  [data.badge]             Contador que mostrar en el icono de la aplicacion 
   * @param  {String}  [data.sound]             El sonido a utilizar
   * @param  {String}  [data.category]          La categoría de la notificación
   * @param  {String}  [data.threadId]          ThreadId de la notificación
   * @param  {Number}  [data.contentAvailable]  Valor 1 para indicar que hay nuevo contenido disponible
   * @return {Promise<Object>}    Promesa con el resultado del envío
   */
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

      if(this.topic)
        note.topic = this.topic;

      if(data.threadId)
        note.threadId = data.threadId;

      if(data.contentAvailable != undefined)
        note.contentAvailable = data.contentAvailable;
      
      if(connection){
        let deviceTokens = [];
        deviceTokens.push(to);
        connection.send(note, deviceTokens)
          .then(response => {
            log.debug(response);
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
                reject(failure.error);
              } else {
                // `failure.status` is the HTTP status code
                // `failure.response` is the JSON payload
                //notificationFailed(user, failure.device, failure.status, failure.response);
                log.error(failure);
                resolve(handlerResultSend(failure.device, false, failure.status, failure.response));
              }
            });      
          })
      }else{
        reject(new Error("not apn conections"));
      }

    });
  }

}

/**
 * Maneja el resultado del envío del push
 * @private
 * @param  {String} to       Device Token del push
 * @param  {Boolean} sent    Indica si el push se envió o no
 * @param  {Number} errCode  Status del envío
 * @param  {Object} resp     Objeto con el resultado del envío
 * @return {Object}      Objeto con información tras procesar el resultado del envío
 */
function handlerResultSend(to, sent, errCode, resp){
  var ret = null;
  if(sent){
    ret = {id:to,resp:resp};
  }else{
    switch(errCode){

      case 410:
        ret = {id:to,error:{action:"del"},resp:{error:{status:errCode,msg:resp.reason}}}; 
      break;
      default:

        ret = {id:to,error:{action:"no_retry"},resp:{error:{status:errCode,msg:resp.reason}}};
      break;
    }
  }
  return ret;
}


module.exports = iOSPush;
