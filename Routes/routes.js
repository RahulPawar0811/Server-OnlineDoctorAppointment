const express = require('express');
const { registerDoctor, doctorLogin, patientRegister, patientLogin, doctorLogout, patientLogout } = require('../Controllers/authController');
const { uploadDoctors, uploadPatients, uploadPrescriptions } = require('../Configs/multerConfig');
const { verifyDoctor, getDoctorPortal, verifyPatient, getPatientPortal } = require('../Middlewares/authMiddleware');
const { getAllDoctors, getDoctorById, submitPrescription } = require('../Controllers/doctorController');
const { submitConsultation, getPatientsById, getAllPatients, getPatientsByDoctorId } = require('../Controllers/patientController');
const router = express.Router();


router.post('/registerDoctor', uploadDoctors.single('profilePicture'), registerDoctor);
router.post('/doctorLogin',doctorLogin);
router.get('/doctorPortal',verifyDoctor,getDoctorPortal);
router.post('/patientRegister', uploadPatients.single('profilePicture'), patientRegister);
router.post('/patientLogin',patientLogin);
router.get('/patientPortal',verifyPatient,getPatientPortal);
router.get('/doctorLogout',doctorLogout);
router.get('/patientLogout',patientLogout);
router.get('/getAllDoctors',getAllDoctors);
router.get('/getDoctorById/:id',getDoctorById);
router.post('/submitConsultation',submitConsultation);
router.get('/getPatientsById/:id',getPatientsById);
router.get('/getPatientsByDoctorId/:id',getPatientsByDoctorId);
router.get('/getAllPatients',getAllPatients);
router.post('/submitPrescription',uploadPrescriptions.single('prescription_pdf'),submitPrescription);





module.exports = router;