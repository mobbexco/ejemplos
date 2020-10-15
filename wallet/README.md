# Ejemplo

Ejemplo de la aplicación de un checkout con wallet

### Insatalación
Primero hay que instalar todas las dependencias con:
```
$ npm install
```

Y luego inciar con:
```
$ node index.js
```

### Estructura
- ``index.js:`` Archivo principal del backend con las librerías y rutas.
- ``views/`` Directorio con los views
    - ``index.hbs:`` HTML con el carrito
    - ``checkout.hbs:`` HTML con el checkout y el script utilizando el SDK
- ``config.json`` Archivo con las variables de entorno. **Modificar para crear un checkout a medida, con credenciales propias, caso contrario no funcionará el checkout**

### Formulario
En primer lugar, en ``/`` se encuentra el carrito con el formulario de los productos a comprar, en ``views/index.hbs``. El formulario realiza un post a ``/checkout`` con la siguiente información:
- Total
- Titulo del primer producto
- Valor del primer producto
- Titulo del segundo producto
- Valor del segundo producto


### Creación del Checkout
En el backend, en la ruta ``/checkout`` se utiliza la librería [mobbex](https://github.com/GrosfeldEzekiel/mobbex-node#readme) donde en primer lugar se utiliza ``configurations.setPrivateKey()`` pasando com argumento la clave privada. Luego se realiza el checkout con ``checkout.create()``, pasando como argumento el objeto con el checkout.

Admite todos los parámetros de [Checkout]( https://mobbex.dev/docs/checkout ), pero además se establecen los siguientes:
- ``customer:`` Objeto de tipo JSON con los datos del cliente. Obligatorios:
    - ``uid:`` Identificador único e interno del cliente.
    - ``name:`` Nombre del Cliente
    - ``identification:`` DNI
    - ``phone:`` Número de celular
- ``wallet:`` Habilita la opción de billetera virtual para el almacenado de Tarjetas.
- ``options:`` Objeto con opciones.
    - ``domain:`` Dominio desde el que se procesará el Checkout ( Obligatorio ).

La función devuelve un objeto, del cuál solo obtenemos la lista ``wallet``, y el ``url`` para agregar nuevas tarjetas dentro del objeto ``data``.

Con el wallet y el url del checkout ahora podemós procesar el pago en el front.

##### Aclaracion:
Al ser el objeto que se devuelve muy grande, es necesario, a la hora de pasar información al front, es necesario, previamente, descomponerlo y colocarlo en otras variables, ya que de lo contrario, su valor solo será ``[Object][Object]``.
####


### Procesar Pago
Para procesar el pago es necesario agregar al header:
```HTML
    <script src="https://res.mobbex.com/js/sdk/mobbex@1.0.0.js" integrity="sha384-INuoL0CSX9x+vgy/B2db2lIABc/zHYHFP0KR8gma14xjQBwLBT5k5Xt9kIiXMrF2" crossorigin="anonymous"></script>
```
A la hora de utilizar el SDK nos interesan 3 cosas de la tarjeta a utizar:
- ``intentToken``: Aparece dentro del objeto wallet con el nombre de ``"it"``
- ``installment``: Aparece como una lista de objetos dentro del wallet, del objeto solo nos interesa ``"reference"``
- ``securityCode``: Codigo de seguridad de la tarjeta (Se solicita al cliente)

#### Frontend del checkout
Mostramos al cliente la lista de las tarjetas con su ``name`` y un formulario listando sus posibles ``installments`` y solicitando código de seguridad.

En el ejemplo se utiliza un ``<select>`` con todos los nombres de la lista de installments (Que se encuentra dentro del objeto wallet). El value de los options es el ``reference`` de los installments.

Además utilizamos un ``<input>`` para el código de seguridad y un ``<input type="hidden">`` para el intent token de la tarjeta.

Para que el usuario pueda agregar una tarjeta nueva, se utiliza un link con el ``url``.
#### Script con el SDK
Para procesar el pago, cuando el usuario realiza una acción como clickear el botón "Pagar", debemos ejecutar la función ``Mobbex.operation.process()`` pasando como argumento un objeto con el ``intentToken``, el ``installment`` y el ``securityCode`` de la tarjeta que se usará.
```HTML
<script>
    window.MobbexJS.operation.process({
        intentToken: "{{ intentToken }}",
        installment: "{{ cuota elegida }}"
        securityCode: "{{ código de seguridad }}"
    })
        .then(data => console.log(data))
        .error(error => console.log(error))
</script>
```

##### Respuesta
Una vez procesado el pago, nos retornara un objeto con el status del pago, o un error, [Referencia](https://mobbex.dev/docs/statuses)