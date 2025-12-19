const nodemailer = require("nodemailer")

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000)
}

const sendEmail = async (email, generatedOTP) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || "smtp.gmail.com",
            port: parseInt(process.env.EMAIL_PORT) || 465,
            secure: process.env.EMAIL_SECURE === "false" ? false : true,
            service: process.env.EMAIL_SERVICE || "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        })
        let mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Otp for registration is: ",
            html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + generatedOTP + "</h1>",
        }

        await transporter.sendMail(mailOptions)
    } catch (error) {
        console.error(error)
    }
}

module.exports = {
    sendEmail,
    generateOTP,
}
