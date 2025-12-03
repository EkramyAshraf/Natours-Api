const nodemailer = require('nodemailer');

class Email {
  constructor(user, url, subject = '', message = '') {
    this.to = user.email;
    this.from = process.env.EMAIL_FROM;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.message = message;
    this.subject = subject;
  }

  //create transporter
  newTransporter() {
    if (process.env.NODE_ENV === 'production') {
      //sendGrid
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  //send the actual email
  async send() {
    //define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: this.subject,
      text: this.message,
    };
    //create transporter and email
    await this.newTransporter().sendMail(mailOptions);
  }
}

module.exports = Email;
