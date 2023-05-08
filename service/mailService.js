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
    async sendOrderDetails(to, order, products) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Order details js-store`,
            text: '',
            html:
            `
                <div>
                    <h4>Your order №${order._id} has been created</h4>
                    ${products.map(product => {
                        return `
                        <div style="margin-bottom: 10px;">
                            <span style="padding: 5px 0px; margin-right: 5px; font-weight: bold;">${product.item.name}</span><br>
                            Size: <span style="padding: 5px 0px; margin-right: 5px; font-weight: bold;">${product.size}</span><br>
                            Amount: <span style="padding: 5px 0px; margin-right: 5px; font-weight: bold;">${product.amount}</span><br>
                            Item price: <span style="padding: 5px 0px; margin-right: 5px; font-weight: bold;">${product.amount * product.item.value}$</span><br>
                        </div>
                        `
                    })}
                    ${order.deliveryMethod === 'post' ? `
                        <div>
                            City: <span style="padding: 5px 0px; margin-right: 5px; font-weight: bold;">${order.deliveryDetails.city}</span><br>
                            Post office: <span style="padding: 5px 0px; margin-right: 5px; font-weight: bold;">${order.deliveryDetails.postOffice}</span><br>
                        </div>
                    ` : order.deliveryMethod === 'courier' ? `
                        <div>
                            City: <span style="padding: 5px 0px; margin-right: 5px; font-weight: bold;">${order.deliveryDetails.city}</span><br>
                            Street: <span style="padding: 5px 0px; margin-right: 5px; font-weight: bold;">${order.deliveryDetails.street}</span><br>
                            Building: <span style="padding: 5px 0px; margin-right: 5px; font-weight: bold;">${order.deliveryDetails.building}</span><br>
                            ${order.deliveryDetails.apartment ? `Apartment: <span style="padding: 5px 0px; margin-right: 5px; font-weight: bold;">${order.deliveryDetails.apartment}</span><br>` : ''}
                        </div>
                    ` : ``}
                    <div style="margin-top: 10px;">
                        <span style="padding: 5px 0px; margin-right: 5px; font-weight: bold;">Contact details</span><br>
                        Name: <span style="padding: 5px 0px; margin-right: 5px; font-weight: bold;">${order.contactDetails.name}</span><br>
                        Surname: <span style="padding: 5px 0px; margin-right: 5px; font-weight: bold;">${order.contactDetails.surname}</span><br>
                        Phone: <span style="padding: 5px 0px; margin-right: 5px; font-weight: bold;">${order.contactDetails.phone}</span><br>
                        Email: <span style="padding: 5px 0px; margin-right: 5px; font-weight: bold;">${order.contactDetails.email}</span><br>
                    </div>
                    <h4>Total price: ${order.value}$</h4>
                </div>
            `
        })
    }
}

module.exports = new MailService();
