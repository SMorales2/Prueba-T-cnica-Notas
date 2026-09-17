#!/bin/sh
set -e

DB_PATH=/var/www/database/database.sqlite


# persiste en el host entre reinicios del contenedor.
if [ -f "$DB_PATH" ]; then
    FIRST_RUN=false
else
    echo "Base de datos no encontrada. Creando archivo SQLite..."
    touch "$DB_PATH"
    FIRST_RUN=true
fi


# migraciones pendientes y no borra datos existentes.
php artisan migrate --force

# El seeder solo se ejecuta en el primer arranque, para no duplicar

if [ "$FIRST_RUN" = "true" ]; then
    echo "Primer arranque detectado. Sembrando datos de demostración..."
    php artisan db:seed --force
fi

php artisan serve --host=0.0.0.0 --port=8000