const nodemailer = require('nodemailer');

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }
    async sendActivationLink(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Activate your account on js-store shop',
            text: '',
            html:
            `
                <div>
                    <h1>Follow the link to activate your account</h1>
                    <a href="${link}">${link}</a>
                </div>
            `
        })
    }
    async sendEmailChangeConfirmationCode(to, code) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Get confirmation code for email change on js-store shop',
            text: '',
            html:
            `
                <div>
                    <h1>Enter this code to change email</h1>
                    <div>${code}</div>
                </div>
            `
        })
    }
}

module.exports = new MailService();
