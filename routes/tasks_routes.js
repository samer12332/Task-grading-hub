const express = require('express');
const router = express.Router();
const {asyncHandler} = require('../middlewares/asyncHandler');
const {getTasks, postTask, getOneTask, uploadTask, 
    getSubmissions, getOneSubmission, postGrade, 
    updateTask, deleteTask, deleteSubmission} = require('../controllers/tasks_controllers');
const authenticateToken = require('../middlewares/authenticateToken');
const allowedTo = require('../middlewares/allowedTo');
const {body} = require('express-validator');
const validator = require('../middlewares/validation');
const upload = require('../utils/multer');
const isTokenRevoked = require('../middlewares/revokedToken');


const validateTask = [
    body('title')
        .isString().withMessage('Title must be a string')
        .isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
    body('description')
        .isString().withMessage('Description must be a string')
        .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('deadline')
        .isISO8601().withMessage('Deadline must be a valid date')
        .isAfter(new Date().toISOString()).withMessage('Deadline must be in the future')
];

const validateGradeAndFeedback = [
    body('grade').
    isInt({ min: 0, max: 100 }).withMessage('Grade must be an integer between 0 and 100'),

    body('feedback').optional().isString().isLength({ max: 500 }).withMessage('Feedback must be a string and up to 500 characters long')
];


router.route('/')
.get(authenticateToken, asyncHandler(getTasks))
.post(authenticateToken, isTokenRevoked, allowedTo('ADMIN'), validateTask, validator, asyncHandler(postTask))

router.route('/:taskId').get(authenticateToken, isTokenRevoked, asyncHandler(getOneTask))
.post(authenticateToken, isTokenRevoked, allowedTo('STUDENT'), upload.single('pdfFile'), uploadTask)
.patch(authenticateToken, isTokenRevoked, allowedTo('ADMIN'), asyncHandler(updateTask))
.delete(authenticateToken, isTokenRevoked, allowedTo('ADMIN'), asyncHandler(deleteTask));

router.route('/:taskId/submissions').get(authenticateToken, isTokenRevoked, getSubmissions);

router.route('/:taskId/submissions/:submissionId').get(authenticateToken, isTokenRevoked, getOneSubmission)
.delete(authenticateToken, isTokenRevoked, allowedTo('STUDENT'), asyncHandler(deleteSubmission));

router.route('/:taskId/submissions/:submissionId/grade').
post(authenticateToken, isTokenRevoked, validateGradeAndFeedback, validator, allowedTo('ADMIN'), postGrade);

module.exports = router;