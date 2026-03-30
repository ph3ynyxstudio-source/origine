# 1. Image de base
FROM node:18-alpine

# 2. Installation de pnpm
RUN npm install -g pnpm

# 3. Dossier de travail
WORKDIR /app

# 4. Copie des fichiers
COPY . .

# 5. Installation des dépendances
RUN pnpm install

# 6. Build du serveur
RUN pnpm --filter @workspace/api-server build

# 7. Port utilisé par Google Cloud
EXPOSE 8080

# 8. Lancement
CMD ["pnpm", "--filter", "@workspace/api-server", "start"]