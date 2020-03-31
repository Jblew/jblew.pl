FROM php:5.6-apache
RUN docker-php-ext-install mysqli mysql
RUN a2enmod rewrite
COPY www/ /var/www/html/
