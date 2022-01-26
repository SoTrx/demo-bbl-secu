FROM node:14-alpine as build
WORKDIR /app
COPY package.json /app/
RUN yarn install
COPY . /app/
RUN yarn run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
ENV PORT 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
