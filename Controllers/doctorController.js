const { pool } = require("../Configs/dbConfig")
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');


const getAllDoctors = async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
  
      // Run the query to fetch all doctors
      const [rows] = await connection.query("SELECT * FROM appointments.doctors;");
  
      // Send doctors data as JSON
      res.status(200).json(rows);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ message: "Failed to fetch doctors", error: error.message });
    } finally {
      if (connection) connection.release(); // Always release connection back to pool
    }
  };

const getDoctorById = async (req, res) => {
  const { id } = req.params; // get doctor ID from URL param

  try {
    const connection = await pool.getConnection();

    // Query doctor by ID
    const [rows] = await connection.query(
      'SELECT * FROM appointments.doctors WHERE id = ?',
      [id]
    );

    connection.release();

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(rows[0]); // send back doctor info
  } catch (error) {
    console.error('Error getting doctor by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const submitPrescription = async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    const {
      patient_id,
      consultation_id,
      doctor_id,
      care,
      medicines,
      patient_email
    } = req.body;

    console.log('Request Body:', req.body);
    console.log('Uploaded File:', req.file);

    if (!req.file) {
      return res.status(400).json({ message: 'Prescription PDF is required.' });
    }

    // File path info from multer
    const fileName = req.file.filename;
    const fullPath = req.file.path;
    const relativePath = path.join('uploads', 'prescriptions', fileName);

    // Insert into database
    const query = `
      INSERT INTO prescriptions
      (patient_id, consultation_id, doctor_id, care_to_be_taken, medicines, pdf, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    await connection.query(query, [
      patient_id,
      consultation_id,
      doctor_id,
      care,
      medicines,
      relativePath,
    ]);

    // Send email with attachment
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "rahulpawar9887@gmail.com",
        pass: "pxla wzdz hmok dvzv", // App password
      },
    });

    await transporter.sendMail({
      from: '"Dr. Clinic" <rahulpawar9887@gmail.com>',
      to: patient_email,
      subject: 'Your Prescription',
      text: 'Please find your prescription attached.',
      attachments: [
        {
          filename: fileName,
          path: fullPath,
        },
      ],
    });

    res.status(200).json({
      message: 'Prescription submitted and emailed successfully.',
    });

  } catch (error) {
    console.error('Error submitting prescription:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    if (connection) connection.release();
  }
};

const updatePrescription = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const {
      prescription_id,
      patient_id,
      doctor_id,
      care,
      medicines,
      patient_email
    } = req.body;

    let updateSQL = `
      UPDATE prescriptions
      SET care = ?, medicines = ?, doctor_id = ?, updated_at = NOW()
    `;
    const params = [care, medicines, doctor_id];

    const file = req.files?.prescription_pdf;
    let filePath;

    if (file) {
      const fileName = `prescription_updated_${Date.now()}_${patient_id}.pdf`;
      filePath = `uploads/prescriptions/${fileName}`;
      await file.mv(filePath);
      updateSQL += `, pdf_path = ?`;
      params.push(filePath);
    }

    updateSQL += ` WHERE id = ?`;
    params.push(prescription_id);

    await connection.query(updateSQL, params);

    if (file) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.yourprovider.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });
      await transporter.sendMail({
        from: `"Dr. Clinic" <${process.env.MAIL_USER}>`,
        to: patient_email,
        subject: 'Updated Prescription',
        text: 'Your updated prescription is attached.',
        attachments: [{ filename: filePath.split('/').pop(), path: filePath }],
      });
    }

    res.status(200).json({ message: 'Prescription updated and emailed successfully.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    if (connection) connection.release();
  }
};


  module.exports = {
    getAllDoctors,
    getDoctorById,
    submitPrescription,
    updatePrescription
    
  }