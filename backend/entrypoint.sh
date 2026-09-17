#!/bin/sh
touch /var/www/database/database.sqlite
php artisan migrate:fresh --seed --force
php artisan serve --host=0.0.0.0 --port=8000