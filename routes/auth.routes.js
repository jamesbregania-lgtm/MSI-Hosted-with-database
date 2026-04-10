const express = require('express');
const bcrypt = require('bcryptjs');
const accounts = require('../data/accounts');

const router = express.Router();

router.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  return req.session.user.role === 'admin'
    ? res.redirect('/admin_account')
    : res.redirect('/user_account');
});

router.get('/login', (req, res) => {
  if (req.session.user) {
    return req.session.user.role === 'admin'
      ? res.redirect('/admin_account')
      : res.redirect('/user_account');
  }

  res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const found = accounts.find(
    acc => acc.username === username && acc.status !== 'inactive'
  );

  if (!found) {
    return res.render('login', { error: 'Invalid credentials or account is inactive.' });
  }

  const isMatch = await bcrypt.compare(password, found.passwordHash);

  if (!isMatch) {
    return res.render('login', { error: 'Invalid credentials or account is inactive.' });
  }

  req.session.user = {
    username: found.username,
    role: found.role,
    fullName: found.fullName,
    department: found.department,
    branch: found.branch
  };

  return found.role === 'admin'
    ? res.redirect('/admin_account')
    : res.redirect('/user_account');
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

module.exports = router;