


let App;      // reference to toroback
let log;      // logger (toroback's child)

var _defaultService = 'google';
var _push         = {};
var _pushServices = {};

let servicesLocation = "./services";
let rscPath  = __dirname +'/resources';

var _pushOptions = {};

// function retryFunction(retry,myfunc,check){
//   return new Promise((resolve, reject) => {
//     var interval = setInterval(() => {
//       myfunc
//         .then(resp =>{
//           check(resp,retry,interval)
//             .then(resolve)
//             .catch(() => {
//               retry--;
//             });
//         })
//         .catch(err => {
//           log.error(err);
//           if(retry == 0){
//             clearInterval(interval);
//           }
//           retry--;
//         });
//     },1000);
//   })
    
// }


/** 
 * 
 *
 * @module tb-push
 *
 * @description 
 *
 * <p>
 * Este módulo permite enviar notificiones push a través de los siguientes servicios disponibles:
 * <ul>
 * <li> Google </li>
 * <li> IOS </li>
 * <li> Amazon Web Services </li>
 * </ul>
 * <p>
 * @see [Guía de uso]{@tutorial tb-push} para más información.
 * @see [REST API]{@link module:tb-push/routes} (API externo).
 * @see Repositorio en {@link https://github.com/toroback/tb-push|GitHub}.
 * </p>
 * 
 *
 */
module.exports = {

  /**
   * Metodo que permite llamar a cualquier otro metodo del modulo comprobando con aterioridad si el usuario tiene permisos para acceder a este.
   * @param {ctx} CTX Contexto donde se indicará el resource y el method a ejecutar
   * @return {Promise<Object>} Promesa con el resultado del metodo llamado
  */
  do: function(ctx){
    return new Promise((resolve,reject) => {
      var service  = ctx.resource || _defaultService;
      App.acl.checkActions(ctx, ctx.model, ctx.method)
        .then(() => {
          //Hace la llamada al método correspondiente
          return this[ctx.method](ctx.client,ctx.payload); 
        })
        .then(resolve)
        .catch(reject);
    });
  },


  /**
   * Inicializa un servicio
   * @private
   * @param  {String} service           Servicio que se va a inicializar
   * @param  {Object} [serviceOpt]      Opciones para configurar el servicio
   * @param  {Object} serviceOpt.certId Id del certificado que se va a utilizar. 
   */
  initializeService : function (client, serviceOpt){
    var options = getOptionsForClient(client);
    var pushServiceId = options.client+"_"+options.platform+"_"+options.service;
    var service = options.service || _defaultService;
    // log.debug("servicio %s", service);
    // var pushService = null;
    var opt = _push[pushServiceId].options;
    
    if(service == "ios"){
      var select = opt.find(elem => (serviceOpt && serviceOpt.certId == elem._id) || elem.active );
      
      if(!select)
        select = opt.find(elem => !elem.production);
      
      opt = select || opt;
    }

    console.log("push object", _push[pushServiceId]);
    console.log("push object 2", _push[pushServiceId].srv);
    _pushServices[pushServiceId] = new _push[pushServiceId].srv(App, opt);
  },


    /**
   * Envia notificación push a través del servicio seleccionado
   * @param {Object} client                           Cliente al que enviar la notificacion
   * @param {Object} client.platform                  Plataforma a la que enviar la notificacion ("android","ios")
   * @param {Object} client.name                      Nombre del cliente al que enviar la notificación.
   * 
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
   * @param {Number} [payload.data.service]           (Sólo Amazon) Subservicio soportado por amazon al que enviar la notificacion. Por defecto se utiliza 'adm'
   *                                                  (ios: iOS(Producción), ios_dev: iOS(Desarrollo), gcm: GoogleCloudMessage, adm: Amazon Device Messaging)
   * @param {Object} [payload.certId]                 Id del certificado que se va a utilizar.    
   * @return {Promise<Object>} Una promesa con el objeto push 
  */
  sendPush:function(client, payload){
    var options = getOptionsForClient(client);
    var service = options.service;
    var pushServiceId = options.client+"_"+options.platform+"_"+options.service;

    var serviceOpt = payload.certId ? {certId:payload.certId} : {};
    if(!_pushServices[pushServiceId] || payload.certId) this.initializeService(client,serviceOpt);
    return new Promise((resolve, reject) => {
      var Push = App.db.model('tb.push');
      _pushServices[pushServiceId].sendPush(payload.to,payload.data)
        .then(resp => {
          log.trace("RESPUESTA EN SENDPUSH:");
          log.debug(resp);
          resolve(resp);
          var pushAux = {service:service,data:payload.data, to:payload.to, resp: resp};
          if(resp.error) pushAux.error = true;
          var push = new Push(pushAux);
          push.save();
        })
        .catch(err => {
          log.debug("error en a2spush");
          log.debug(err);
          reject(err);
          var push = new Push({service:service,data:payload.data, error:true, to:payload.to, resp: err});
          push.save();
        });
    });
  },

  /**
   * Devuelve la información del servicio seleccionado
   * @param {string} service - servicio seleccionado  
   * @return {Object} Informacion del servicio
  */
  getService:function(client){
    var options = getOptionsForClient(client);
    var pushServiceId = options.client+"_"+options.platform+"_"+options.service;
    if(!_pushServices[pushServiceId]) this.initializeService(client);
    console.log("initialized")
    return _pushServices[pushServiceId];
  },

  /**
   * Setup del módulo. Debe ser llamado antes de crear una instancia
   * @param {Object} _app Objeto App del servidor
   * @return {Promise} Una promesa
   */
  setup: function(_app){
    return new Promise( (resolve, reject) => {
      // set globals
      App = _app;
      log = _app.log.child({module:'push'});
     
      let Config = App.db.model('tb.configs');
      Config.findById('pushOptions')
        .then( pushOptions => { 
          if(!pushOptions){
            reject(new Error('pushOptions not configured'));
          }else{

            _pushOptions = pushOptions;
            // console.log("push options", _pushOptions);
            // console.log("push options certificates", _pushOptions.certificates);

            console.log("push options 2", pushOptions);
            console.log("push options certificates 2 ", pushOptions.toObject().certificates);
            _pushOptions.toObject().certificates.forEach( function(pushOption, index) {
               var srv;
               switch (pushOption.service) {
                 case 'ios':
                   srv = require(servicesLocation+'/push-iOS');
                   break;
                 case 'aws':
                   srv = require(servicesLocation+'/push-aws');
                   break;  
                 default:
                   srv = require(servicesLocation+'/push-gcm');
                   break;
               }


               _push[pushOption.client+"_"+pushOption.platform+"_"+pushOption.service] = {
                  srv: srv,
                  options: getOptionsForClient({name: pushOption.client, platform: pushOption.platform, service: pushOption.service}).data
               };

            });


            // console.log("initialized pushes");
            // console.log(_push);
    

            log.info('Setup: Push');
            // load routes
            require("./routes")(_app);
            resolve( );
          }
       })
      .catch(reject);
    });
  }, 

  /**
   * Inicializa los modelos del módulo
   * @return {Promise} Una promesa
   */
  init: function(){
    return new Promise( (resolve, reject) => {
      App.db.setModel('tb.push',rscPath + '/tb.push-schema');
      resolve();
    });
  }

}


function getOptionsForClient(client){
  var certificates = _pushOptions.toObject().certificates;
  if(certificates){
    return certificates.find( e => (e.client == client.name && e.platform == client.platform ));
  }else{
    return undefined;
  }
}

