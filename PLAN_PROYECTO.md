# Plan del proyecto

## Análisis del estado actual

El repositorio actual está iniciado como un proyecto de **React Native CLI** y no como un proyecto de **Expo**.

Para la solución final, la base técnica requerida debe ser **React Native + Expo + TypeScript**.

Evidencias principales:
- El `package.json` usa scripts de `react-native run-android`, `react-native run-ios` y `react-native start`.
- El `README.md` corresponde a la plantilla base de React Native CLI.
- La estructura incluye carpetas nativas `android/` e `ios/`, lo que confirma que hoy el proyecto está en modo bare React Native.

Conclusión:
- Para cumplir la prueba técnica, conviene **migrar o recrear la app en React Native + Expo + TypeScript**.
- La API debe vivir como un backend separado o dentro de un monorepo, pero no dentro del runtime móvil.

## Arquitectura de software recomendada

La opción más sólida para este caso es una **arquitectura monorepo modular con Clean Architecture / Hexagonal Architecture**.

### Propuesta de estructura

```text
repo/
  apps/
    mobile/        # Expo React Native
    api/           # Backend HTTP para formularios y multimedia
  packages/
    shared/        # Tipos, validaciones, constantes y DTOs compartidos
```

### Por qué esta arquitectura

- Separa claramente la app móvil de la API.
- Permite reutilizar tipos y validaciones entre front y backend.
- Facilita pruebas, mantenimiento y escalabilidad.
- Encaja bien con un formulario complejo con validaciones, archivos y fechas.

### Stack sugerido

- **Mobile:** React Native + Expo + TypeScript.
- **Formulario:** React Hook Form + Zod.
- **Fechas:** selectores nativos de Expo/React Native según plataforma.
- **Multimedia:** expo-image-picker y, si se requiere cámara, expo-camera.
- **API:** Node.js con NestJS o Express.
- **Validación backend:** Zod o class-validator.
- **Persistencia:** PostgreSQL con Prisma.
- **Archivos multimedia:** almacenamiento en S3 compatible o similar.

## Capas de la solución

### 1. Presentación

- Pantallas y componentes visuales.
- Formularios, estados de error y feedback inmediato.
- Selectores de fecha y carga de multimedia.

### 2. Dominio

- Reglas del negocio del formulario.
- Tipos de oferta.
- Validaciones de negocio: precio positivo, porcentaje entre 0 y 100, fechas coherentes, archivos obligatorios.

### 3. Aplicación

- Casos de uso para crear item, validar item y enviar item.
- Orquestación de envío al backend.

### 4. Infraestructura

- Cliente HTTP.
- Subida de archivos.
- Persistencia y acceso a API.

## Plan paso a paso

### Fase 1: Base del proyecto

1. Migrar la app a React Native + Expo + TypeScript o crear una nueva app con esa base dentro del monorepo.
2. Definir la estructura de carpetas por capas y por feature.
3. Configurar TypeScript, lint, formato y variables de entorno.
4. Preparar navegación básica si el proyecto va a crecer.

### Fase 2: Diseño del dominio

1. Definir el modelo `Item`.
2. Definir el enum `tipoOferta`.
3. Definir los DTOs de creación y respuesta.
4. Especificar reglas de validación para cada campo.

### Fase 3: Backend/API

1. Crear la API con un endpoint para recibir el formulario.
2. Implementar recepción de archivos multimedia.
3. Validar payload y archivos en el backend.
4. Guardar registros en base de datos.
5. Devolver respuestas claras para éxito y error.

### Fase 4: Formulario móvil

1. Crear la pantalla principal del formulario.
2. Implementar campos: nombre, descripción, precio, tipo de oferta, valor de descuento, multimedia y fechas.
3. Cambiar dinámicamente la etiqueta y validación del campo de descuento según el tipo de oferta.
4. Mostrar errores visibles en cada campo.

### Fase 5: Multimedia

1. Permitir selección desde galería.
2. Permitir captura con cámara.
3. Aceptar imágenes y vídeos.
4. Validar tamaño, tipo y obligatoriedad.

### Fase 6: Fechas nativas

1. Implementar selector de fecha nativo para iOS.
2. Implementar comportamiento nativo para Android.
3. Validar que fecha de inicio sea menor o igual a fecha de fin.

### Fase 7: Integración API

1. Enviar el formulario con `multipart/form-data`.
2. Subir archivos y datos en una sola operación o en dos pasos si la API lo requiere.
3. Manejar estados de carga, éxito y error.

### Fase 8: Calidad y pruebas

1. Agregar pruebas unitarias de validación.
2. Agregar pruebas del formulario.
3. Probar casos inválidos: precio negativo, porcentaje mayor a 100, campos vacíos, fechas incorrectas.
4. Probar envío desde Android e iOS.

### Fase 9: Entrega

1. Configurar build para Android e iOS con Expo.
2. Documentar instalación y ejecución.
3. Documentar variables de entorno y endpoints.
4. Preparar una guía breve de uso y pruebas.

## Riesgos y decisiones importantes

- Si se mantiene el proyecto actual como bare React Native, habrá trabajo extra para adaptarlo a Expo.
- La subida de vídeos puede requerir límites de tamaño y compresión.
- Guardar archivos directamente en la base de datos no es recomendable; mejor usar almacenamiento externo.
- Las reglas de negocio deben validarse tanto en móvil como en backend.

## Recomendación final

Si el objetivo es entregar rápido y con buena mantenibilidad, la mejor decisión es:

1. Crear una app **React Native + Expo + TypeScript** nueva o migrar el frontend actual a esa base.
2. Montar una **API separada**.
3. Organizar todo en un **monorepo**.
4. Usar **Clean Architecture** por capas dentro de cada aplicación.

Esto da una base clara, escalable y alineada con la prueba técnica.