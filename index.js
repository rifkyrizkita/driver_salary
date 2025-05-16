const express = require('express');
const { sequelize } = require('./models');
require("dotenv").config()
const salary = require('./routes/driverRoute');

const app = express();
app.use(express.json());

// routes
app.use('/v1/salary/driver/list', salary);

async function start() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    app.listen(process.env.PORT, () => console.log('Listening on port ' + process.env.PORT));
  } catch (err) {
    console.error('DB Error:', err);
  }
}

start();
