FROM node:20
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN npm install prisma @prisma/client
COPY . .
COPY ./.env.production ./.env
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "dev"]