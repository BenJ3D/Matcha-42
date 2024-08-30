FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm install -g @angular/cli

CMD ["ng", "serve", "--host", "0.0.0.0"]
