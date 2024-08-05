FROM node:18

WORKDIR /app
COPY package*.json ./

RUN npm install
COPY . .

RUN npm install -g @angular/cli

# Commande pour démarrer l'application en mode développement avec hot reload
CMD ["ng", "serve", "--host", "0.0.0.0"]
