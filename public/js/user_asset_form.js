const clientInput = document.getElementById('clientInput');
const clientIdField = document.getElementById('clientId');
const clientDropdown = document.getElementById('clientDropdown');

let filteredClients = [];
let focusedIndex = -1;

function findClientById(id) {
  return CLIENTS.find(c => c.id === id) || null;
}

function setSelectedClient(client) {
  if (!client) return;
  clientInput.value = client.name;
  clientIdField.value = client.id;
  closeDropdown();
}

function renderDropdown(items) {
  filteredClients = items;

  if (!items.length) {
    clientDropdown.innerHTML = '<li class="combo-empty">No clients found.</li>';
    openDropdown();
    return;
  }

  clientDropdown.innerHTML = items.map((client, idx) => `
    <li class="combo-item" data-index="${idx}" data-id="${client.id}" tabindex="0">${client.name}</li>
  `).join('');

  clientDropdown.querySelectorAll('.combo-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      const selClient = findClientById(id);
      setSelectedClient(selClient);
    });
  });

  openDropdown();
}

function openDropdown() {
  clientDropdown.classList.add('open');
}

function closeDropdown() {
  clientDropdown.classList.remove('open');
  focusedIndex = -1;
}

function filterClients(value) {
  const query = value.trim().toLowerCase();

  const matches = CLIENTS
    .filter(c => c.name.toLowerCase().includes(query))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
  renderDropdown(matches);
}

if (clientInput) {
  const initialClient = findClientById(INITIAL_CLIENT_ID);
  if (initialClient) {
    setSelectedClient(initialClient);
  } else {
    clientInput.value = '';
    clientIdField.value = '';
  }

  const dateInput = document.getElementById('dateInstalled');
  const datePreview = document.getElementById('dateInstalledPreview');

  function updateDatePreview(value) {
    if (!datePreview) return;
    if (!value) {
      datePreview.textContent = 'Selected date: —';
      return;
    }
    const date = new Date(value);
    const monthNames = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    ];
    if (Number.isNaN(date.getTime())) {
      datePreview.textContent = `Selected date: ${value}`;
      return;
    }
    datePreview.textContent = `Selected date: ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  if (dateInput) {
    updateDatePreview(dateInput.value);
    dateInput.addEventListener('input', (e) => updateDatePreview(e.target.value));
  }

  clientInput.addEventListener('input', (event) => {
    const query = event.target.value;
    if (query.trim().length === 0) {
      closeDropdown();
      clientIdField.value = '';
      return;
    }
    filterClients(query);
    clientIdField.value = '';
  });

  clientInput.addEventListener('keydown', (event) => {
    const items = clientDropdown.querySelectorAll('.combo-item');
    if (!items.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusedIndex = Math.min(focusedIndex + 1, items.length - 1);
      items[focusedIndex].focus();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusedIndex = Math.max(focusedIndex - 1, 0);
      items[focusedIndex].focus();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const sel = items[focusedIndex];
      if (sel) {
        const selClient = findClientById(sel.dataset.id);
        setSelectedClient(selClient);
      }
    }

    if (event.key === 'Escape') {
      closeDropdown();
    }
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.combo-wrap')) {
      closeDropdown();
    }
  });

  clientInput.addEventListener('focus', () => {
    if (clientInput.value.trim()) {
      filterClients(clientInput.value);
    } else {
      closeDropdown();
    }
  });

  // Auto-select if there is exactly one match when the user clicks away without
  // explicitly picking from the dropdown list.
  clientInput.addEventListener('blur', () => {
    // Small delay so a dropdown item click fires before this blur handler runs
    setTimeout(() => {
      if (clientIdField.value) return; // already resolved via dropdown
      const query = clientInput.value.trim().toLowerCase();
      if (!query) return;
      // Prefer exact name match first
      const exact = CLIENTS.filter(c => c.name.toLowerCase() === query);
      if (exact.length === 1) {
        setSelectedClient(exact[0]);
        return;
      }
      // Fall back to single partial match
      const partials = CLIENTS.filter(c => c.name.toLowerCase().includes(query));
      if (partials.length === 1) {
        setSelectedClient(partials[0]);
      }
    }, 150);
  });
}