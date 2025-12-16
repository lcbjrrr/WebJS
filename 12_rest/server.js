const express = require('express');
const app = express();
const PORT = 3000;
const cors = require('cors');
app.use(cors());
// The API Endpoint
app.get('/date', (req, res) => {
  const now = new Date();
  
  // Returning a JSON object is standard for REST APIs
  res.json({
    iso: now.toISOString(),
    day: now.getDate(),
    month: now.getMonth() + 1, // Months are 0-indexed
    year: now.getFullYear(),
    readable: now.toDateString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/date`);
});