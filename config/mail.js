const nodemailer = require('nodemailer')
require('dotenv').config()

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    // service:'gmail',
    port: 465,
    secure: true,
    auth: {
        user: "kka50286@gmail.com",
        pass: process.env.MAIL_PASS
    }
})


module.exports = transporter