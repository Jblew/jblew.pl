FROM php:5.6-apache
RUN apt install -y mysql-client
RUN apt install -y mariadb-client
RUN docker-php-ext-install mysqli mysql