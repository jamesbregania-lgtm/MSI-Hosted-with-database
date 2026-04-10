const express = require('express');
const clients = require('../data/clients');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const activeClients = clients
    .filter(c => c.status !== 'inactive')
    .sort((a, b) => a.name.localeCompare(b.name));

  res.render('user_account', {
    currentUser: req.session.user,
    clients: activeClients
  });
});



module.exports = router;