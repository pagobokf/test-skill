FROM php:8.3-apache

# Install required system packages
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
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
ENV COMPOSER_ALLOW_SUPERUSER=1
ENV COMPOSER_MEMORY_LIMIT=-1
RUN composer install --no-dev --optimize-autoloader --ignore-platform-reqs

# Install Node dependencies and build assets for React/Inertia
# Remove Windows-generated lockfile so npm resolves Linux-compatible packages
RUN rm -f package-lock.json && npm install
RUN npm run build

# Configure Apache DocumentRoot to point to Laravel's public directory
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Enable Apache mod_rewrite for Laravel routing
RUN a2enmod rewrite

# Fix permissions for Laravel storage and cache directories
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Create a startup script to configure the Render PORT dynamically,
# run migrations, and optimize caches before starting Apache
RUN cat <<'EOF' > /usr/local/bin/start.sh
#!/bin/bash
set -e

echo "=== Starting Laravel application ==="

# Bind Apache to the PORT assigned by Render
sed -i "s/Listen 80/Listen ${PORT:-80}/g" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \\*:80>/<VirtualHost \\*:${PORT:-80}>/g" /etc/apache2/sites-available/000-default.conf

# If APP_KEY is not set in environment, generate one
if [ -z "$APP_KEY" ]; then
    echo "!!! WARNING: APP_KEY not set. Generating one (set it in Render env vars!) ==="
    php artisan key:generate --force
fi

# Create storage symlink
php artisan storage:link 2>/dev/null || true

# Ensure storage directories exist with correct permissions
mkdir -p /var/www/html/storage/framework/{sessions,views,cache/data}
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Run database migrations (safe — only runs pending migrations, no-op if up to date)
echo "=== Running migrations ==="
php artisan migrate --force 2>&1 || echo "!!! Migration failed — app will still start"

# Clear any previously cached config so env vars take effect
php artisan config:clear 2>/dev/null || true

# Cache Laravel configurations
echo "=== Caching config ==="
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "=== Starting Apache on port ${PORT:-80} ==="
# Start Apache in the foreground
exec docker-php-entrypoint apache2-foreground
EOF

RUN chmod +x /usr/local/bin/start.sh

# Run the startup script when the container launches
CMD ["/usr/local/bin/start.sh"]
