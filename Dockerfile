FROM node:20-slim

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm install
RUN npm install --prefix backend

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
