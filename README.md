# MiProyecto

Aplicación móvil (iOS y Android) para crear y consultar ofertas con multimedia. Construida con Expo SDK 56 + API backend propia.

## Prueba Técnica - Resumen

**Requisitos cumplidos:**

| Requisito | Implementación |
|-----------|----------------|
| **Formulario de item** | Campos: nombre, descripción, precio, tipo de oferta, multimedia, fechas |
| **Tipo de oferta dinámico** | Menú desplegable: "Descuento en dinero" o "Descuento en porcentaje" |
| **Campo condicional** | Cambia automáticamente según el tipo de oferta seleccionado |
| **Campos obligatorios** | Validación con aviso visual (borde rojo + mensaje de error) |
| **Validaciones** | Precio > 0, porcentaje ≤ 100, fechas válidas, inicio ≤ fin |
| **Subida de archivos** | Imágenes y videos desde cámara o galería |
| **Selectores de fecha nativos** | iOS: picker nativo, Android: picker nativo |
| **Framework Expo** | Expo SDK 56 con New Architecture |
| **API backend** | Node.js + Express + PostgreSQL que recibe y procesa datos + multimedia |

**Entregable:** Aplicación móvil funcional para iOS y Android + código de la API.

## Estructura del Proyecto

El proyecto se compone de dos partes independientes:

| Carpeta | Qué es | Stack |
|---------|--------|-------|
| `frontend/` | App móvil | Expo SDK 56 · React Native 0.85 · React 19 · TypeScript |
| `backend/` | API backend | Node.js · Express 5 · SQLite · TypeScript |

Cada carpeta tiene su propio README con detalle de arquitectura, scripts y decisiones.

## Qué pide la prueba y cómo se resuelve

| Requisito | Solución |
|-----------|----------|
| Formulario para crear un "item" (nombre, descripción, precio, tipo de oferta, multimedia, fechas) | Pantalla `create` con validación en tiempo real |
| Tipo de oferta con campo dinámico (dinero / porcentaje) | Render condicional del campo de descuento |
| Todos los campos obligatorios con aviso visual claro | Validación con borde rojo + mensaje por campo |
| Validaciones (precio ≥ 0, % ≤ 100, fechas, etc.) | Reglas de validación en cliente y servidor |
| Subir imágenes/vídeos desde cámara o galería | `expo-image-picker` (launchCameraAsync / launchImageLibraryAsync) |
| Selector de fecha nativo por plataforma (iOS/Android) | `@react-native-community/datetimepicker` |
| Desarrollar con Expo | Expo SDK 56 (New Architecture) |
| API que reciba y procese los datos + archivos | Express + Multer (multipart/form-data), arquitectura por capas |
| La app llama a la API enviando todo (incluida multimedia) | FormData con archivos en formato React Native |

### Funcionalidades adicionales

- **CRUD completo**: Lista → Crear → Detalle → Editar
- **Búsqueda y filtro** en la lista de items
- **Badge de vigencia**: Activa / Próxima / Expirada
- **Toast de confirmación** al crear item
- **Aviso de peso** con compresión de imágenes grandes
- **Búsqueda por nombre y descripción**
- **Filtro por tipo de oferta** (Todos / Dinero / Porcentaje)
- **Pull-to-refresh** para recargar datos

## Puesta en marcha

### Requisitos previos

- **Node.js ≥ 20** (verificar: `node --version`)
- **PostgreSQL** (para backend)
- **Expo CLI** (`npm install -g expo-cli`)
- **Expo Go** (en dispositivo móvil) o emulador/simulador

### Backend

**1. Instalar dependencias:**
```bash
cd backend
npm install
```

**2. Configurar variables de entorno:**
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tu configuración:
PORT=4000
CORS_ORIGIN=*
DATABASE_URL=postgresql://usuario:password@localhost:5432/miproyecto
```

**3. Crear base de datos PostgreSQL:**
```sql
CREATE DATABASE miproyecto;
```

**4. Levantar el servidor:**
```bash
npm run dev
```

El servidor se ejecuta en `http://localhost:4000` y crea automáticamente las tablas al iniciar.

**Endpoints disponibles:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Health check - `{"ok": true, "service": "backend", "timestamp": "..."}` |
| GET | `/api/items` | Listar todos los items |
| POST | `/api/items` | Crear nuevo item (multipart/form-data) |

**Scripts disponibles:**

```bash
npm run dev      # Desarrollo con hot-reload (tsx watch)
npm run build    # Compilar a JavaScript (tsc)
npm start        # Ejecutar código compilado
npm run lint     # Validar con ESLint
```

### Frontend

**1. Instalar dependencias:**
```bash
cd frontend
npm install
```

**2. Configurar URL de la API:**

Crear archivo `.env` en `frontend/`:
```env
EXPO_PUBLIC_API_URL=http://<TU-IP>:4000/api
```

**Importante:** La URL depende del entorno:

| Entorno | Valor |
|---------|-------|
| Emulador Android | `http://10.0.2.2:4000/api` |
| Dispositivo físico | `http://<TU-IP-LAN>:4000/api` |
| iOS simulador / web | `http://localhost:4000/api` |

**3. Iniciar la app:**
```bash
npm start
```

Se abrirá un QR code. Luego:
- **Android:** Escanear QR con Expo Go o presionar `a`
- **iOS:** Escanear QR con Camera app o presionar `i`
- **Web:** Presionar `w`

**Scripts disponibles:**

```bash
npm start      # Iniciar Expo Dev Server
npm run android  # Abrir en emulador Android
npm run ios      # Abrir en simulador iOS
npm run web      # Abrir en navegador
npm run lint     # Validar con ESLint
```

## Arquitectura

### Backend

Arquitectura por capas (Layered Architecture):

```
┌─────────────────────────────────────────────────────────┐
│                    Express Server                        │
│                      (index.ts)                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      app.ts                              │
│           (middleware, routes, error handling)           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    Routes Layer                          │
│               (routes/item.routes.ts)                    │
│          GET /api/items, POST /api/items                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Controller Layer                        │
│           (controllers/item.controller.ts)               │
│         (validación con Zod, manejo de files)            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Service Layer                          │
│           (services/item.service.ts)                     │
│            (lógica de negocio, mapeo)                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Repository Layer                        │
│          (repositories/item.repository.ts)               │
│         (acceso a datos, queries SQL)                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Database (PostgreSQL)                   │
│              (db/pool.ts, db/migrate.ts)                 │
└─────────────────────────────────────────────────────────┘
```

**Estructura de directorios del Backend:**

```
backend/
├── src/
│   ├── config/
│   │   └── env.ts                 # Variables de entorno (dotenv)
│   ├── controllers/
│   │   └── item.controller.ts     # Manejo de requests/responses
│   ├── db/
│   │   ├── pool.ts                # Pool de conexiones PostgreSQL
│   │   └── migrate.ts             # Migraciones de base de datos
│   ├── middlewares/
│   │   └── upload.middleware.ts   # Multer para archivos multipart
│   ├── repositories/
│   │   └── item.repository.ts     # Queries SQL, patrón Repository
│   ├── routes/
│   │   └── item.routes.ts         # Definición de endpoints
│   ├── services/
│   │   └── item.service.ts        # Lógica de negocio
│   ├── types/
│   │   └── item.ts                # Tipos TypeScript
│   ├── validators/
│   │   └── item.schema.ts         # Schema Zod de validación
│   ├── app.ts                     # Configuración de Express
│   └── index.ts                   # Punto de entrada
├── uploads/                       # Archivos multimedia subidos
├── dist/                          # Código compilado (JavaScript)
├── package.json
├── tsconfig.json
└── .env.example
```

**Tecnologías del Backend:**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | ≥ 20 | Runtime |
| Express | 5.x | Framework HTTP |
| TypeScript | 5.8+ | Tipado estático |
| Zod | 3.24+ | Validación de schemas |
| PostgreSQL | - | Base de datos |
| pg | 8.16+ | Cliente PostgreSQL |
| Multer | 2.0+ | Upload de archivos |
| dotenv | 16.4+ | Variables de entorno |
| tsx | 4.19+ | TypeScript executor (dev) |

**Endpoints de la API:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/items` | Listar todos los items |
| POST | `/api/items` | Crear nuevo item (multipart/form-data) |

### Frontend

Arquitectura basada en features con expo-router:

```
┌─────────────────────────────────────────────────────────┐
│                   Expo Router                           │
│               (Navegación basada en archivos)            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    Pantallas                             │
│   src/app/index.tsx         →  Lista de items           │
│   src/app/create.tsx        →  Formulario de creación   │
│   src/app/detail/item.tsx   →  Detalle del item         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Componentes UI                          │
│   ThemedView, ThemedText, AppTabs, etc.                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    Servicios                             │
│   api.ts (axios)           →  Cliente HTTP              │
│   item-store.ts            →  Estado global             │
└─────────────────────────────────────────────────────────┘
```

**Estructura de directorios del Frontend:**

```
frontend/
├── src/
│   ├── app/                      # expo-router (pantallas)
│   │   ├── _layout.tsx           # Layout principal con tabs
│   │   ├── index.tsx             # Home: lista de items
│   │   ├── create.tsx            # Formulario de creación
│   │   └── detail/
│   │       ├── _layout.tsx       # Layout de detalle
│   │       └── item.tsx          # Detalle de item
│   ├── components/
│   │   ├── ui/
│   │   │   └── collapsible.tsx   # Componente colapsable
│   │   ├── animated-icon.tsx     # Icono animado (splash)
│   │   ├── animated-icon.module.css
│   │   ├── app-tabs.tsx          # Tabs de navegación
│   │   ├── external-link.tsx     # Link externo
│   │   ├── hint-row.tsx          # Fila de hint
│   │   ├── themed-text.tsx       # Texto con tema
│   │   ├── themed-view.tsx       # Vista con tema
│   │   └── web-badge.tsx         # Badge para web
│   ├── constants/
│   │   └── theme.ts              # Colores, spacing, fonts
│   ├── hooks/
│   │   ├── use-color-scheme.ts   # Hook para tema
│   │   ├── use-color-scheme.web.ts
│   │   └── use-theme.ts          # Hook para colores del tema
│   ├── services/
│   │   ├── api.ts                # Cliente axios para API
│   │   └── item-store.ts         # Estado global (item seleccionado)
│   ├── types/
│   │   └── item.ts               # Tipos TypeScript
│   └── global.css                # Estilos globales
├── assets/
│   ├── images/                   # Iconos y assets
│   └── expo.icon
├── package.json
├── app.json                      # Configuración de Expo
├── tsconfig.json
└── README.md
```

**Tecnologías del Frontend:**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Expo SDK | 56 | Framework React Native |
| React Native | 0.85.3 | UI móvil |
| React | 19.2.3 | Librería UI |
| TypeScript | 6.0+ | Tipado estático |
| expo-router | 56.2.9 | Navegación basada en archivos |
| axios | 1.17+ | Cliente HTTP |
| expo-image-picker | 56.0.16 | Cámara y galería |
| @react-native-community/datetimepicker | 9.1.0 | Selectores de fecha nativos |
| expo-image | 56.0.10 | Renderizado de imágenes |

**Flujo de creación de item:**

```
┌─────────────────────────────────────────────────────────────┐
│  1. Usuario completa formulario en create.tsx               │
│     - Nombre, descripción, precio, tipo de oferta           │
│     - Descuento (dinero o porcentaje)                       │
│     - Fechas de inicio y fin (pickers nativos)              │
│     - Multimedia (cámara o galería)                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Validación en cliente (campo por campo)                 │
│     - Bordes rojos + mensajes de error                      │
│     - Precio > 0, porcentaje ≤ 100, fechas válidas          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Envío a API con FormData (axios)                        │
│     - Campos en formato multipart/form-data                 │
│     - Archivos con formato RN { uri, name, type }           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Backend valida con Zod y guarda en PostgreSQL           │
│     - Archivos en /uploads                                  │
│     - Metadata en tabla items                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Navegación automática a lista de items                  │
│     - Toast de confirmación                                 │
│     - Pull-to-refresh para recargar                         │
└─────────────────────────────────────────────────────────────┘
```

## Decisiones técnicas

1. **TypeScript estricto** en ambos lados del proyecto
2. **Validación en cliente y servidor**: el backend nunca confía solo en la app. El schema Zod es la fuente de verdad
3. **Arquitectura por capas en la API** (routes → controller → service → repository) con patrón Repository sobre PostgreSQL
4. **Arquitectura feature-based en la app** con primitivas de UI reutilizables
5. **Fechas nativas reales** por plataforma (`@react-native-community/datetimepicker`), evitando errores de escritura manual
6. **Subida de archivos con FormData** usando el formato { uri, name, type } de React Native
7. **expo-router** para navegación basada en archivos (file-based routing)
8. **Temas claro/oscuro** automáticos según configuración del sistema
9. **Monorepo simple** (dos paquetes en una carpeta) para entregar app + API juntas

## Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## Builds (Compilación para iOS y Android)

### Requisitos previos

1. **Tener EAS CLI instalado:**
   ```bash
   npm install -g eas-cli
   ```

2. **Iniciar sesión en Expo:**
   ```bash
   eas login
   ```

3. **Configurar EAS Build (primera vez):**
   ```bash
   cd frontend
   eas build:configure
   ```

4. **Configurar la URL de la API** en `frontend/.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://<TU-IP>:4000/api
   ```

### Compilación para Android

#### APK para testing (desarrollo)

```bash
cd frontend
eas build --platform android --profile preview
```

- Genera un APK instalable directamente
- Útil para testing en dispositivos físicos
- No requiere Google Play

#### APK/AAB para producción (Google Play)

```bash
cd frontend
eas build --platform android --profile production
```

- Genera un AAB (Android App Bundle) para Google Play
- Requiere cuenta de desarrollador Google Play ($25 USD único)

#### Build local (solo APK)

```bash
cd frontend
eas build --platform android --local
```

- Requiere tener Android SDK instalado
- Genera APK localmente sin usar la nube de EAS

### Compilación para iOS

#### Requisitos adicionales

- **macOS** es obligatorio para compilar iOS
- **Xcode** instalado (desde App Store)
- **Apple Developer Account** ($99 USD/año)
- **Cocoapods** (`sudo gem install cocoapods`)

#### Build en la nube (recomendado)

```bash
cd frontend
eas build --platform ios --profile production
```

- Requiere Apple Developer Account
- Genera un archivo `.ipa` para App Store
- Se puede usar TestFlight para testing

#### Build para simulador (solo testing local)

```bash
cd frontend
eas build --platform ios --profile development
```

- Para testing en simulador
- Requiere Xcode

#### Build local (solo macOS)

```bash
cd frontend
eas build --platform ios --local
```

- Requiere macOS con Xcode
- Genera IPA localmente

### Perfiles de build (eas.json)

Crear `frontend/eas.json`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "resourceClass": "m-medium"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "tu-apple-id@email.com",
        "ascAppId": "1234567890"
      }
    }
  }
}
```

### Pasos completos para Android

```bash
# 1. Instalar dependencias
cd frontend
npm install

# 2. Configurar URL de la API
# Crear archivo .env con:
# EXPO_PUBLIC_API_URL=http://<TU-IP>:4000/api

# 3. Configurar EAS
eas build:configure

# 4. Compilar APK para testing
eas build --platform android --profile preview

# 5. Instalar APK en dispositivo
# - Descargar APK desde Expo
# - Transferir al dispositivo Android
# - Instalar (permitir "orígenes desconocidos")
```

### Pasos completos para iOS

```bash
# 1. Tener macOS con Xcode instalado
# 2. Tener Apple Developer Account

# 3. Instalar dependencias
cd frontend
npm install

# 4. Configurar URL de la API
# Crear archivo .env con:
# EXPO_PUBLIC_API_URL=http://<TU-IP>:4000/api

# 5. Configurar certificados en Apple Developer Portal
# - EAS lo puede hacer automático la primera vez

# 6. Compilar para producción
eas build --platform ios --profile production

# 7. Subir a TestFlight o App Store
# - Usar eas submit o App Store Connect
```

### Notas importantes de red

| Entorno | URL de la API |
|---------|---------------|
| **Emulador Android** | `http://10.0.2.2:4000/api` |
| **Simulador iOS** | `http://localhost:4000/api` |
| **Dispositivo físico** | `http://<TU-IP-LAN>:4000/api` |
| **Producción** | `https://tu-dominio.com/api` |

Para encontrar tu IP en la red local:

**Windows:**
```powershell
ipconfig
# Buscar "IPv4" en la interfaz activa (ej: 192.168.1.XXX)
```

**macOS/Linux:**
```bash
ifconfig
# Buscar "inet" en la interfaz activa (ej: 192.168.1.XXX)
```

### Tiempos estimados de build

| Plataforma | Perfil | Tiempo estimado |
|------------|--------|-----------------|
| Android | preview | 10-15 minutos |
| Android | production | 15-20 minutos |
| iOS | development | 20-25 minutos |
| iOS | production | 25-30 minutos |

### Distribución

**Android:**
- **APK directo:** Compartir archivo APK
- **Google Play Internal:** Hasta 100 testers internos
- **Google Play Closed:** Lista específica de testers
- **Google Play Open:** Todos los usuarios

**iOS:**
- **TestFlight:** Hasta 10,000 testers externos
- **App Store:** Todos los usuarios

## Control de versiones

El repositorio Git/GitHub lo gestiona el autor manualmente.

Sugerencia de organización:
- Un commit inicial con la API funcionando + tests
- Otro commit con la app funcionando + tests

## Licencia

MIT