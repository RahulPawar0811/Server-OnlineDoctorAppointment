const { pool } = require('../Configs/dbConfig');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerDoctor = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const {
      name,
      email,
      phone,
      specialty,
      experience,
      password,
    } = req.body;
        console.log(req.body,req.file);

    const profile_picture = req.file?.filename || null;

    // Check if doctor already exists
    const [existing] = await connection.query(
      'SELECT id FROM doctors WHERE email = ? OR phone = ?',
      [email, phone]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Doctor already exists with email or phone' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert doctor
    await connection.query(
      `INSERT INTO doctors 
      (name, email, phone, specialty, years_of_experience, profile_picture, password_hash) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, specialty, experience, profile_picture, hashedPassword]
    );

    res.status(201).json({ message: 'Doctor registered successfully' });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  } finally {
    if (connection) connection.release();
  }
};

const doctorLogin = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }

    const [rows] = await connection.query('SELECT * FROM doctors WHERE phone = ?', [phone]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid phone or password' });
    }

    const doctor = rows[0];

    if (!doctor.password_hash) {
      console.error('No password hash found for doctor:', doctor);
      return res.status(500).json({ message: 'Doctor password not found' });
    }

    const match = await bcrypt.compare(password, doctor.password_hash);

    if (!match) {
      return res.status(401).json({ message: 'Invalid phone or password' });
    }

    const { password_hash, ...doctorData } = doctor;

    const token = jwt.sign(doctorData, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.cookie('doctorToken', token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Login successful',
      doctor: doctorData
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  } finally {
    if (connection) connection.release();
  }
};



  // Patient Register
const patientRegister = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const {
      name,
      age,
      email,
      phone,
      history_of_surgery,
      history_of_illness,
      password,
    } = req.body;
    console.log(req.body,req.file);
    

    const profile_picture = req.file ? req.file.filename : null;

    // Check if patient exists by phone or email
    const [existing] = await connection.query(
      'SELECT * FROM patients WHERE phone = ? OR email = ?',
      [phone, email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Patient with this phone or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await connection.query(
      `INSERT INTO patients
      (profile_picture, name, age, email, phone, history_of_surgery, history_of_illness, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        profile_picture,
        name,
        age,
        email,
        phone,
        history_of_surgery,
        history_of_illness,
        hashedPassword,
      ]
    );

    res.status(201).json({ message: 'Patient registered successfully', patientId: result.insertId });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  } finally {
    if (connection) connection.release();
  }
};

  
  // Patient Login
  const patientLogin = async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const { phone, password } = req.body;
  
      // Find patient by phone
      const [rows] = await connection.query('SELECT * FROM patients WHERE phone = ?', [phone]);
  
      if (rows.length === 0) {
        return res.status(401).json({ message: 'Invalid phone or password' });
      }
  
      const patient = rows[0];
  
      // Compare passwords
      const match = await bcrypt.compare(password, patient.password_hash);
      if (!match) {
        return res.status(401).json({ message: 'Invalid phone or password' });
      }
  
      // Exclude password_hash from token payload
      const { password_hash, ...patientData } = patient;
  
      // Generate JWT token with full patient data except password_hash
      const token = jwt.sign(patientData, process.env.JWT_SECRET, { expiresIn: '1d' });
  
      res.cookie('patientToken', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });
      
      res.status(200).json({
        message: 'Login successful',
        patient: patientData
      });
  
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ message: 'Something went wrong' });
    } finally {
      if (connection) connection.release();
    }
  };

  const patientLogout = (req, res) => {
    res.cookie('patientToken', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      expires: new Date(0) // Clear cookie immediately
    });
    res.status(200).json({ message: 'Patient logged out successfully' });
  };
  
  // Doctor Logout
  const doctorLogout = (req, res) => {
    res.cookie('doctorToken', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      expires: new Date(0) // Clear cookie immediately
    });
    res.status(200).json({ message: 'Doctor logged out successfully' });
  };
  
  
  

module.exports = {
  registerDoctor,
  doctorLogin,
  patientRegister,
  patientLogin,
  patientLogout,
  doctorLogout
};
