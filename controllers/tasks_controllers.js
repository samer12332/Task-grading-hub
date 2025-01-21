const Task = require('../models/tasks_models');
const Submission = require('../models/submissions_model');
const appError = require('../utils/appError');


const getTasks = async (req, res, next) => {
    const tasks = await Task.find({});
    res.status(200).json({
        status: 'success',
        message: 'Tasks retrieved successfully',
        data: {
            tasks
        }
    })
} 

const postTask = async (req, res, next) => {
    const {title, description, deadline} = req.body;
    const newTask = new Task({title, description, deadline});
    await newTask.save();
    res.status(201).json({
        status: 'success',
        message: 'Task created successfully',
        data: {
            newTask
        }
    })
}

const getOneTask = async (req, res, next) => {
    const {taskId} = req.params;
    const task = await Task.findById(taskId);
    if (!task) {
        next(appError.create('Task not found', 404, 'fail'));
        return;
    }
    res.status(200).json({
        status: 'success',
        message: 'Task retrieved successfully',
        data: {
            task
        }
    });
}



const uploadTask = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userEmail = req.user.email;
        const taskId = req.params.taskId;

        const task = await Task.findOne({_id: taskId});

        if(!task) {
            next(appError.create('Task not found', 404, 'fail'));
            return;
        }

        const currentDate = new Date;
        if (currentDate > task.deadline) {
            next(appError.create('Submission deadline has passed', 400, 'fail'));
            return;
        }

        const newSubmission = new Submission({
            taskId,
            userId,
            userEmail,
            fileName: req.file.filename,
            filePath: req.file.path
        });
        await newSubmission.save();
        res.status(200).json({
            status: 'success',
            message: 'File uploaded successfully',
            data: {
                newSubmission
            }
        });
    } catch (err) {
        console.log(err);
    }
}

const getSubmissions = async (req, res, next) => {
    const taskId = req.params.taskId;
    const userRole = req.user.role;
    const userId = req.user.id;
    let submissions;
    if (userRole == 'ADMIN') {
        submissions = await Submission.find({taskId});
    }
    else if (userRole == 'STUDENT') {
        submissions = await Submission.find({taskId, userId});
    }
    res.status(200).json({
        status: 'success',
        message: 'Submissions retrieved successfully',
        data: {
            submissions
        }
    });
}

const getOneSubmission = async (req, res, next) => {
    const {submissionId} = req.params;
    const submission = await Submission.findById(submissionId);
    if (!submission) {
        next(appError.create('Submission not found', 404, 'fail'));
        return;
    }
    res.status(200).json({
        status: 'success',
        message: 'Submission retrieved successfully',
        data: {
            submission
        }
    });
}

const deleteSubmission = async (req, res, next) => {
    const {taskId, submissionId} = req.params;
    const task = await Task.findById(taskId);
    const currentDate = new Date;
    if (currentDate > task.deadline) {
        return next(appError.create('Deadline has passed', 400, 'fail'));
    }
    const submission = await Submission.findByIdAndDelete(submissionId);
    if (!submission) {
        next(appError.create('Submission not found', 404, 'fail'));
        return;
    }
    res.status(200).json({
        status: 'success',
        message: 'Submission deleted successfully',
        data: null
    });
}

const postGrade = async (req, res, next) => {
    const {grade, feedback} = req.body;
    const {submissionId} = req.params;
    const submission = await Submission.findOne({_id: submissionId});
    if (!submission) {
        next(appError.create('Submission not found', 404, 'fail'));
        return;
    }
    if(submission.grade) {
        next(appError.create('Grade is already posted', 400, 'fail'));
        return;
    }
    submission.grade = grade;
    submission.feedback = feedback;
    await submission.save();
    res.status(200).json({
        status: 'success',
        message: 'Grade posted successfully',
        data: {
            submission
        }
    });
}

const updateTask = async (req, res, next) => {
    const taskId = req.params.taskId;
    const updatedData = req.body;
    const updatedTask = await Task.findByIdAndUpdate(taskId, updatedData, {
        new: true
    });
    if (!updatedTask) {
        return next(appError.create('Task not found', 404, 'fail'));
    }
    res.status(200).json({
        status: 'success',
        message: 'Task updated successfully',
        data: {
            updatedTask
        }
    });
}

const deleteTask = async (req, res, next) => {
    const taskId = req.params.taskId;
    const task = await Task.findByIdAndDelete(taskId);
    if (!task) {
        return next(appError.create('Task not found', 404, 'fail'));
    }
    res.status(200).json({
        status: 'success',
        message: 'Task deleted successfully',
        data: null
    });
}



module.exports = {
    getTasks,
    postTask,
    getOneTask,
    uploadTask,
    getSubmissions,
    getOneSubmission,
    postGrade,
    updateTask,
    deleteTask,
    deleteSubmission
}