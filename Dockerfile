# Before building the docker image, compile the source:
# REACT_APP_BACKEND_URL="http://flightranker.com/gql" npm run-script build

FROM nginx:alpine

COPY build /var/www/
COPY deploy/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

STOPSIGNAL SIGTERM

CMD ["nginx", "-g", "daemon off;"]
