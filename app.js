const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const path = require('path');



const usersRouter = require('./routes/users_routes');
const tasksRouter = require('./routes/tasks_routes');


const app = express();
dotenv.config();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authenticateToken = require('./middlewares/authenticateToken');
app.get('/', authenticateToken,  (req, res) => {
    try {
        res.send('Home page');
    } catch (error) {
        console.log(error);
    }
});

const port = process.env.PORT || 3001;
mongoose.connect(process.env.MONGODB_URI)
.then((conn) => {
    console.log(`Database connected at ${conn.connection.host}`);
    app.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
}).catch((err) => {
    console.log(err);
});

app.use('/api/users', usersRouter);
app.use('/api/tasks', tasksRouter);


app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        status:  err.statusText || 'error',
        message: err.message,
        code: err.statusCode || 500,
        data: null
    });
});




function generateSecretKey() {
    return crypto.randomBytes(32).toString('hex'); // Generates a 256-bit (32-byte) secret key
}

const secretKey = generateSecretKey();
//console.log('Generated Secret Key:', secretKey); 
