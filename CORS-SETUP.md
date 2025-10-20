# CORS Configuration for Drupal API Server

## Instructions

Add this configuration to the `.htaccess` file on your API server at:
**https://phpstack-1514009-5817011.cloudwaysapps.com**

Place this code **at the top** of your `.htaccess` file, before any existing Drupal rules.

---

## .htaccess Configuration

```apache
# ================================================================
# CORS Configuration for Angular Frontend
# ================================================================
# This allows the Angular app at phpstack-1514009-5872259.cloudwaysapps.com
# to make API requests to this Drupal backend
# ================================================================

<IfModule mod_headers.c>
    # Allow requests from your Angular frontend domain
    Header always set Access-Control-Allow-Origin "https://phpstack-1514009-5872259.cloudwaysapps.com"
    
    # Allow these HTTP methods
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    
    # Allow these request headers
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, Accept"
    
    # Cache preflight requests for 1 hour
    Header always set Access-Control-Max-Age "3600"
    
    # Handle preflight OPTIONS requests
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>

# ================================================================
# Your existing Drupal .htaccess rules continue below...
# ================================================================
```

---

## Alternative: Allow All Origins (For Testing Only)

**WARNING: Less secure - only use for testing!**

```apache
<IfModule mod_headers.c>
    # Allow requests from ANY domain (not recommended for production)
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, Accept"
</IfModule>
```

---

## Alternative: Drupal services.yml Configuration

If you prefer to configure CORS in Drupal instead of .htaccess:

**File Location:** `sites/default/services.yml`

```yaml
# CORS Configuration
cors.config:
  enabled: true
  allowedHeaders:
    - 'Content-Type'
    - 'Authorization'
    - 'X-Requested-With'
    - 'Accept'
  allowedMethods:
    - 'GET'
    - 'POST'
    - 'PUT'
    - 'DELETE'
    - 'OPTIONS'
  allowedOrigins:
    - 'https://phpstack-1514009-5872259.cloudwaysapps.com'
  exposedHeaders: false
  maxAge: 3600
  supportsCredentials: false
```

**After editing services.yml, clear Drupal cache:**
```bash
drush cr
```
Or via admin panel: Configuration → Performance → Clear all caches

---

## Testing CORS Configuration

After applying the configuration, test it with:

```bash
curl -I -X OPTIONS \
  -H "Origin: https://phpstack-1514009-5872259.cloudwaysapps.com" \
  -H "Access-Control-Request-Method: GET" \
  https://phpstack-1514009-5817011.cloudwaysapps.com/events-management?_format=json
```

**Expected Response Headers:**
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://phpstack-1514009-5872259.cloudwaysapps.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept
```

---

## Troubleshooting

### If CORS still doesn't work:

1. **Check if mod_headers is enabled:**
   ```bash
   # On Apache
   sudo a2enmod headers
   sudo service apache2 restart
   ```

2. **Check if mod_rewrite is enabled:**
   ```bash
   sudo a2enmod rewrite
   sudo service apache2 restart
   ```

3. **Check Apache error logs:**
   ```bash
   tail -f /var/log/apache2/error.log
   ```

4. **Verify .htaccess is being read:**
   - Ensure `AllowOverride All` is set in your Apache virtual host configuration

### If using services.yml:

1. Make sure the file is in the correct location: `sites/default/services.yml`
2. Clear Drupal cache after any changes
3. Check file permissions (should be readable by web server)

---

## Security Notes

- **Production:** Always specify the exact origin domain (as shown above)
- **Development:** You can use `*` temporarily, but change it before going live
- **HTTPS Only:** Make sure both frontend and API use HTTPS in production
- **Credentials:** Set `supportsCredentials: true` only if you need to send cookies/auth headers

---

## Contact

For issues or questions about this configuration, contact your system administrator.

**Frontend URL:** https://phpstack-1514009-5872259.cloudwaysapps.com
**API URL:** https://phpstack-1514009-5817011.cloudwaysapps.com

