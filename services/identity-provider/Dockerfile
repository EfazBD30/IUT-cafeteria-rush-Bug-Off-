# use node 18 as base
FROM node:18-alpine

# set working directory inside container
WORKDIR /app

# copy package.json first (so docker can cache dependencies)
COPY package.json .

# install dependencies
RUN npm install

# copy the rest of the code
COPY . .

# tell docker which port this service uses
EXPOSE 3001

# start the service
CMD ["node", "index.js"]