FROM php:8.3-apache

# Install required system packages
RUN apt-get update && apt-get install -y \\
    git \\
    curl \\
    libpng-dev \\
    libonig-dev \\
    libxml2-dev \\
    zip \\
    unzip \\
    libpq-dev \\
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \\
    && apt-get install -y nodejs \\
    && apt-get clean \\
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions required for Laravel & PostgreSQL
RUN docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy the entire application codebase into the container
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Install Node dependencies and build assets for React/Inertia
RUN npm install
RUN npm run build

# Configure Apache DocumentRoot to point to Laravel's public directory
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \\
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Enable Apache mod_rewrite for Laravel routing
RUN a2enmod rewrite

# Fix permissions for Laravel storage and cache directories
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \\
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Create a startup script to configure the Render PORT dynamically,
# run migrations, and optimize caches before starting Apache
RUN cat <<'EOF' > /usr/local/bin/start.sh
#!/bin/bash
# Bind Apache to the PORT assigned by Render
sed -i "s/Listen 80/Listen ${PORT:-80}/g" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \\*:80>/<VirtualHost \\*:${PORT:-80}>/g" /etc/apache2/sites-available/000-default.conf

# Run database migrations
php artisan migrate --force

# Cache Laravel configurations
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start Apache in the foreground
exec docker-php-entrypoint apache2-foreground
EOF

RUN chmod +x /usr/local/bin/start.sh

# Run the startup script when the container launches
CMD ["/usr/local/bin/start.sh"]
