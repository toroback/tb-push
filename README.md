“# tb-push”

# A2sPush Reference

Este modulo permite enviar notificiones push a traves de los servicios definidos en el archivo config.json

## Configuración

Antes de utilizar cualquier servicio de envío de notificaciones es necesario configurarlo.

Los servicios disponibles son :
  * Google
  * IOS


#### - **Configuración del servicio Google:**

  + **Configuración desde A2Server:** 

    En la aplicación seleccionada acceder a la sección "Configuración" y luego a la pestaña "Push".

    En dicha pestaña, en la sección "GCM Push Credenciales", es necesario introducir la Clave Google API y la url del servidor de envio de Push de google (que normalmente es "https://android.googleapis.com/gcm/send").

    Una vez introducidos los valores pulsamos el botón "Guardar" para guardar los cambios.

    NOTA: Si se desea, se pueden probar las credenciales utilizando el botón "Probar Credenciales GCM". Se nos abrirá una ventana en la que introducir los valores necesarios para el envío de una notificación como el Push Token, un icono opcional, título y mensaje y opcionalmente se puede incluir información adicional, en formato json, que será utilizada por la aplicación.

  + **Configuración manual:**

    La configuración manual se realiza en el archivo "config.json".

    Para ello hay que añadir el objeto "pushOptions", si no se tenía enteriormente, y agregar un objeto cuya clave sea "gcm" que contendrá la clave de Google Api y la url del servidor de envio de Push de google. Al completarlo, debería quedar de la siguiente manera:

    ```
    "pushOptions":{
        "gcm":{
          "apikey":< api-key de la app en google >, 
          "url":< url a través de la cual se enivara la notificación (https://android.googleapis.com/gcm/send) >
        }
    }
    ```


#### - **Configuración del servicio IOS:**

  + **Configuración desde A2Server:** 

    En la aplicación seleccionada acceder a la sección "Configuración" y luego a la pestaña "Push".

    En dicha pestaña, en la sección "iOS Push Credenciales" hay posibilidad de añadir dos certificados, uno para desarrollo y otro para producción, pero el proceso para agregar uno u otro es el mismo.

    Para configurar un certificado hay que añadir el archivo del certificado correspondiente en formato p12 e introducir la contraseña asociada al certificado.

  + **Configuración manual:**

    La configuración manual se realiza en el archivo "config.json".

    Para ello hay que añadir el objeto "pushOptions", si no se tenía enteriormente, y agregar un array cuya clave sea **"ios"** que contendrá la información de los distintos certificados de ios.

    Cada uno de los certificados estará formado por un objeto con los siguientes campos:
      * "production": Flag que indica es es de producción o no (true|false)
      * "cert": Path del certificado dentro de la carpeta "cert"
      * "passphrase": Contraseña del certificado
      * "active": Flag que indica si es el certificado activo
      * "certId": Identificador del certificado (production|develop) 
      * "bundleId": Bundle id del proyecto ios

    Para el envio de notifiaciones a iOS (apn), dicho archivo de configuración (config.json) quedaría de la siguente forma:

    ```
    "pushOptions":{
      "ios":[
        {"cert":<"path donde se encuentra el cert">,"passphrase":<"contraseña del cert">,production:<true|false>,active:<true|false>, certId:<production|development>, "bundleId":<"bundle_id"> },
        {"cert":"...","passphrase":"...",production:"...", ...}
      ]
    }
    ```
    Los certificados de ios deberán alojarse en la carpeta "cert" creada al mismo nivel que "app", por lo que si dentro de dicha carpeta ( "cert" ) creamos la carpeta "ios" y es aquí donde alojamos nuestros certificados, cuyos nombres sean "cert.p12" y "cert_dev.p12" para producción y desarrollo respectivamente, con password "123456" para ambos y estando activo el de producción, la configuración seria la siguiente :

    ```
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

#### - **Configuración del servicio Amazon Web Services:**

  Amazon Web Services ofrece distintos servicios para poder enviar notificaciones:

  + **Los servicios disponibles son:**
    - Google Cloud Message
    - Apple Push Notification Service (Producción y desarrollo)
    - Amazon Device Messaging
    - Baidu Cloud Push
    - Microsoft Push Notification Service
    - Windows Push Notification Services

  + **Configuración desde A2Server:** 

    En la aplicación seleccionada acceder a la sección "Configuración" y luego a la pestaña "Push".

    En dicha pestaña, en la sección "Amazon Web Services (AWS) Push Credenciales" se deben introducir las credencias obtenidas de AWS y se pueden configurar los distintos servicios que proporciona AWS para enviar notificaciones push. 

    - **Configuración de credencias**:

      Las información disponible para introducir es:
      - Clave de acceso: Id de acceso de AWS
      - Clave secreta: Clave secreta de AWS
      - Región: (Opcional) Región utilizada por el servicio. Por defecto "eu-central-1"

    - **Configuración de servicios**

      Para configurar los servicios que se utilizarán es necesario introducir el "Application ARN" correspondiente al servicio.

      NOTA: Si no se dispone del ARN, en la sección "Generar ARN de aplicación" se explicará detalladamente.

  + **Configuración manual:**

    La configuración manual se realiza en el archivo "config.json".

    Para ello hay que añadir el objeto "pushOptions", si no se tenía enteriormente, y agregar un array cuya clave sea **"aws"** que contendrá las credenciales obtenidas de AWS y la información de los servicios que se utilizarán. 

    - **Configuración de credencias**:

      La información necesaria para utilizar los servicios de AWS son:
      - accessKeyId: Id de acceso de AWS
      - secretAccessKey: Clave secreta de AWS
      - region: (Opcional) Región utilizada por el servicio. Por defecto "eu-central-1"

    - **Configuración de servicios**

      Cada servicio que se vaya a utilizar necesitará un objeto con el siguiente formato, el cual contendrá el "Application ARN" necesario:

      ```
      < service_key > : {
        "platformApplicationArn": < platform_arn >
      }
      ```

      La clave para el objeto asociado a cada servicio son los siguientes:
      - Google Cloud Message : "gcm"
      - Apple Push Notification Service
        + Desarrollo : "ios_dev"
        + Producción : "ios"
      - Amazon Device Messaging : "adm"
      - Baidu Cloud Push : "baidu"
      - Microsoft Push Notification Service : "mpns"
      - Windows Push Notification Services : "wns"

      NOTA: Si no se dispone del ARN, en la sección "Generar ARN de aplicación" se explicará detalladamente.

    ##### - **Ejemplo**

      - Configuración del servicio de Google Cloud Message y de Apple Push Notification Service (Desarrollo y Producción):
        ```
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

  + **Generar ARN de aplicación:**

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


### - **REST Api**

  Las peticiones http se deben realizar a la url "https://[domain]:[port]/api/v[apiVersion]/srv/push"

  NOTA: Para seleccionar el servicio que se quiera usar es necesario agregar el parámetro "service" a la url con el servicio que se desee utilizar (google, ios).

  Las peticiones que se pueden realizar son:

  - Enviar una notificación push:

    Realizar una peticion POST a https://[domain]:[port]/api/v[apiVersion]/srv/push/send[?service=< google|ios >]

      + Parámetros para servicio Google:
        * "to" : Token al que enviar la notificación
        * "data": Objeto JSON con los datos de la notificación
        * "data.alert": Objeto JSON con el contenido básico (title y body)
        * "data.alert.title": Titulo de la notificación
        * "data.alert.body": Mensaje de la notificación
        * "data.icon": Icono que se desea mostrar
        * "data.payload": Objeto JSON con información adicional utilizada en la aplicación

      + Parámetros para servicio IOS:
        * "to" : Token al que enviar la notificación
        * "data": Objeto JSON con los datos de la notificación
        * "data.alert": Objeto JSON con el contenido básico (title y body)
        * "data.alert.title": Titulo de la notificación
        * "data.alert.body": Mensaje de la notificación
        * "data.payload": Objeto JSON con información adicional utilizada en la aplicación
        * "data.badge": Contador que mostrar en el icono de la aplicacion
        * "data.sound": El sonido a utilizar
        * "data.category": La categoría de la notificación
        * "data.contentAvailable": Valor 1 para indicar que hay nuevo contenido disponible
        * "data.certId": Id del certificado a usar ("development"|"production") 

      Ejemplo: 
    
      POST:  https://a2server.a2system.net:1234/api/v1/srv/push/send?service=google

      DATOS:

        ```
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

### - **Llamadas internas**

  Para realizar las llamadas internas se utiliza el objeto App.push 

  Ejemplo: 

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
