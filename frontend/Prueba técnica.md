**Prueba técnica:**

---

**Formulario con las siguientes características:**

El formulario debe permitir crear un nuevo “item” con los campos: **Nombre, Descripción, Precio, Tipo de oferta** (menú desplegable con dos opciones: “Descuento en dinero” o “Descuento en porcentaje”), **Multimedia** y **Fechas**.

- Cuando el usuario elija una opción en “Tipo de oferta”, el siguiente campo debe cambiar automáticamente:  
  - Si eligió “Descuento en dinero”, ese campo pedirá **cantidad de dinero a descontar**.  
  - Si eligió “Descuento en porcentaje”, ese campo pedirá **porcentaje de descuento**.

- **Todos los campos son obligatorios.** Si alguien intenta enviar el formulario sin completar algo o con datos inválidos (ejemplo: precio negativo, porcentaje mayor a 100, fechas mal escritas, etc.), el formulario debe mostrar un aviso visual claro (borde rojo en el campo, mensaje de error, etc.).

- **Subida de archivos:** El usuario debe poder subir imágenes y vídeos, ya sea **tomándolos con la cámara** del dispositivo o **seleccionándolos desde la galería**.

- **Fechas:** Dos selectores: **fecha de inicio** y **fecha de fin**. El selector de fecha debe comportarse de forma nativa en cada plataforma (iOS → selector de iOS, Android → selector de Android).

- **Validaciones:** El formulario debe validar cada campo siguiendo las mejores prácticas para cada tipo. Si falla alguna validación, el usuario debe ver inmediatamente qué campo tiene el problema.

**Adicionalmente, la aplicación debe:**  
- Desarrollarse usando **Expo** como framework.  
- Incluir una **API** (backend) que reciba y procese los datos del formulario; la aplicación móvil debe hacer las llamadas a esa API para enviar la información (incluyendo los archivos multimedia).

**Entregable:** Una aplicación móvil funcional (para iOS y Android) que cumpla todo lo anterior, más el código de la API que consuma.