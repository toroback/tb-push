/* 
 * Modelo de datos que contiene información sobre los envios push realizados
 * @module DataStore
 * @class push
 * @author Sergio García
*/

var mongoose = require('mongoose'),  
    Schema   = mongoose.Schema;

var PushSchema = new Schema({  
  service: {type: String}, // servicio utilzado (android,ios, etc)
  data: Schema.Types.Mixed,  // payload enviado por push
  to: {type:String},  // push token al que se a enviado la notificación
  resp: Schema.Types.Mixed, // respuesta del servicio
  error: {type:Boolean,default:false}, // flag que indica si hubo algun error
  cDate: {type: Date, default: Date.now} // fecha de envio de notificación
});

module.exports = PushSchema; 
