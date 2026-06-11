# offerd app

Aplicación móvil (iOS y Android) para crear y consultar ofertas con multimedia. Construida con Expo SDK 56 + API backend propia.

## Estructura del Proyecto

| Carpeta | Qué es | Stack |
|---------|--------|-------|
| `frontend/` | App móvil | Expo SDK 56 · React Native 0.85 · React 19 · TypeScript |
| `backend/` | API backend | Node.js · Express 5 · PostgreSQL · TypeScript |

## Qué pide la prueba y cómo se resuelve

| Requisito | Solución |
|-----------|----------|
| Formulario para crear un "item" (nombre, descripción, precio, tipo de oferta, multimedia, fechas) | Pantalla `create` con validación en tiempo real |
| Tipo de oferta con campo dinámico (dinero / porcentaje) | Render condicional del campo de descuento |
| Todos los campos obligatorios con aviso visual claro | Validación con borde rojo + mensaje por campo |
| Validaciones (precio ≥ 0, % ≤ 100, fechas, etc.) | Reglas de validación en cliente y servidor (Zod) |
| Subir imágenes/vídeos desde cámara o galería | `expo-image-picker` (launchCameraAsync / launchImageLibraryAsync) |
| Selector de fecha nativo por plataforma (iOS/Android) | `@react-native-community/datetimepicker` |
| Desarrollar con Expo | Expo SDK 56 (New Architecture) |
| API que reciba y procese los datos + archivos | Express + Multer (multipart/form-data), arquitectura por capas |
| La app llama a la API enviando todo (incluida multimedia) | FormData con archivos en formato React Native |

### Funcionalidades adicionales

- CRUD completo: Lista → Crear → Detalle
- Búsqueda y filtro en la lista de items
- Badge de vigencia: Activa / Próxima / Expirada
- Búsqueda por nombre y descripción
- Filtro por tipo de oferta (Todos / Dinero / Porcentaje)
- Pull-to-refresh para recargar datos

## Puesta en marcha

Necesitas **Node ≥ 20** y **PostgreSQL**.

### Con Docker (recomendado)

Requisitos: [Docker](https://docs.docker.com/get-docker/) + [Docker Compose](https://docs.docker.com/compose/install/).

#### Backend + PostgreSQL

```bash
# Levantar backend y base de datos
docker compose up -d postgres backend
```

Esto inicia:
- **PostgreSQL** en `localhost:5432` (usuario: `postgres`, password: `postgres`, db: `miproyecto`)
- **Backend API** en `localhost:4000` (con auto-migración del schema)

La base de datos se persiste en el volumen `postgres_data`. Los archivos subidos se guardan en `./backend/uploads/`.

#### Solo PostgreSQL (para desarrollo local del backend)

```bash
docker compose up -d postgres
# Espera a que esté healthy, luego:
cd backend
npm install
cp .env.example .env
npm run dev
```

#### Detener y limpiar

```bash
# Detener contenedores
docker compose down

# Detener y borrar volumen de base de datos
docker compose down -v
```

#### Variables de entorno del backend en Docker

| Variable | Default en compose | Descripción |
|----------|--------------------|-------------|
| `PORT` | `4000` | Puerto de la API |
| `CORS_ORIGIN` | `*` | Origen permitido para CORS |
| `DATABASE_URL` | `postgresql://postgres:postgres@postgres:5432/miproyecto` | URL de conexión a PostgreSQL |

#### Frontend con Docker (servir build web)

Para servir la app web (React Native Web) desde Docker:

```bash
# Build de producción
cd frontend
npx expo export --platform web

# Crear imagen y servir
docker build -t miproyecto-frontend .
docker run -p 3000:80 miproyecto-frontend
```

La app web se sirve en `http://localhost:3000`. Necesitas configurar `EXPO_PUBLIC_API_URL` al crear el build:

```bash
EXPO_PUBLIC_API_URL=http://localhost:4000/api npx expo export --platform web
```

### Sin Docker (desarrollo local)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edita .env con tu DATABASE_URL
npm run dev
```

La API se ejecuta en `http://localhost:4000`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edita .env con tu EXPO_PUBLIC_API_URL (usa la IP de tu máquina)
npm start
```

### Configuración de red

| Entorno | URL de la API |
|---------|---------------|
| Emulador Android | `http://10.0.2.2:4000/api` |
| Dispositivo físico | `http://<TU-IP-LAN>:4000/api` |
| iOS simulador / web | `http://localhost:4000/api` |

Para obtener tu IP en Windows: `ipconfig`

## Arquitectura

### Backend

Arquitectura por capas:

```
routes → controller → service → repository → PostgreSQL
```

- **Patrón Repository** sobre PostgreSQL
- **Validación con Zod** en el servidor
- **Multer** para manejo de archivos multipart/form-data

**Estructura:**
```
backend/src/
├── config/env.ts           # Variables de entorno
├── controllers/            # Manejo de requests
├── db/                     # Pool PostgreSQL + migraciones
├── middlewares/            # Upload de archivos (Multer)
├── repositories/           # Queries SQL
├── routes/                 # Endpoints
├── services/               # Lógica de negocio
├── validators/             # Schemas Zod
└── app.ts / index.ts       # Entry point
```

### Frontend

Arquitectura feature-based con expo-router:

**Estructura:**
```
frontend/src/
├── app/                    # Pantallas (expo-router)
│   ├── _layout.tsx         # Layout con tabs
│   ├── index.tsx           # Lista de items
│   ├── create.tsx          # Formulario
│   └── detail/item.tsx     # Detalle
├── components/             # UI reutilizable
├── constants/theme.ts      # Colores, spacing
├── hooks/                  # Hooks personalizados
├── services/               # API client + estado global
└── types/                  # Tipos TypeScript
```

- **expo-router** para navegación basada en archivos
- **Primitivas de UI** reutilizables (ThemedView, ThemedText)
- **Validación en cliente** antes de enviar al servidor

## Decisiones técnicas

1. **TypeScript estricto** en ambos lados
2. **Validación en cliente y servidor**: Zod es la fuente de verdad
3. **Arquitectura por capas** en la API con patrón Repository
4. **Fechas nativas reales** por plataforma (evita errores de escritura)
5. **Subida de archivos con FormData** (formato RN: { uri, name, type })
6. **Monorepo simple** para entregar app + API juntas

## CI/CD

GitHub Actions corre en cada push o PR:

```yaml
# .github/workflows/ci.yml
- Backend: install → build
- Frontend: install → typecheck
```

Para correr localmente:

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npx tsc --noEmit
```

## Builds (iOS y Android)

### Requisitos

```bash
npm install -g eas-cli
eas login
cd frontend
eas build:configure
```

### Android

```bash
# APK para testing
eas build --platform android --profile preview

# AAB para Google Play
eas build --platform android --profile production
```

### iOS (requiere macOS)

```bash
# IPA para App Store / TestFlight
eas build --platform ios --profile production
```

### Configurar .env para builds

```env
EXPO_PUBLIC_API_URL=https://tu-dominio.com/api
```

Ver sección "Builds" en este README para más detalles.

## Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## Control de versiones

Sugerencia de organización:
- Commit inicial: API funcionando + tests
- Segundo commit: App funcionando + tests

## Licencia

MIT