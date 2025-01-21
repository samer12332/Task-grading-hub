const multer = require('multer');
const appError = require('../utils/appError');

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('file', file);
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        const filename = `${file.originalname}-${Date.now()}.${ext}`;
        cb(null, filename);
    }
});

const filefilter = (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    if (ext == 'pdf') {
        return cb(null, true);
    } else {
        const error = appError.create('Only PDF files are allowed', 400, 'fail');
        cb(error, false);
    }
}

const upload = multer({storage: diskStorage, fileFilter: filefilter});

module.exports = upload;