const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendEmail = async ({ to, subject, html }) => {
    const msg = {
        to,
        from: process.env.SENDGRID_FROM,
        subject,
        html,
    }

    const response = await sgMail.send(msg)
    return response
}

module.exports = sendEmail