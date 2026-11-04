# websocket-games

Project with some multiplayer games playable in real-time over websockets

### Used technologies

[<img align="left" width="26" height="26" alt="Typescript" src="readmePictures/devicons_typescript.svg" style="padding: 0 20px 16px 0"/>](https://www.typescriptlang.org "Typescript")
[<picture><source media="(prefers-color-scheme: light)" srcset="readmePictures/devicons_express_darkmode.svg" /><img align="left" width="26" height="26" alt="Express.js" src="readmePictures/devicons_express_lightmode.svg" style="padding: 0 20px 16px 0"/></picture>](https://expressjs.com "Express.js")
[<img align="left" width="26" height="26" alt="Vue.js" src="readmePictures/devicons_vuejs.svg" style="padding: 0 20px 16px 0"/>](https://vuejs.org "Vue.js")
[<img align="left" width="26" height="26" alt="Javascript" src="readmePictures/devicons_javascript.svg" style="padding: 0 20px 16px 0"/>](https://en.wikipedia.org/wiki/JavaScript "Javascript")
[<img align="left" width="26" height="26" alt="CSS" src="readmePictures/devicons_css3.svg" style="padding: 0 20px 16px 0"/>](https://en.wikipedia.org/wiki/CSS "CSS")
[<img align="left" width="26" height="26" alt="HTML" src="readmePictures/devicons_html5.svg" style="padding: 0 20px 16px 0"/>](https://en.wikipedia.org/wiki/HTML "HTML")
[<img align="left" width="26" height="26" alt="Pinia" src="readmePictures/logos_pinia.svg" style="padding: 0 20px 16px 0"/>](https://pinia.vuejs.org "Pinia")
[<img align="left" width="26" height="26" alt="shadcn-vue" src="readmePictures/simple-icons_shadcnui_vue.svg" style="padding: 0 20px 16px 0"/>](https://www.shadcn-vue.com "shadcn-vue")
[<img align="left" width="26" height="26" alt="TailwindCSS" src="readmePictures/devicons_tailwindcss.svg" style="padding: 0 20px 16px 0"/>](https://tailwindcss.com "TailwindCSS")
[<img align="left" width="26" height="26" alt="Vite" src="readmePictures/devicons_vitejs.svg" style="padding: 0 20px 16px 0"/>](https://vitejs.dev/ "Vite")
[<img align="left" width="26" height="26" alt="VueUse" src="readmePictures/logos_vueuse.svg" style="padding: 0 20px 16px 0"/>](https://vueuse.org "VueUse")
[<img align="left" width="26" height="26" alt="NodeJS" src="readmePictures/devicons_nodejs.svg" style="padding: 0 20px 16px 0"/>](https://nodejs.org/en "NodeJS")
[<img align="left" width="26" height="26" alt="SQlite" src="readmePictures/devicons_sqlite.svg" style="padding: 0 20px 16px 0"/>](https://www.sqlite.org/index.html "SQlite")
[<img width="26" height="26" alt="Prisma ORM" src="readmePictures/devicons_prisma.svg" style="padding: 0 20px 16px 0"/>](https://www.prisma.io/ "Prisma ORM")

## TicTacToe

![TicTacToe](readmePictures/tictactoe.png "TicTacToe")

##  Drawing

![Drawing](readmePictures/drawing.png "Drawing")

##  Rock, paper, scissors

![Rock, paper, scissors](readmePictures/rockpaperscissors.png "Rock, paper, scissors")

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

### Deploy backend
```
cd backend
fly deploy --ha=false
```