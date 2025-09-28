import nodemailer from "nodemailer";

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// Function to send reminder email
export async function sendReminderEmail(
  to: string,
  userName: string,
  plantName: string,
  isToday: boolean
) {
  const subject = isToday
    ? `Reminder: Water ${plantName} Today`
    : `Reminder: Water ${plantName} Tomorrow`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #22c55e;">In-Class Gardening Club</h2>
      <p>Hello ${userName},</p>
      <p>This is a friendly reminder that you are assigned to water <strong>${plantName}</strong> ${
    isToday ? "today" : "tomorrow"
  }.</p>
      <p>Please don't forget to check in on the plant and record your activity on our platform.</p>
      <div style="margin: 30px 0;">
        <a href="${
          process.env.NEXTAUTH_URL
        }/dashboard" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
      </div>
      <p>Thank you for your contribution to our gardening club!</p>
      <p>Best regards,<br>In-Class Gardening Club</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"In-Class Gardening Club" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
