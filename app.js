const express = require('express');
const routes = require('./routes/routes');

const app = express();
const port = 8000;

require('dotenv').config();

app.set('view engine', 'pug');
app.use(express.static('public'));

app.use('/', routes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});