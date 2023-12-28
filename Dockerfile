#STEP 1 BUILD OF REACT PROJECT
FROM node:alpine
WORKDIR /App
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build 
EXPOSE 3000
CMD [ "npm", "start"]


