const { Resend } = require("resend")

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000)
}

const sendEmail = async (email, generatedOTP) => {
    try {
        if (!process.env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY environment variable is not set")
        }

        const resend = new Resend(process.env.RESEND_API_KEY)

        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || "onboarding@resend.dev",
            to: email,
            subject: "OTP for registration",
            html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + generatedOTP + "</h1>",
        })

        if (error) {
            console.error("Resend API error:", error)
            throw new Error(error.message || "Failed to send email")
        }

        console.log("Email sent successfully:", data.id)
        return data
    } catch (error) {
        console.error("Email sending error:", error)
        throw error
    }
}

module.exports = {
    sendEmail,
    generateOTP,
}
