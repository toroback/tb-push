
var AWS = require('aws-sdk');

let _defaultRegion = 'eu-central-1';

/*
EJEMPLO:
  "to":token,
  "data":{
    "alert":{
      "title":"Prueba appdemo",
      "body":"mensaje appdemo"
    },
    "defaultMessage":"Mensaje por defecto",
    "service":"ios_dev",
    "payload":{
      "text":"mensaje"
    }
    
  }
*/

/**
 * Servicio de envío de Pushes de Amazon
 * @private
 * @memberOf module:tb-push
 */
class AWSPush{

  /**
   * Crea una instancia del servicio de Amazon
   * @param  {Object} _app                          Objeto App de la aplicación
   * @param  {Object} options                       Objeto con las credenciales para el modulo
   * @param  {String} options.accessKeyId           Access key de Amazon
   * @param  {String} options.secretAccessKey       Clave secreta de Amazon
   * @param  {String} [options.region=eu-central-1] Región de uso del servicio de Amazon 
   */
  constructor(_app, options){
    App = _app;
    log = App.log.child({module:'AWSPush'});

    log.debug("ENTRA EN AWS");
    this.options = options;
    
    this.sns = new AWS.SNS({
      apiVersion: '2010-03-31',
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey, 
      region: options.region || _defaultRegion
    });
  }

  /**
   * Envia notificación push a través de Amazon a  del servicio seleccionado
   * @param {string} service                          Servicio a través del cual se enviará la notificación push (google|ios)
   * @param {Object} payload                          Objecto con información sobre el envio de la notificación
   * @param {string} payload.to                       Push_token al cual se envia la notificación.
   * @param {Object} payload.data                     Objecto que contiene el payload que se quiere enviar. 
   *                                                  NOTA: Si la notificación será enviada a un dispositivo Amazon completar data según la documentación de amazon: 
   *                                                  {@link https://developer.amazon.com/public/apis/engage/device-messaging/tech-docs/adm-sending-message}.    
   * @param {Object} payload.data.alert               Objeto con la información principal del push, como título y mensaje
   * @param {String} payload.data.alert.title         Título del push
   * @param {String} payload.data.alert.body          Mensaje del push
   * @param {String} [payload.data.icon]              Icono de la notificación
   * @param {Object} [payload.data.payload]           Objeto con información adicional 
   * @param {String} [payload.data.threadId]          ThreadId de la notificación
   * @param {String} [payload.data.badge]             (Sólo IOS) Contador que mostrar en el icono de la aplicacion 
   * @param {String} [payload.data.sound]             (Sólo IOS) El sonido a utilizar
   * @param {String} [payload.data.category]          (Sólo IOS) La categoría de la notificación
   * @param {Number} [payload.data.contentAvailable]  (Sólo IOS) Valor 1 para indicar que hay nuevo contenido disponible
   * @param {Number} [payload.data.service]           Subservicio soportado por amazon al que enviar la notificacion. Por defecto se utiliza 'adm'
   *                                                  (ios: iOS(Producción), ios_dev: iOS(Desarrollo), gcm: GoogleCloudMessage, adm: Amazon Device Messaging)
   * @param {Object} [payload.certId]                 Id del certificado que se va a utilizar.    
   * @return {Promise<Object>} Una promesa con el objeto push 
  */
  sendPush(to, payload) {
    return new Promise((resolve,reject) => { 
      send(this.sns, to, payload, this.options)
        .then(res => {
          log.debug(res);
          resolve(res);
        })
        .catch(reject);
    });
   
  }
}


function send(sns, to, data, options){
  return new Promise((resolve,reject) => { 
    if(!options){
      reject(App.err.badRequest("AWS push not configured"));
    }else{
      if(!data.service){
        reject(App.err.badRequest("AWS Service not specified - Add 'service' param to the data object"));
      }else{
        if(!options[data.service]){
          reject(App.err.badRequest("Service: " + data.service + " not configured"));
        }else{
          sns.createPlatformEndpoint({
            PlatformApplicationArn: options[data.service].platformApplicationArn,
            Token: to
          }, (err, res) => {
            if(err){
              reject(err);
            }else{
              let payload = createPayloadObject(data);
              sns.publish({
                Message: JSON.stringify(payload),
                MessageStructure: 'json',
                TargetArn: res.EndpointArn
              }, (err, data) =>{
                if (err) {
                  console.log(err.stack);
                  reject(handlerResultSend(to, null, err));
                }else{
                  console.log('push sent');
                  console.log(data);
                  resolve(handlerResultSend(to, data, null));
                }
              });
            }
          });
        }
      }
    }
  });
}


function createPayloadObject(data){
  let service = data.service || "adm";
  let payload = {};

  if(data.defaultMessage)
    payload.default = data.defaultMessage

  if(service == 'ios' || service == 'ios_dev'){
    //DOC: https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/CreatingtheNotificationPayload.html
    let APNS = {
      aps: data.alert ? {alert: data.alert} : {}
    }
    if(data.badge != undefined)
      APNS.aps.badge = data.badge;
    if(data.sound)
      APNS.aps.sound = data.sound;
    if(data.category)
      APNS.aps.category = data.category;
    if(data.contentAvailable != undefined)
      APNS.aps.contentAvailable = data.contentAvailable;
    if(data.threadId)
      APNS.aps["thread-id"] = data.threadId;

    Object.assign(APNS, data.payload);

    payload[service == 'ios' ? 'APNS' : 'APNS_SANDBOX'] = JSON.stringify(APNS);
  }else if(service == 'gcm'){
    //DOC: https://developers.google.com/cloud-messaging/concept-options#notifications_and_data_messages
    let GCM = {
      data: data.payload
    }

    if(data.icon || data.alert){
      var notification = data.alert || {};
      notification.icon = data.icon;
      GCM.notification = notification;
    }
    
    if(data.threadId)
      GCM["thread-id"]=data.threadId;
    
    payload.GCM = JSON.stringify(GCM);
    
  }else if(service == 'adm'){
    //DOC: https://developer.amazon.com/public/apis/engage/device-messaging/tech-docs/adm-sending-message
    payload.ADM = JSON.stringify({
      data: data.payload
    });
  }else if(service == 'mpns'){
    payload.MPNS = JSON.stringify({
      data: data.payload
    });
  }else if(service == 'wns'){
    payload.WNS = JSON.stringify({
      data: data.payload
    });
  }else if(service == 'baidu'){
    payload.BAIDU = JSON.stringify({
      data: data.payload
    });
  }

  console.log("-----> created payload", payload);
  return payload;
}


function handlerResultSend(to, resp, err){
  var ret = null;
  if (err){
     ret = {id:to,error:{action:"no_retry"},resp:{err:err}};
  }else{
     ret = {id:to,resp:resp};
  }
  
  return ret;
}



module.exports = AWSPush;