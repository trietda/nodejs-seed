FROM node:10-alpine
RUN apk --no-cache add --virtual builds-deps build-base python
WORKDIR /server
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "node", "src/index.js" ]
