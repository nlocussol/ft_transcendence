FROM alpine:3.18.0

RUN	apk update && apk upgrade && \
	apk add --no-cache nginx fcgi openssl

RUN	mkdir -p /var/www/html

#Remplace the default configuration
COPY	tools/conf	/etc/nginx/http.d/default.conf

COPY	tools/setup.sh	/setup.sh

COPY	code/* /var/www/html/

CMD ["sh", "/setup.sh"]
