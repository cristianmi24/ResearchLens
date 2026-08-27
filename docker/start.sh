#!/bin/sh
set -e

su-exec node node /app/dist/index.js &
exec nginx -g "daemon off;"
