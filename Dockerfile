# STEP 1: build the React app
FROM node:20-alpine AS build
WORKDIR /App
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# STEP 2: serve the static build with nginx (persistent, lightweight)
FROM nginx:alpine
COPY --from=build /App/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

