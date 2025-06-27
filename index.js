require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./Configs/dbConfig');
const routes = require('./Routes/routes');
const cookieParser = require('cookie-parser');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Corrected CORS for frontend communication with credentials
const corsOptions = {
  //origin: 'http://localhost:3000',
  origin:"https://client-online-doctor-appointment.vercel.app",
  credentials: true,
};
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(bodyParser.json()); // Use body-parser for JSON
app.use(bodyParser.urlencoded({ extended: true })); // Handle form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/', routes);

pool.getConnection()
  .then(conn => {
    console.log('✅ Connected to MySQL database');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error connecting to the database:', err.message);
  });

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
