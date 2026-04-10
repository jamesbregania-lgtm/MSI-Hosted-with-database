const express = require('express');
const bcrypt = require('bcryptjs');
const accounts = require('../data/accounts');
const clients = require('../data/clients');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const usernameRegex = /^[a-z_]{4,20}$/;
const passwordRegex = /^.{8,}$/;
const nameRegex = /^[A-Za-z\s.-]+$/;

function properCase(value = '') {
  return value
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

function slugify(value = '') {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function renderAdmin(req, res, { success = null, error = null } = {}) {
  const userAccounts = accounts
    .filter(a => a.role === 'user')
    .slice()
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
  const sortedClients = clients.slice().sort((a, b) => a.name.localeCompare(b.name));

  res.render('admin_account', {
    currentUser: req.session.user,
    accounts: userAccounts,
    clients: sortedClients,
    success,
    error
  });
}

router.get('/', requireAdmin, (req, res) => {
  renderAdmin(req, res);
});

router.post('/employees/create', requireAdmin, async (req, res) => {
  let { username, password, fullName, department, branch } = req.body;

  username = String(username || '').trim().toLowerCase();
  fullName = properCase(fullName || '');
  department = String(department || '').trim().toUpperCase();
  branch = properCase(branch || '');

  if (!usernameRegex.test(username)) {
    return renderAdmin(req, res, {
      error: 'Username must be 4-20 characters using lowercase letters and underscore only.',
      modal: 'create-employee'
    });
  }

  if (!passwordRegex.test(password || '')) {
    return renderAdmin(req, res, {
      error: 'Password must be at least 8 characters long.',
      modal: 'create-employee'
    });
  }

  if (!nameRegex.test(fullName)) {
    return renderAdmin(req, res, {
      error: 'Full name must contain letters and spaces only.'
    });
  }

  if (accounts.some(acc => acc.username === username)) {
    return renderAdmin(req, res, { error: 'Username already exists.' });
  }

  accounts.push({
    username,
    passwordHash: await bcrypt.hash(password, 10),
    role: 'user',
    fullName,
    department,
    branch,
    status: 'active'
  });

  return renderAdmin(req, res, { success: 'Employee account created successfully.' });
});

router.post('/employees/update', requireAdmin, (req, res) => {
  const { username } = req.body;
  const target = accounts.find(acc => acc.username === username && acc.role === 'user');

  if (!target) {
    return renderAdmin(req, res, { error: 'Employee account not found.' });
  }

  const fullName = properCase(req.body.fullName || '');
  const department = String(req.body.department || '').trim().toUpperCase();
  const branch = properCase(req.body.branch || '');

  if (!nameRegex.test(fullName)) {
    return renderAdmin(req, res, { error: 'Invalid full name.' });
  }

  target.fullName = fullName;
  target.department = department;
  target.branch = branch;

  return renderAdmin(req, res, { success: 'Employee account updated successfully.' });
});

router.post('/employees/reset-password', requireAdmin, async (req, res) => {
  const { username, newPassword } = req.body;
  const target = accounts.find(acc => acc.username === username && acc.role === 'user');

  if (!target) {
    return renderAdmin(req, res, { error: 'Employee account not found.' });
  }

  if (!passwordRegex.test(newPassword || '')) {
    return renderAdmin(req, res, {
      error: 'New password must be at least 8 characters long.'
    });
  }

  target.passwordHash = await bcrypt.hash(newPassword, 10);
  return renderAdmin(req, res, { success: 'Password reset successfully.' });
});

router.post('/employees/toggle', requireAdmin, (req, res) => {
  const { username, status } = req.body;
  const target = accounts.find(acc => acc.username === username && acc.role === 'user');

  if (!target) {
    return renderAdmin(req, res, { error: 'Employee account not found.' });
  }

  target.status = status === 'inactive' ? 'inactive' : 'active';
  return renderAdmin(req, res, { success: 'Employee status updated successfully.' });
});

router.post('/clients/create', requireAdmin, (req, res) => {
  const clientName = properCase(req.body.clientName || '');
  const location = properCase(req.body.location || '');
  const id = slugify(clientName);

  if (!clientName) {
    return renderAdmin(req, res, { error: 'Client name is required.' });
  }

  if (clients.some(c => c.id === id)) {
    return renderAdmin(req, res, { error: 'Client already exists.' });
  }

  clients.push({
    id,
    name: clientName,
    location,
    status: 'active'
  });

  return res.redirect('/admin_account#clients');
});

router.post('/clients/update', requireAdmin, (req, res) => {
  const { clientId } = req.body;
  const target = clients.find(c => c.id === clientId);

  if (!target) {
    return renderAdmin(req, res, { error: 'Client not found.' });
  }

  target.name = properCase(req.body.clientName || '');
  target.location = properCase(req.body.location || '');

  return res.redirect('/admin_account#clients');
});

router.post('/clients/toggle', requireAdmin, (req, res) => {
  const { clientId, status } = req.body;
  const target = clients.find(c => c.id === clientId);

  if (!target) {
    return renderAdmin(req, res, { error: 'Client not found.' });
  }

  target.status = status === 'inactive' ? 'inactive' : 'active';
  return res.redirect('/admin_account#clients');
});

module.exports = router;