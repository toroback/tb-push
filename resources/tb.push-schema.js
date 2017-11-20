

var mongoose = require('mongoose'),  
    Schema   = mongoose.Schema;

/** 
 * Modelo de datos que contiene información sobre los envios push realizados
 * @class PushSchema
 * @memberOf module:tb-push
 * @property {String} service Servicio utilizado (android, ios, etc)
 * @property {Schema.Types.Mixed} data Payload enviado por push
 * @property {String} to Push token al que se a enviado la notificación
 * @property {Schema.Types.Mixed} resp Respuesta del servicio
 * @property {Boolean} error Flag que indica si hubo algun error
 * @property {Date} cDate Fecha de envio de notificación
*/
var PushSchema = new Schema({  
  service: {type: String},
  data: Schema.Types.Mixed,  // payload enviado por push
  to: {type:String},  // push token al que se a enviado la notificación
  resp: Schema.Types.Mixed, // respuesta del servicio
  error: {type:Boolean,default:false}, // flag que indica si hubo algun error
  cDate: {type: Date, default: Date.now} // fecha de envio de notificación
});


module.exports = PushSchema; 
