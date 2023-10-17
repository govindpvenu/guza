const nodemailer = require("nodemailer")

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000)
}

const sendEmail = async (email, generatedOTP) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            service: "Gmail",
            auth: {
                user: "govindpvenu.txt@gmail.com",
                pass: "xmmdtviyfcbstqrr",
            },
        })
        let mailOptions = {
            from: "govindpvenu.txt@gmail.com",
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
