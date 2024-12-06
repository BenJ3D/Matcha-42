FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Development
# RUN npm install -g nodemon
# CMD ["npm", "run", "dev"]


# Production
# RUN npm run build
CMD ["npm", "run", "start"]
