# Redes sociales del autor

## Cambios
- Ampliar los datos del autor para aceptar el nuevo campo `social_networks` de la API.
- Interpretar el campo aunque llegue como lista, objeto o texto JSON, ignorando entradas incompletas o enlaces no seguros.
- Mostrar debajo de la descripción enlaces externos con el icono correspondiente a cada red social.
- Mantener la estética actual, sin bordes redondeados, y asegurar buen contraste y accesibilidad.

## Verificación
- Comprobar que la página del autor funciona con y sin redes sociales.
- Confirmar que cada enlace abre su destino correcto en una pestaña nueva.
- Revisar el resultado en escritorio y móvil y validar que no haya errores.

## Detalles técnicos
- Se usarán los iconos ya disponibles en el proyecto y un icono web genérico para redes desconocidas.
- Solo se permitirán destinos `http` y `https` para evitar enlaces inseguros.
