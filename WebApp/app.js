const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const path = require('path');

const app = express();

// Set up session middleware
const memoryStore = new session.MemoryStore();

app.use(
  session({
    secret: 'mysecret', // Use a secure secret in production
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

// Initialize Keycloak middleware
const keycloak = new Keycloak({
  store: memoryStore,
  realm: process.env.KEYCLOAK_REALM,
  'auth-server-url': process.env.KEYCLOAK_AUTH_URL,
  'ssl-required': 'none',
  resource: process.env.KEYCLOAK_CLIENT_ID,
  credentials: {
    secret: process.env.KEYCLOAK_CLIENT_SECRET,
  },
  'confidential-port': 0,
});

// Protecting routes with Keycloak
app.use(keycloak.middleware());

// Serve static files (CSS, Images)
app.use(express.static(path.join(__dirname, 'public')));

// Public route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Demo Application</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <header>
          <h1>Welcome to the Demo Application</h1>
        </header>
        <main>
          <p>Explore the features of this app.</p>
          <a href="/secure" class="btn">Go to Secure Area</a>
          <a href="/logout" class="btn">Logout</a>
        </main>
        <footer>
          <p>&copy; 2024 Demo App. All rights reserved.</p>
        </footer>
      </body>
    </html>
  `);
});

// Secure route (authentication required)
app.get('/secure', keycloak.protect(), (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Secure Area</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <header>
          <h1>Secure Area</h1>
        </header>
        <main>
          <p>You are authenticated!</p>
          <a href="/" class="btn">Go back to Home</a>
        </main>
        <footer>
          <p>&copy; 2024 Demo App. All rights reserved.</p>
        </footer>
      </body>
    </html>
  `);
});

// Keycloak logout route
//app.get('/logout', keycloak.protect(), (req, res) => {
//  req.logout();
//  res.redirect('/');
//});

// Keycloak logout route
app.get('/logout', keycloak.protect(), (req, res) => {
  const redirectUri = 'http://localhost:3000'; // Change this to your actual redirect URL
  req.logout();
  res.redirect(`${process.env.KEYCLOAK_AUTH_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(redirectUri)}`);
});



// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

