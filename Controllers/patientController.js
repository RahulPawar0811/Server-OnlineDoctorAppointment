const { pool } = require("../Configs/dbConfig");


const submitConsultation = async (req, res) => {
  let connection;

  try {
    // Get a connection from the pool
    connection = await pool.getConnection()


    // Extract the form data sent from the frontend
    const {
      patient_id,
      doctor_id,
      current_illness,
      recent_surgery,
      surgery_timespan,
      family_history_diabetes,
      allergies,
      others,
      payment_transaction_id
    } = req.body;
    
    // Insert the data into the 'consultations' table
    const query = `
      INSERT INTO consultations
      (patient_id, doctor_id, current_illness, recent_surgery, surgery_timespan, family_history_diabetes, allergies, others, payment_transaction_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const values = [
      patient_id,
      doctor_id,
      current_illness,
      recent_surgery,
      surgery_timespan,
      family_history_diabetes,
      allergies,
      others,
      payment_transaction_id
    ];

    // Execute the query
    await connection.query(query, values);

    // Send success response
    res.status(200).json({
      message: 'Consultation successfully submitted!',
    });
  } catch (error) {
    console.error('Error submitting consultation:', error);
    res.status(500).json({
      message: 'Something went wrong during the submission. Please try again later.',
    });
  } finally {
    if (connection) connection.release(); // Release the connection back to the pool
  }
};

const getPatientsById = async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    // SQL query joining patients and consultations on patient id
    const query = `
      SELECT 
        p.*,           -- all patient columns
        c.id AS consultation_id,
        c.*            -- all consultation columns
      FROM appointments.patients p
      JOIN appointments.consultations c
        ON p.id = c.patient_id
      WHERE p.id = ?   -- you can filter by patient id from req.params or req.query
    `;

    const patientId = req.params.id; // assuming patient id is sent as URL param

    const [rows] = await connection.query(query, [patientId]);

    res.status(200).json(rows);

  } catch (error) {
    console.error('Error fetching patient consultations:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    if (connection) connection.release();
  }
};

const getAllPatients = async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    const query = `
      SELECT 
        p.*,                       -- all patient fields
        c.id AS consultation_id,  -- specific alias for consultation ID
        c.*                        -- all consultation fields (after id to avoid duplicate aliasing)
      FROM appointments.patients p
      JOIN appointments.consultations c
        ON p.id = c.patient_id
    `;

    const [rows] = await connection.query(query);

    res.status(200).json(rows);

  } catch (error) {
    console.error('Error fetching patients and consultations:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    if (connection) connection.release();
  }
};


const getPatientsByDoctorId = async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    // SQL query joining patients and consultations on patient id
    const query = `
      SELECT 
        p.*,           -- all patient columns
        c.id AS consultation_id,
        c.*            -- all consultation columns
      FROM appointments.patients p
      JOIN appointments.consultations c
        ON p.id = c.patient_id
      WHERE c.doctor_id = ?   -- you can filter by patient id from req.params or req.query
    `;

    const patientId = req.params.id; // assuming patient id is sent as URL param

    const [rows] = await connection.query(query, [patientId]);

    res.status(200).json(rows);

  } catch (error) {
    console.error('Error fetching patient consultations:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    if (connection) connection.release();
  }
};


 
module.exports ={
    submitConsultation,
    getPatientsById,
    getAllPatients,
    getPatientsByDoctorId
}