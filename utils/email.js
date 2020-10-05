const nodemailer = require('nodemailer');


const sendEmail = async options => {

    //create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    //define the email options
    const mailOptions = {
        from: 'Hasan Romadon<hello@hasan.com>',
        to: options.mail,
        subject: options.subject,
        text: options.message
        //html
    }
    //actualy send the mail
    //this method return promise
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;