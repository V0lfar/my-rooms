const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const port = 3000;

const corsOptions = {
  credentials: true,
  origin: ['http://localhost:3000', 'http://localhost:8080'] // Whitelist the domains you want to allow
};

app.use(cors(corsOptions));
app.use(express.static('public'));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/rooms', (req, res) => {
  res.sendFile(__dirname + '/public/roomlist.html');
});

app.get('/myroom/:roomCode', (req, res) => {
  res.sendFile(__dirname + '/public/myroom.html');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
