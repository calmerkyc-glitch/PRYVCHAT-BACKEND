import nodemailer from "nodemailer";

export const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.sendMail({
    from: "Pryv Chat <no-reply@pryvchat.com>",
    to: email,
    subject: "Your OTP Code",
    text: `Your Pryv Chat OTP is ${otp}`,
  });
};
