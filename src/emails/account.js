const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ahmadhashim018@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app ${name}. Let me know how u go along with it`
    })
}

const sendGoodByeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ahmadhashim018@gmail.com',
        subject: 'Good Bye',
        text: `it was nice to meet u ${name}. Good Bye`
    })
}

module.exports = {
    sendWelcomeMail,
    sendGoodByeEmail
}