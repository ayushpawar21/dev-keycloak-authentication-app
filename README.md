# Dockerized Web Application with Nginx & Keycloak

This project provides a step-by-step guide to install Docker, Docker Compose, and Nginx, and deploy a web application with Keycloak authentication using Docker. Follow the instructions below to set up the environment.

## Prerequisites

- A machine running a supported Linux distribution (Ubuntu/Debian)
- Access to the internet for downloading required packages

---

## 1. Docker Installation

First, install Docker on your system using the official Docker script.

```bash
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
```

---

## 2. Docker Compose Installation

Next, install Docker Compose to manage multi-container Docker applications.

```bash
curl -SL https://github.com/docker/compose/releases/download/v2.29.6/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
sudo usermod -aG docker $USER
sudo chgrp docker /usr/local/bin/docker-compose
sudo chmod 750 /usr/local/bin/docker-compose
docker-compose --version
```

---

## 3. Nginx Installation and Configuration

Install Nginx to act as a reverse proxy for the web application and Keycloak.

```bash
sudo apt install nginx
```

Now, configure Nginx by adding a new configuration file.

```bash
sudo vim /etc/nginx/sites-available/keycloak.conf
```

### Nginx Configuration File (`keycloak.conf`)

```nginx
server {
    listen 80;
    server_name 192.168.56.101;  # Replace with your server's IP address

    # Health check for the web application
    location / {
        proxy_pass http://localhost:3000;  # Forward to the web application running on port 3000
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Optional: buffer settings to handle large requests/responses
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;

        # Fallback for when the app is down
        error_page 502 = /custom_502.html;
    }

    location = /custom_502.html {
        internal;
        default_type text/html;
        add_header Content-Length 0;
        return 503;
    }

    location /auth/ {
        proxy_pass http://192.168.56.101:8080/auth/;  # Forward to Keycloak on port 8080
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Optional: buffer settings to handle large requests/responses
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;

        # Fallback for when Keycloak is down
        error_page 502 = /auth_custom_502.html;
    }

    location = /auth_custom_502.html {
        internal;
        default_type text/html;
        add_header Content-Length 0;
        return 503;
    }
}
```

Create a symbolic link to enable the configuration and test the Nginx configuration.

```bash
sudo ln -s /etc/nginx/sites-available/keycloak.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. Deploy the Web Application with Keycloak

Clone the web application repository and run it using Docker Compose.

```bash
git clone https://github.com/ayushpawar21/dev-keycloak-authentication-app.git
cd dev-keycloak-authentication-app
docker-compose up -d
```

Allow 5 minutes for the services to initialize and become fully operational.

---

### Done! 🎉

Your web application and Keycloak are now running behind an Nginx reverse proxy. Visit the server's IP address to check the deployment status.

---

### Troubleshooting

- Ensure Docker and Docker Compose are installed correctly by verifying their versions.
- Use `docker-compose logs` to check logs if any service fails to start.
- Test Nginx configuration with `nginx -t` to ensure no syntax errors exist.
