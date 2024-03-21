# websocket-games

Project with some multiplayer games playable in real-time over websockets

## TicTacToe

![TicTacToe](readmePictures/tictactoe.png "TicTacToe")

##  Drawing

![Drawing](readmePictures/drawing.png "Drawing")

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
