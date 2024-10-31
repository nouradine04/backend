const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODE_CODE_SENDING_EMAIL_USER,  // Assurez-vous que cette variable est définie dans .env
        pass: process.env.NODE_CODE_SENDING_EMAIL_PASSWORD,  // Correction ici
    }
});


module.exports = transport;