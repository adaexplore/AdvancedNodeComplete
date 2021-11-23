FROM node:16
WORKDIR /server
# COPY package*.json ./  error: UNABLE_TO_GET_ISSUER_CERT_LOCALLY in docker, just by-pass, and copy all npm pagekages into docker,
# RUN npm install
COPY . .
EXPOSE 5000

CMD ["npm","start"]