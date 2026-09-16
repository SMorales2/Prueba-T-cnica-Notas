# Usamos una imagen oficial de PHP con FPM y 
FROM php:8.2-fpm

# Instalar dependencias del sistema y extensiones necesarias para Laravel y SQLite/MySQL
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    sqlite3 \
    libsqlite3-dev

# Limpiar caché
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar Composer (el gestor de paquetes de PHP)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Definir el directorio de trabajo dentro del contenedor
WORKDIR /var/www

# Copiar el código del backend
COPY . /var/www

# Instalar las dependencias de PHP de producción/desarrollo
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Dar permisos a las carpetas de almacenamiento y caché de Laravel
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Exponer el puerto 8000 para el servidor interno de Laravel
EXPOSE 8000

# Comando por defecto para arrancar el servidor de desarrollo de Laravel
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]