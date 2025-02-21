const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Basic API route
app.get('/api/v1/status', (req, res) => {
  res.json({
    service: 'Jewish Network State Identity Service',
    version: '1.0.0',
    status: 'operational'
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
