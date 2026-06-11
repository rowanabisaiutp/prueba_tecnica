# Backend

API REST para la prueba técnica.

## Endpoints

- `GET /api/health`
- `GET /api/items`
- `POST /api/items`

## POST /api/items

Content-Type: `multipart/form-data`

Campos requeridos:

- `nombre`
- `descripcion`
- `precio`
- `tipoOferta` con valores `money` o `percentage`
- `descuento`
- `fechaInicio`
- `fechaFin`
- `multimedia` como uno o varios archivos de imagen o video

## Ejecución

```bash
cd backend
npm install
npm run dev
```

## Docker Compose

Desde la raíz del repo:

```bash
docker compose up --build
```

La API quedará disponible en `http://localhost:4000` y PostgreSQL en `localhost:5432`.