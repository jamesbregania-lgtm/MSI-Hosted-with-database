const express = require('express');
const bcrypt = require('bcryptjs');
const {
  findActiveAccountByUsername
} = require('../database/accounts.store');

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
  try {
    const username = String(req.body.username || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    const found = await findActiveAccountByUsername(username);

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

    await new Promise((resolve, reject) => {
      req.session.save(err => (err ? reject(err) : resolve()));
    });

    return found.role === 'admin'
      ? res.redirect('/admin_account')
      : res.redirect('/user_account');
  } catch (error) {
    console.error('Login error:', error);
    return res.render('login', { error: 'Login failed. Please try again.' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

module.exports = router;