# ws-games

WIP project for playing games over websockets

Currently included games:
-TicTacToe
-Drawing

### Run frontend with hot reloading

```
cd frontend
npm run dev
```

### Run backend with hot reloading

```
cd backend
npm run dev
```

### Reset db and apply migrations

```
cd backend
npx prisma migrate reset
```

### Display DB state in browser

```
cd backend
npx prisma studio
```
