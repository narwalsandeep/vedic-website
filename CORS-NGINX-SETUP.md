# CORS Configuration for Nginx Server (Drupal API)

## ⚠️ Important: Your Server Uses Nginx, Not Apache

The API server at `https://phpstack-1514009-5817011.cloudwaysapps.com` is running **Nginx**, 
so `.htaccess` files won't work. Use the Drupal `services.yml` configuration instead.

---

## ✅ Solution: Configure CORS in Drupal services.yml

### Step 1: Locate the File

**File Path:** `sites/default/services.yml`

```
your-drupal-root/
├── sites/
│   └── default/
│       ├── services.yml    ← Edit this file
│       └── settings.php
```

### Step 2: Add CORS Configuration

Open `sites/default/services.yml` and add this configuration:

```yaml
# CORS Configuration for Angular Frontend
cors.config:
  enabled: true
  allowedHeaders:
    - 'content-type'
    - 'authorization'
    - 'x-requested-with'
    - 'accept'
    - 'origin'
  allowedMethods:
    - 'GET'
    - 'POST'
    - 'PUT'
    - 'DELETE'
    - 'OPTIONS'
    - 'PATCH'
  allowedOrigins:
    - 'https://phpstack-1514009-5872259.cloudwaysapps.com'
  allowedOriginsPatterns: []
  exposedHeaders: false
  maxAge: 3600
  supportsCredentials: false
```

### Step 3: Clear Drupal Cache (REQUIRED!)

The changes won't take effect until you clear the cache.

**Option A - Via Drush (SSH):**
```bash
cd /path/to/drupal/root
drush cr
```

**Option B - Via Admin Panel:**
1. Log into Drupal admin at: `https://phpstack-1514009-5817011.cloudwaysapps.com/user/login`
2. Navigate to: **Configuration** → **Development** → **Performance**
3. Click: **"Clear all caches"** button

**Option C - Via Cloudways Control Panel:**
1. Log into Cloudways
2. Go to your application
3. Click "Clear Varnish Cache" or "Clear Cache"

---

## 🧪 Testing the Configuration

After clearing the cache, test if CORS headers are present:

```bash
curl -I -X OPTIONS \
  -H "Origin: https://phpstack-1514009-5872259.cloudwaysapps.com" \
  -H "Access-Control-Request-Method: GET" \
  "https://phpstack-1514009-5817011.cloudwaysapps.com/events-management?_format=json"
```

**You should see these headers in the response:**
```
Access-Control-Allow-Origin: https://phpstack-1514009-5872259.cloudwaysapps.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: content-type, authorization, x-requested-with, accept, origin
```

---

## 🔧 Alternative: Nginx Configuration (Advanced)

If you have SSH access and can modify Nginx configuration:

### Step 1: Edit Nginx Config

**File:** `/etc/nginx/sites-available/default` or your site's config

Add inside your `server` block:

```nginx
server {
    listen 80;
    server_name phpstack-1514009-5817011.cloudwaysapps.com;
    
    # Add CORS headers for all responses
    add_header 'Access-Control-Allow-Origin' 'https://phpstack-1514009-5872259.cloudwaysapps.com' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, Accept, Origin' always;
    add_header 'Access-Control-Max-Age' '3600' always;
    
    # Handle preflight OPTIONS requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://phpstack-1514009-5872259.cloudwaysapps.com';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, Accept, Origin';
        add_header 'Access-Control-Max-Age' '3600';
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' '0';
        return 204;
    }
    
    # Your existing location blocks...
    location / {
        try_files $uri /index.php?$query_string;
    }
    
    location ~ \.php$ {
        # Your PHP configuration...
    }
}
```

### Step 2: Test and Reload Nginx

```bash
# Test configuration syntax
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

---

## 🚨 Troubleshooting

### Problem: Changes Don't Take Effect

**Solution:**
1. Make sure you cleared Drupal cache (this is critical!)
2. Clear your browser cache
3. Try in incognito/private mode
4. Check if the file has correct permissions: `chmod 644 sites/default/services.yml`

### Problem: File Not Found - services.yml

**Solution:**
1. Check if `sites/default/default.services.yml` exists
2. If yes, copy it: `cp sites/default/default.services.yml sites/default/services.yml`
3. Then add the CORS configuration

### Problem: Still Getting CORS Errors

**Check these:**
1. Did you clear Drupal cache? (Most common issue!)
2. Is the origin URL exactly correct? (Check for typos, http vs https)
3. Check Drupal error logs: `tail -f sites/default/files/php-errors.log`
4. Verify services.yml syntax (YAML is whitespace-sensitive!)

### Problem: Can't Access services.yml

**Via Cloudways:**
1. Log into Cloudways
2. Go to "Application Management"
3. Click "SSH/SFTP Credentials"
4. Use SFTP client (FileZilla) to access files
5. Navigate to `sites/default/services.yml`

---

## 📝 Full services.yml Example

Here's a complete example of what your `services.yml` should look like:

```yaml
parameters:
  session.storage.options:
    gc_probability: 1
    gc_divisor: 100
    gc_maxlifetime: 200000
    cookie_lifetime: 2000000
    cookie_samesite: Lax
  twig.config:
    debug: false
    auto_reload: null
    cache: true

# CORS Configuration - ADD THIS SECTION
cors.config:
  enabled: true
  allowedHeaders:
    - 'content-type'
    - 'authorization'
    - 'x-requested-with'
    - 'accept'
    - 'origin'
  allowedMethods:
    - 'GET'
    - 'POST'
    - 'PUT'
    - 'DELETE'
    - 'OPTIONS'
    - 'PATCH'
  allowedOrigins:
    - 'https://phpstack-1514009-5872259.cloudwaysapps.com'
  allowedOriginsPatterns: []
  exposedHeaders: false
  maxAge: 3600
  supportsCredentials: false

services:
  # Your existing services...
```

---

## ✅ Summary

1. **Edit:** `sites/default/services.yml`
2. **Add:** CORS configuration (see above)
3. **Clear:** Drupal cache (REQUIRED!)
4. **Test:** Frontend should work immediately

**Important:** Always backup `services.yml` before editing!

```bash
cp sites/default/services.yml sites/default/services.yml.backup
```

---

## 📞 Need Help?

- Drupal CORS Documentation: https://www.drupal.org/docs/8/modules/cors
- Cloudways Support: https://support.cloudways.com/

**Frontend URL:** https://phpstack-1514009-5872259.cloudwaysapps.com
**API URL:** https://phpstack-1514009-5817011.cloudwaysapps.com (Nginx)

