
var express = require('express');
var router  = express.Router();
var push    = require('./index.js');

let log;

/**
 * @module tb-push/routes
 */
function setupRoutes(App){

  log = App.log.child({module:'pushRoute'});

  //middleware de la ruta especifica
  router.use(function(req, res, next){
    req._ctx['service']  = "push";
    req._ctx['resource']  = req.query.service;
    next();
  });

  /** 
   * Envia una notificacion push por el servicio indicado
   *
   * @name  Send Push
   * 
   * @route {POST} srv/push/send
   *
   * @queryparam {String} [service] Servicio por el que enviar el push. (Ej. "service=google")
   * @queryparam {String} client Nombre de la aplicacion cliente por el que enviar el push. (Ej. "client=myapp")
   * @queryparam {String} platform Plataforma de la aplicacion cliente por el que enviar el push. ("ios", "android") (Ej. "platform=ios")
   *
   * @bodyparam   {String}  to                       Token al que se va a enviar el push
   * @bodyparam   {Object}  data                     Objeto con la toda información del push
   * @bodyparam   {Object}  data.alert               Objeto con la información principal del push, como título y mensaje
   *                                                 NOTA: Si la notificación será enviada a un dispositivo Amazon completar data según la documentación de amazon: 
   *                                                 {@link https://developer.amazon.com/public/apis/engage/device-messaging/tech-docs/adm-sending-message}.   
   * @bodyparam   {String}  data.alert.title         Título del push
   * @bodyparam   {String}  data.alert.body          Mensaje del push
   * @bodyparam   {String}  [data.icon]              Icono de la notificación
   * @bodyparam   {Object}  [data.payload]           Objeto con información adicional 
   * @bodyparam   {String}  [data.threadId]          ThreadId de la notificación
   * @bodyparam   {String}  [data.badge]             (Sólo IOS) Contador que mostrar en el icono de la aplicacion 
   * @bodyparam   {String}  [data.sound]             (Sólo IOS) El sonido a utilizar
   * @bodyparam   {String}  [data.category]          (Sólo IOS) La categoría de la notificación
   * @bodyparam   {Number}  [data.contentAvailable]  (Sólo IOS) Valor 1 para indicar que hay nuevo contenido disponible
   * @bodyparam   {Number}  [data.service]           (Sólo Amazon) Subservicio soportado por amazon al que enviar la notificacion. Por defecto se utiliza 'adm'
   *                                                 (ios: iOS(Producción), ios_dev: iOS(Desarrollo), gcm: GoogleCloudMessage, adm: Amazon Device Messaging)
   * @bodyparam   {String}  [certId]                 Id del certificado a usar ("development"|"production")
   * 
   * @example
   * 
   * POST http://localhost:4500/api/v1/srv/push/send?service=google 
   * DATOS:
   *   {
   *     "to":"APA91bHSfs1jg_vXpTGvaHkdYVKPHfJSDB_EpGfGJFzzDRIIMaBHR1Jiq5v8Z8RX_stmGy1mx2evmcLpeZgXoQEp-ba9KD975_IlydJ-hq0dDfpNqxuc40YqNjvrasYdXXXXXXXXXXXX",
   *     "data":{
   *       "alert":{
   *         "title":"titulo alert",
   *         "body":"mensaje alert"
   *       }
   *     }
   *   }
   */
  router.post('/send', function(req, res, next) {
    log.debug( "Send: "+ req.body.data + " to: " + req.body.to);
    var ctx = req._ctx;
    ctx.method = 'sendPush';
    ctx.model = "push";
    ctx.client={
      name: req.query.client,
      platform: req.query.platform,
      service: req.query.service
    }
    ctx.payload = {
      certId:req.body.certId,
      to:req.body.to,
      data: req.body.data
      // data:{
      //   payload:{title:req.body.message},
      //   alert:{
      //     body:req.body.message
      //   },
      //   badge:req.body.badge,
      //   sound:req.
      // }
    };
    push.do(ctx)
      .then(resp => {
        if(!resp.error){
          res.status(200).json(resp); 
        }else{
          res.status(400).json(resp); 
        }
      })
      .catch(next);

  });

  App.app.use(`${App.baseRoute}/srv/push`, router);
}

module.exports = setupRoutes;