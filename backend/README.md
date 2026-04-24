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
npm run seed
npm run start:dev
```

## Variables de entorno

Usa `.env` o `.env.example`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-secret-change-me"
PORT=3001
```

## Rutas principales

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/teams`
- `GET /api/matches`
- `POST /api/matches` admin
- `PATCH /api/matches/:id/status` admin
- `PATCH /api/matches/:id/result` admin
- `DELETE /api/matches/:id` admin
- `GET /api/predictions/me`
- `GET /api/predictions/match/:matchId`
- `PUT /api/predictions/match/:matchId`
- `GET /api/special-predictions/me`
- `PUT /api/special-predictions/me`
- `GET /api/ranking`