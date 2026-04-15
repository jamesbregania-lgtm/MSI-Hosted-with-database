const express = require('express');
const path = require('path');
const sessionMiddleware = require('./config/session');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');
const clientRoutes = require('./routes/client.routes');
const assetRoutes = require('./routes/asset.routes');

const app = express();

// Render runs behind a reverse proxy; trust it so secure cookies work.
app.set('trust proxy', 1);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use('/', authRoutes);
app.use('/admin_account', adminRoutes);
app.use('/user_account', userRoutes);
app.use('/user_account', assetRoutes);
app.use('/client', clientRoutes);

module.exports = app;