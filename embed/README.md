# Ejemplo Embed

Ejemplo de una aplicación con embed y personalización

### Insatalación
Primero hay que instalar todas las dependencias con:
```
$ npm install
```

Y luego inciar con:
```
$ npm start
```
o

```
$ node index.js
```

### Estructura
- ``index.js:`` Archivo principal del backend con las librerías y rutas.
- ``views/`` Directorio con el view
    - ``index.html:`` HTML con el Embed
- ``config.json`` Archivo con las variables de entorno. **Modificar para crear un checkout a medida, con credenciales propias, caso contrario no funcionará el checkout**

### Frontend para crear checkout
La creación del checkout se realiza mediante ajax al endpoint ``/checkout`` con la información de los productos.

### Creación del checkout
En el backend, en la ruta ``/checkout`` se utiliza la librería [mobbex-node](https://github.com/GrosfeldEzekiel/mobbex-node#readme) donde en primer lugar se configura usando ``configurations.setApiKey()`` y ``configurations.setAccessToken()``. Luego se realiza el checkout con ``checkout.create()``, pasando como argumento el objeto con el checkout.

Admite todos los parámetros de [Checkout]( https://mobbex.dev/docs/checkout )

Devuelve el ID del checkout necesario para el Embed.

### Renderización del Embed
Para renderizar el Embed es necesario agregar al header:
```HTML
    <script src="https://res.mobbex.com/js/embed/mobbex.embed@1.0.17.js"></script>
``` 
Se renderiza el embed siguiendo la [documentación](https://mobbex.dev/docs/advanced) y utilizando el ID devuelto por el endpoint ``/checkout``. Además se le agrega dentro de las opciones, el objeto ``personalization`` para personalizar al máximo el embed utilizando los valores del formulario de personalización.

### Funcionamiento del script
1. En primer lugal, al apretar el botón de pagar se ejecuta la función ``createCheckout()`` quién realiza el ajax. Esta última ejecuta ``embedMobbex`` una vez recibido el ID del checkout, pasándolo como argumento.
2. ``embedMobbex`` crea el objeto ``options`` y luego ejecuta la función ``renderMobbexEmbed()`` pasando como argumento el objeto creado.
3. La última función simplemente renderiza el embed con ``window.MobbexEmbed.init``.