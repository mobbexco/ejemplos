# Banner Métodos de Pago
 
### Utilización
Para poder utilizar hay que simplemente insertar en el html:
 
```html
<div id="mbbx-sources"></div>
```
Al final del body insertar el archivo ``sources.js`` o su contenido. Ejemplo:
 
```html
<script type="text/javascript" src="./sources.js"></script>
```
 
Obtener y mostrar las tarjetas utilizando la función ``mobbexSources``.
- En el caso de utilizar el código de acceso generado por la consola de Mobbing, se pasan como argumentos el código y el total:
```javascript
mobbexSources("código", "total")
```
- En caso de utilizar el cuit, se pasan como argumentos el código del país (country), el código tributario (tax_id) y el total:
```javascript
mobbexSources("country", "tax_id", "total")
```
 
### Personalización
Para que los logos sean circulares, simplemente se le agrega al div la clase ``mbbx-rounded``:
```html
<div id="mbbx-sources" class="mbbx-rounded"></div>
```
 
Para personalizar los logos y sus tamaños, se modifica el estilo de la clase ``mbbx-source`` con css.
 
### Ejemplo
En ``index.html`` se encuentra un ejemplo con logos redondeados y un tamaño definido de 500px