const express = require('express');
const routes = require('./routes/routes');

const app = express();
const port =  process.env.PORT;

app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.static('images'));

app.use('/', routes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});