const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Define email options
  const mailOptions = {
    from: `FitQuest <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || options.message
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent: ', info.messageId);
  
  return info;
};

module.exports = sendEmail;
