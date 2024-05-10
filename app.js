const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.use(express.static('public'));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/myroom', (req, res) => {
  res.sendFile(__dirname + '/public/myroom.html');
});