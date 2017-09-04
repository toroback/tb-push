
let App;      // reference to toroback
let log;      // logger (toroback's child)

var _defaultService = 'google';
var _push         = {};
var _pushServices = {};

let servicesLocation = "./services";
let rscPath  = __dirname +'/resources';

function retryFunction(retry,myfunc,check){
  return new Promise((resolve, reject) => {
    var interval = setInterval(() => {
      myfunc
        .then(resp =>{
          check(resp,retry,interval)
            .then(resolve)
            .catch(() => {
              retry--;
            });
        })
        .catch(err => {
          log.error(err);
          if(retry == 0){
            clearInterval(interval);
          }
          retry--;
        });
    },1000);
  })
    
}

module.exports = {

  do: function(ctx){
    return new Promise((resolve,reject) => {
      var service  = ctx.resource || _defaultService;
      App.acl.checkActions(ctx, ctx.model, ctx.method)
        .then(() => {
          //Hace la llamada al método correspondiente
          return this[ctx.method](service,ctx.payload); 
        })
        .then(resolve)
        .catch(reject);
    });
  },


  initializeServices : function (service, serviceOpt){
    var service = service || _defaultService;
    // log.debug("servicio %s", service);
    log.debug("serviceOpt: "+JSON.stringify(serviceOpt));
    // var pushService = null;
    var opt = _push[service].options;
    
    if(service == "ios"){
      var select = opt.find(elem => (serviceOpt && serviceOpt.certId == elem._id) || elem.active );
      
      if(!select)
        select = opt.find(elem => !elem.production);
      
      opt = select || opt;
    }
    log.trace("opt seleccionado: ");
    log.debug(opt);
    _pushServices[service] = new _push[service].srv(App, opt);
  },

  /**
   * Envia notificación push a través del servicio seleccionado
   * @function sendPush
   * @param {string} service - servicio a través el cual se enviará la notificación push (google|ios)
   * @param {Object} payload - Objecto con información sobre el envio de la notificación
   * @param {string} payload.to - Push_token al cual se envia la notificación.
   * @param {Object} payload.data - Objecto que contiene el payload que se quiere enviar.    
  */
  sendPush:function(service, payload){
    var serviceOpt = payload.certId ? {certId:payload.certId} : {};
    log.debug(serviceOpt);
    if(!_pushServices[service] || payload.certId) this.initializeServices(service,serviceOpt);
    return new Promise((resolve, reject) => {
      var Push = App.db.model('tb.push');
      _pushServices[service].sendPush(payload.to,payload.data)
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
   * Devuelve el objeto pushService del servicio seleccionado
   * @function getService
   * @param {string} service - servicio seleccionado   
  */
  getService:function(service){
    if(!_pushServices[service]) this.initializeServices(service);
    return _pushServices[service];
  },

  // push tb module setup. Must be called before any instance creation. 
  setup: function(_app){
    return new Promise( (resolve, reject) => {
      // set globals
      App = _app;
      log = _app.log.child({module:'push'});
     
      // App.db.setModel('tb.push',rscPath + '/tb.push-schema');

      if(!App.pushOptions){
        reject(new Error('pushOptions not configured'));
      }else{
        _push.google = {
          srv: require(servicesLocation+'/push-gcm'),
          options : App.pushOptions.gcm
        };

        _push.ios = {
          srv: require(servicesLocation+'/push-iOS'),
          options : App.pushOptions.ios
        };

        _push.aws = {
          srv: require(servicesLocation+'/push-aws'),
          options : App.pushOptions.aws
        };

        log.info('Setup: Push');
        // load routes
        require("./routes")(_app);
        resolve( );
      }
    });
  }, 

  init: function(){
    return new Promise( (resolve, reject) => {
      App.db.setModel('tb.push',rscPath + '/tb.push-schema');
      resolve();
    });
  }

}