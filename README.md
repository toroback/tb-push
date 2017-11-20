# tb-push Reference

Este modulo permite enviar notificiones push a traves de los servicios disponibles, que son:
- Google
- IOS
- Amazon Web Services

## Configuración

Para utilizar algún servicio de envío de notificaciones es necesario configurarlo como se explicará a continuación.

Además, para que el módulo esté correctamente integrado en el servidor incluyendo los esquemas necesarios, hay que inicializar el módulo. Esto se puede realizar agregando la siguiente linea en el archivo boot.js dentro de la function Boot():
  
  ```javascript
  function Boot(App){
    …
  App.push.init();
    …
  }
  ```

### **- Configuración del servicio Google:**

#### **• Configuración desde A2Server:** 

Desde la interfaz web de administración seleccionar la aplicación que se va a configurar.

Una vez en ella acceder a la sección **"Configuración"** y luego a la pestaña **"Push"**.

En dicha pestaña, en la sección **"GCM Push Credenciales"**, es necesario introducir la Clave Google API y la url del servidor de envio de Push de google (que normalmente es "https://android.googleapis.com/gcm/send" ó "https://fcm.googleapis.com/fcm/send" si es a través de Firebase).

Una vez introducidos los valores pulsamos el botón **"Guardar"** para guardar los cambios.

**NOTA:** Si se desea, se pueden probar las credenciales utilizando el botón **"Probar Credenciales GCM"**. Se nos abrirá una ventana en la que introducir los valores necesarios para el envío de una notificación como el Push Token, un icono opcional, título y mensaje y opcionalmente se puede incluir información adicional, en formato json, que será utilizada por la aplicación.

#### **• Configuración manual:**

La configuración manual se realiza en el archivo "config.json".

Para ello hay que añadir el objeto "pushOptions", si no se tenía enteriormente, y agregar un objeto JSON cuya clave sea "gcm" que contendrá la clave de Google Api y la url del servidor de envio de Push de google. Al completarlo, debería quedar de la siguiente manera:

```javascript
"pushOptions":{
    "gcm":{
      "apikey": <api-key de la app en google>, 
      "url": <url a través de la que se enviará la notificación (Ej. https://android.googleapis.com/gcm/send)>
    }
}
```

### **- Configuración del servicio IOS:**

#### **• Configuración desde A2Server:** 

Desde la interfaz web de administración seleccionar la aplicación que se va a configurar.

Una vez en ella acceder a la sección "Configuración" y luego a la pestaña "Push".

En dicha pestaña, en la sección "iOS Push Credenciales" hay posibilidad de añadir dos certificados, uno para desarrollo y otro para producción, pero el proceso para agregar uno u otro es el mismo.

Para configurar un certificado hay que añadir el archivo del certificado correspondiente en formato p12 e introducir la contraseña asociada al certificado.

#### **• Configuración manual:**

La configuración manual se realiza en el archivo "config.json".

Para ello hay que añadir el objeto "pushOptions", si no se tenía enteriormente, y agregar un array cuya clave sea **"ios"** que contendrá la información de los distintos certificados de ios.

Cada uno de los certificados estará formado por un objeto con los siguientes campos:

| Clave | Tipo | Opcional   | Descripción |
|---|---|:---:|---|
|production|Boolean||Flag que indica es es de producción o no (true\|false)|
|cert|String||Path del certificado dentro de la carpeta "cert"|
|passphrase|Boolean||Contraseña del certificado|
|active|Boolean||Flag que indica si es el certificado activo|
|certId|Boolean||Identificador del certificado (production\|develop) |
|bundleId|Boolean||Bundle id del proyecto iOS|

Para el envio de notifiaciones a iOS (APN), el archivo de configuración (config.json) quedaría de la siguente manera:

```javascript
"pushOptions":{
  "ios":[
    {
     "cert":<"path donde se encuentra el cert">,
     "passphrase":<"contraseña del cert">,
     "production":<true|false>,
     "active":<true|false>, 
     "certId":<production|development>,
     "bundleId":<"bundle_id"> 
    },
    {
     "cert":"...",
     "passphrase":"...",
     "production":"...",
      ...
    }
  ]
}
```
    
Los certificados de iOS deberán alojarse en la carpeta **"cert"** creada al mismo nivel que **"app"**, por lo que si dentro de la carpeta "cert" creamos la carpeta "ios" y es aquí donde alojamos nuestros certificados, cuyos nombres sean "cert.p12" y "cert_dev.p12" para producción y desarrollo respectivamente, con password "123456" para ambos y estando activo el de producción, la configuración seria la siguiente :

```javascript
"pushOptions":{
    "ios":[
      {
        "production": false,
        "cert": "ios/cert_dev.p12",
        "passphrase": "123456",
        "active": false,
        "_id": "development",
        "bundleId": "com.example.test"
      },
      {
        "production": true,
        "cert": "ios/cert.p12",
        "passphrase": "123456",
        "active": true,
        "_id": "production",
        "bundleId": "com.example.test"
      }
    ]
}
```

### **- Configuración del servicio Amazon Web Services:**

Amazon Web Services ofrece distintos servicios para poder enviar notificaciones:

**- Los servicios disponibles son:**

- Google Cloud Message
- Apple Push Notification Service (Producción y desarrollo)
- Amazon Device Messaging
- Baidu Cloud Push
- Microsoft Push Notification Service
- Windows Push Notification Services

#### **• Configuración desde A2Server:** 

En la aplicación seleccionada acceder a la sección "Configuración" y luego a la pestaña "Push".

En dicha pestaña, en la sección "Amazon Web Services (AWS) Push Credenciales" se deben introducir las credenciales obtenidas de AWS y se pueden configurar los distintos servicios que proporciona AWS para enviar notificaciones push. 

**- Configuración de credenciales**:

Las información disponible para introducir es:
- Clave de acceso: Id de acceso de AWS
- Clave secreta: Clave secreta de AWS
- Región: (Opcional) Región utilizada por el servicio. Por defecto "eu-central-1"

**- Configuración de servicios**

Para configurar los servicios que se utilizarán es necesario introducir el "Application ARN" correspondiente al servicio.

**NOTA:** Si no se dispone del ARN, en la sección "Generar ARN de aplicación" se explicará detalladamente.

#### **- Configuración manual:**

La configuración manual se realiza en el archivo "config.json".

Para ello hay que añadir el objeto "pushOptions", si no se tenía enteriormente, y agregar un array cuya clave sea **"aws"** que contendrá las credenciales obtenidas de AWS y la información de los servicios que se utilizarán. 

**- Configuración de credenciales**:

La información necesaria para utilizar los servicios de AWS es:

| Clave | Tipo | Opcional   | Descripción |
|---|---|:---:|---|
|accessKeyId|String||Id de acceso de AWS|
|secretAccessKey|String||Clave secreta de AWS|
|region|String|X|Región utilizada por el servicio. Por defecto "eu-central-1"|
      
**- Configuración de servicios**

Cada servicio que se vaya a utilizar necesitará un objeto con el siguiente formato, el cual contendrá el "Application ARN" necesario:

```javascript
<service_key> : {
  "platformApplicationArn": < platform_arn >
}
```

Las clave para el objeto de cada servicio (service_key) son las siguientes:
- Google Cloud Message : "gcm"
- Apple Push Notification Service (Desarrollo) : "ios_dev"
- Apple Push Notification Service (Producción) : "ios"
- Amazon Device Messaging : "adm"
- Baidu Cloud Push : "baidu"
- Microsoft Push Notification Service : "mpns"
- Windows Push Notification Services : "wns"

**NOTA:** Si no se dispone del ARN, en la sección "Generar ARN de aplicación" se explicará detalladamente.

### **- Ejemplo**

+ Configuración del servicio de Google Cloud Message y de Apple Push Notification Service (Desarrollo y Producción):
```javascript
"pushOptions": {
  ...
  "aws":{
    "accessKeyId": "AKIAIWDXXXWENXEXXXXX",
    "secretAccessKey": "IOTXXX6b+5xXXX/XxXXx8XXX7YXXXs7SyX5XXx/x",
    "region":"eu-central-1",

    "gcm" : {
      "platformApplicationArn": "arn:aws:sns:eu-central-1:XXXX7296XXXX:app/GCM/myDemoApp"
    },
    "ios" : {
      "platformApplicationArn": "arn:aws:sns:eu-central-1:XXXX7296XXXX:app/APNS/myDemoApp"
    },
    "ios_dev" : {
      "platformApplicationArn": "arn:aws:sns:eu-central-1:XXXX7296XXXX:app/APNS_SANDBOX/myDemoApp"
    } 
  }
  ...
}
```

- **Generar ARN de aplicación:**  

Para generar los distintos ARN de aplicación es necesario tener una cuenta creada en Amazon Web Services.

Nota: Se puede crear una cuenta [aquí](https://aws.amazon.com/)

Si ya dispone de una cuenta inicie sesión y acceda a la Consola haciendo click en:
  "Mi Cuenta" -> "Consola de administración de AWS"

Una vez en la consola despliegue el menu "Servicios" y seleccione "Messaging -> Simple Notification Service" para acceder a la configuración de servicios de envio de Notificaciones.

A continuación seleccione "Create platform application" para desplegar un formulario que le permitirá crear una nueva plataforma de envio de notificaciones.

En el formulario, introduzca el nombre de la aplicación y selecciones la plataforma que desea crear. Luego introduzca las credenciales necesarias para el servicio seleccionado y pulse "Create platform application" para finalizar.

NOTA: No todas las regiones de AWS soportan el envío de notificaciones push. Si lo desea puede cambiar la región en la esquina superior derecha de la pantalla. 

## USO

Para enviar notificaciones push se puede realizar de dos maneras:
  - Mediante peticiones http (Servidor o cliente).
  - Mediante llamadas internas al modelo (Servidor).


### **- REST Api**

Las peticiones http se deben realizar a la url `https://[domain]:[port]/api/v[apiVersion]/srv/push`

NOTA: Para seleccionar el servicio que se quiera usar es necesario agregar el parámetro "service" a la url con el servicio que se desee utilizar (google, ios).

Las peticiones que se pueden realizar son:

- Enviar una notificación push:

  Realizar una peticion POST a `https://[domain]:[port]/api/v[apiVersion]/srv/push/send[?service=<google|ios>]`

#### **• Parámetros para servicio Google:**

| Clave | Tipo | Opcional   | Descripción |
|---|---|:---:|---|
|to|String||Token al que enviar la notificación|
|data|Object||Objeto JSON con los datos de la notificación|
|data.alert|Object||Objeto JSON con el contenido básico (title y body)|
|data.alert.title|String||Titulo de la notificación|
|data.alert.body|String|| Mensaje de la notificación|
|data.icon|String|X|Icono que se desea mostrar|
|data.payload|Object|X|Objeto JSON con información adicional utilizada en la aplicación|


#### **• Parámetros para servicio IOS:**

| Clave | Tipo | Opcional   | Descripción |
|---|---|:---:|---|
|to|String||Token al que enviar la notificación|
|data|Object||Objeto JSON con los datos de la notificación|
|data.alert|Object||Objeto JSON con el contenido básico (title y body)|
|data.alert.title|String||Titulo de la notificación|
|data.alert.body|String|| Mensaje de la notificación|
|data.icon|String|X|Icono que se desea mostrar|
|data.payload|Object|X|Objeto JSON con información adicional utilizada en la aplicación|
|data.badge|Number|X|Contador que mostrar en el icono de la aplicación|
|data.sound|String|X|El sonido a utilizar|
|data.category|String|X|La categoría de la notificación|
|data.contentAvailable|Number|X|Valor 1 para indicar que es una notificación silenciosa. (No debe incluir badge, ni sound, ni alert)|
|data.threadId|String|X|Id para agrupar notificaciones|
|certId|String|X|Id del certificado a usar ("development"|"production") |
  
#### **• Ejemplo:**
    
POST:  `https://a2server.a2system.net:1234/api/v1/srv/push/send?service=google`

DATOS:

```javascript
  {
    "to":"APA91bHSfs1jg_vXpTGvaHkdYVKPHfJSDB_EpGfGJFzzDRIIMaBHR1Jiq5v8Z8RX_stmGy1mx2evmcLpeZgXoQEp-ba9KD975_IlydJ-hq0dDfpNqxuc40YqNjvrasYdXXXXXXXXXXXX",
    "data":{
      "alert":{
        "title":"titulo alert",
        "body":"mensaje alert"
      },
      "icon": "https://maxcdn.icons8.com/Share/icon/ios7/Cinema//anonymous_mask1600.png",
      "payload":{
        "type":"recordatorio"
      }
    }
  }
```


#### **• Ejemplo Silent notification de iOS:**

POST:  `https://a2server.a2system.net:1234/api/v1/srv/push/send?service=google`

DATOS:

```javascript
  {
    "to":"APA91bHSfs1jg_vXpTGvaHkdYVKPHfJSDB_EpGfGJFzzDRIIMaBHR1Jiq5v8Z8RX_stmGy1mx2evmcLpeZgXoQEp-ba9KD975_IlydJ-hq0dDfpNqxuc40YqNjvrasYdXXXXXXXXXXXX",
    "data":{
      "contentAvailable": 1,
      "payload":{
        "type":"recordatorio"
      }
    }
  }
```

### **- Llamadas internas**

Para realizar las llamadas internas se utiliza el objeto App.push 

#### **• Ejemplo:** 

```javascript
 var arg = {to:"my_push_token",data:{alert:{title:"title push",body:"My body"}}};
 //para enviar push a google
 App.push.sendPush("google", arg).then(function(resp){
  console.log("envio realizado");
 }).catch(function(err){
  console.log("error en el envio");
 });
 
 //para enviar push a ios
 App.push.sendPush("ios", arg).then(function(resp){
  console.log("envio realizado");
 }).catch(function(err){
  console.log("error en el envio");
 })

```


## Gestion de errores

En el envío de notificaciones puede producir distintos errores. Algunos por falta de algún campo requerido, otras veces por problemas de conexión o incluso por problemas con la configuración y los certificados necesarios.

Pero en este caso trataremos un error que es bastante común y que ayuda a la eficiente a la hora de enviar notificaciones. El error que trataremos se produce cuando un token generado por la aplicación ya no es válido, ya sea por vencimiento o por desinstalación de la aplicación.

Cuando se produce algún error en el envío la respuesta es de la siguiente manera:

| Clave | Tipo | Opcional   | Descripción |
|---|---|:---:|---|
|id|String|X|Token al que enviar la notificación|
|error|Object|X|Objeto JSON con los datos sobre le manejo del error|
|error.action|String||Acción recomendada a realizar|
|resp|Object|X|Objecto JSON con la respuesta del envío|
|resp.error|Object||Objeto JSON con detalles sobre el error|
|resp.error.status|String||Código de error|
|resp.error.msg|String||Mensaje del error|

Las distintas acciones recomendadas que puede devolver la respuesta son:
- "retry": Intentar un reenvío del push.
- "del": Eliminar el access token al que se envío el push.
- "no_retry": No hacer un reintento.


Ejemplo:

```javascript
{
  "id": "6c06c0cece633c………d3a01d52e2d7",
  "error": {
    "action": "no_retry"
  },
  "resp": {
    "error": {
      "status": "400",
      "msg": "BadDeviceToken"
    }
  }
}
```
