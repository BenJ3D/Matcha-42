FROM node:20.16.0

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Installer nodemon globalement pour permettre le hot reload
RUN npm install -g nodemon

# Commande pour démarrer l'application en mode développement
CMD ["npm", "run", "dev"]


# Commandes pour démarrer l'application en mode production (a decommenter + decommenter ligne CMD dev)
# RUN npm run build
# CMD ["npm", "run", "start"] ==> passage en prod
