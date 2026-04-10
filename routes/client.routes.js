const express = require('express');
const clients = require('../data/clients');
const machines = require('../data/machines');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/:clientId', requireAuth, (req, res) => {
  const activeClients = clients.filter(c => c.status !== 'inactive');
  const clientId = req.params.clientId;
  const client = clients.find(c => c.id.toLowerCase() === clientId.toLowerCase());
  const machineRecords = client
    ? machines.filter(m => m.clientId.toLowerCase() === client.id.toLowerCase())
    : [];

  res.render('client', {
    currentUser: req.session.user,
    clientId,
    clients: activeClients,
    machineRecords,
    appsScriptUrl: process.env.APPS_SCRIPT_URL || ''
  });
});

module.exports = router;