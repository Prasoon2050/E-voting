FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY . .
# Set NODE_ENV to production for smaller footprint
ENV NODE_ENV=production
CMD [ "node", "evote-chaincode.js" ]