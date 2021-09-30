const express = require('express');
const mongoose = require('mongoose');
const cardsRoutes = require('./routes/cards');
const usersRoutes = require('./routes/users');
const bodyParser = require('body-parser');
// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use((req, res, next) => {
  req.user = {
    _id: '61554fe2640e58a66b8ec477',
  };

  next();
});

app.use(bodyParser.json());
app.use('/', cardsRoutes);
app.use('/', usersRoutes);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
