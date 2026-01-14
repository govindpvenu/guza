const nodemailer = require("nodemailer")

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000)
}

const sendEmail = async (email, generatedOTP) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || "smtp.gmail.com",
            port: parseInt(process.env.EMAIL_PORT) || 587, // Changed to 587
            secure: false, // false for 587, true for 465
            requireTLS: true, // Use STARTTLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000,
            socketTimeout: 10000,
        })
        
        let mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: email,
            subject: "Otp for registration is: ",
            html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + generatedOTP + "</h1>",
        }

        const info = await transporter.sendMail(mailOptions)
        console.log("Email sent successfully:", info.messageId)
        return info
    } catch (error) {
        console.error("Email sending error:", error)
        throw error
    }
}

module.exports = {
    sendEmail,
    generateOTP,
}
