FROM php:8.2-apache

# Extensions MySQL nécessaires
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Activer mod_rewrite + headers CORS
RUN a2enmod rewrite headers

# Copier tous les fichiers PHP dans la racine Apache
COPY . /var/www/html/

# Permissions correctes
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Config Apache : AllowOverride + CORS
RUN echo '<Directory /var/www/html>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' >> /etc/apache2/apache2.conf

RUN printf '%s\n' \
    'Header always set Access-Control-Allow-Origin "*"' \
    'Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"' \
    'Header always set Access-Control-Allow-Headers "Content-Type, Authorization"' \
    'Header always set Access-Control-Max-Age "3600"' \
    > /etc/apache2/conf-available/cors.conf \
    && a2enconf cors

EXPOSE 80