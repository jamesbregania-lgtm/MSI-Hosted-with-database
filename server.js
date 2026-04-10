require('dotenv').config();
const app = require('./app');

// Remove the hardcoded '192.168.254.195' and 'HOST' variable
const PORT = process.env.PORT || 3000;

// Listen on all network interfaces (default behavior)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
