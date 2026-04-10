const express = require('express');
const clients = require('../data/clients');
const machines = require('../data/machines');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/new-machine', requireAuth, (req, res) => {
  const activeClients = clients
    .filter(c => c.status !== 'inactive')
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
  const selectedClientId = req.query.clientId || '';

  res.render('user_asset_form', {
    currentUser: req.session.user,
    clients: activeClients,
    selectedClientId,
    success: null,
    error: null,
    savedAsset: null
  });
});

router.post('/new-machine', requireAuth, (req, res) => {
  const activeClients = clients.filter(c => c.status !== 'inactive');
  let { clientId, unit, model, serialNo, dateInstalled, runningHours, status, description, history } = req.body;

  // Fallback: if clientId is empty but clientName was submitted, match by name.
  if (!clientId && req.body.clientName) {
    const matched = activeClients.find(
      c => c.name.toLowerCase() === req.body.clientName.trim().toLowerCase()
    );
    if (matched) clientId = matched.id;
  }

  // Validate all required fields including unit
  if (!clientId || !unit || !model || !serialNo || !dateInstalled || !runningHours || !status) {
    return res.render('user_asset_form', {
      currentUser: req.session.user,
      clients: activeClients,
      selectedClientId: clientId || '',
      success: null,
      error: 'Please fill in all required fields (Client, Unit, Model, Serial No, Date Installed, Running Hours, Status).',
      savedAsset: null
    });
  }

  const client = clients.find(c => c.id === clientId);

  // Convert date format into dd/mm/yyyy for consistent display/storage
  let installedDate = dateInstalled || '';
  const ymdMatch = installedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymdMatch) {
    installedDate = `${ymdMatch[3]}/${ymdMatch[2]}/${ymdMatch[1]}`;
  }

  const dmyMatch = installedDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmyMatch) {
    const day = String(dmyMatch[1]).padStart(2, '0');
    const month = String(dmyMatch[2]).padStart(2, '0');
    const year = dmyMatch[3];
    installedDate = `${day}/${month}/${year}`;
  }

  const asset = {
    clientId,
    clientName: client ? client.name : 'Unknown Client',
    location: client ? client.location : 'Unknown',
    unit,
    model,
    serialNo,
    dateInstalled: installedDate,
    runningHours,
    status,
    description,
    history: history || '',
    submittedBy: req.session.user
      ? req.session.user.fullName || req.session.user.username || 'Unknown User'
      : 'Unknown User'
  };

  machines.push(asset);

  res.render('user_asset_form', {
    currentUser: req.session.user,
    clients: activeClients,
    selectedClientId: clientId,
    success: 'Printer asset request submitted successfully.',
    error: null,
    savedAsset: asset
  });
});

module.exports = router;