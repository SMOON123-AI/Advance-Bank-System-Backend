const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendRegistrationEmail = async(userEmail,name)=>{
  const subject = "Welcome to Backend Ledger!";

  const text = `Hello ${name}, \n\nThank you for registering at Backend Ledger! \n\nWe're excited to have you on board! \n\n\nBest regards, \nThe Backend Ledger Team`;

  const html = `<p>Hello ${name},</p>
    <p>Thank you for registering at Backend Ledger!</p>
    <p>We're excited to have you on board!</p>
    <p>Best regards,<br>The Backend Ledger Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

/**
 * Send email for a successful transaction
 */
const sendSuccessfulTransactionEmail = async (userEmail, name, amount, transactionId) => {
  const subject = "Transaction Successful - Backend Ledger";

  const text = `Hello ${name}, \n\nYour transaction of ${amount} has been successfully completed.\nTransaction ID: ${transactionId}\n\nBest regards, \nThe Backend Ledger Team`;

  const html = `<p>Hello ${name},</p>
    <p>Your transaction of <strong>${amount}</strong> has been successfully completed.</p>
    <p><strong>Transaction ID:</strong> ${transactionId}</p>
    <p>Best regards,<br>The Backend Ledger Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
};

/**
 * Send email for a failed transaction
 */
const sendFailedTransactionEmail = async (userEmail, name, amount, reason) => {
  const subject = "Transaction Failed - Backend Ledger";

  const text = `Hello ${name}, \n\nUnfortunately, your transaction of ${amount} could not be completed.\nReason: ${reason || 'System error'}\n\nBest regards, \nThe Backend Ledger Team`;

  const html = `<p>Hello ${name},</p>
    <p>Unfortunately, your transaction of <strong>${amount}</strong> could not be completed.</p>
    <p><strong>Reason:</strong> ${reason || 'System error'}</p>
    <p>Best regards,<br>The Backend Ledger Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
};

module.exports = {sendRegistrationEmail, sendSuccessfulTransactionEmail, sendFailedTransactionEmail};