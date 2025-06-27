const jwt = require('jsonwebtoken');
require('dotenv').config();


const secretKey = process.env.JWT_SECRET; // Use your env secret key

const verifyDoctor = (req, res, next) => {
  const token = req.cookies.doctorToken;
  if (!token) {
    return res.status(401).json({ Error: "You are not authenticated, Provide us access-token key." });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ Error: "Authentication Fail, Invalid Token!!" });
    }

    req.doctor = decoded;  // decoded has the full doctor object (except password)
    next();
  });
};

const getDoctorPortal = (req, res) => {
  return res.json({
    Success: "Success",
    ...req.doctor,
  });
};

const verifyPatient = (req, res, next) => {
    const token = req.cookies.patientToken;
    if (!token) {
      return res.status(401).json({ Error: "You are not authenticated, Provide us access-token key." });
    }
  
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(403).json({ Error: "Authentication Fail, Invalid Token!!" });
      }
  
      req.patient = decoded;  // full patient data from token payload
      next();
    });
  };
  
  // Simple patient dashboard example
  const getPatientPortal = (req, res) => {
    return res.json({
      Success: "Success",
      ...req.patient,
    });
  };

module.exports = { verifyDoctor, getDoctorPortal, getPatientPortal, verifyPatient };
