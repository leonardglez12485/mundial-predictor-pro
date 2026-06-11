# Backend NestJS

Backend API para Mundial Predictor Pro usando NestJS, Prisma, SQLite y autenticación JWT.

## Stack

- NestJS
- Prisma ORM
- SQLite para desarrollo local
- JWT para auth
- bcrypt para hash de contraseñas

## Módulos incluidos

- Auth con login, registro y perfil JWT
- Usuarios
- Equipos
- Partidos
- Predicciones por partido
- Predicciones especiales
- Ranking

## Comandos

```bash
cd backend
npm install
npm run prisma:generate
npx prisma migrate dev --name init
npm run seed -- --confirm-reset
npm run start:dev
```

Desde la raíz del proyecto también podés usar:

```bash
npm install
npm run start
```

Eso levanta frontend + backend juntos usando la base SQLite local ya configurada.
Si el backend ya está corriendo en el puerto 3001, el comando lo reutiliza y no intenta levantar otro.

`seed` elimina todos los datos existentes y requiere `--confirm-reset`. La importación completa del
calendario reemplaza los partidos existentes y requiere
`npm run schedule:import -- --confirm-replace-matches`.

## Variables de entorno

Usa `.env` o `.env.example`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-secret-change-me"
PORT=3001
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
CORS_ORIGINS="http://localhost:5173,http://localhost:3000"
SWAGGER_ENABLED=true
```

En producción con frontend en Vercel y backend en Render, configurá:

```env
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
CORS_ORIGINS="https://TU-FRONTEND.vercel.app"
```

En Vercel, el frontend debe tener:

```env
VITE_API_BASE_URL="https://mundial-predictor-pro-1.onrender.com/api"
```

## Rutas principales

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/teams`
- `GET /api/matches`
- `POST /api/matches` admin
- `PATCH /api/matches/:id/status` admin
- `PATCH /api/matches/:id/participants` admin, para resolver cruces eliminatorios pendientes
- `PATCH /api/matches/:id/result` admin
- `DELETE /api/matches/:id` admin
- `GET /api/predictions/me`
- `GET /api/predictions/match/:matchId`
- `PUT /api/predictions/match/:matchId`
- `GET /api/special-predictions/me`
- `PUT /api/special-predictions/me`
- `GET /api/ranking`

## Swagger

Con `SWAGGER_ENABLED=true`, la documentación queda disponible en `/api/docs`.
