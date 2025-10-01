import { z } from "zod";
import nodemailer from "nodemailer";

const sendConfirmationSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
    tour: z.string().min(1),
    date: z.string().min(1),
    time: z.string().min(1),
    total: z.number().positive(),
    bookingId: z.string().min(1),
});

export async function sendConfirmationEmail(body: unknown) {
    const data = sendConfirmationSchema.parse(body);

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT),
            secure: Number(SMTP_PORT) === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        const subject = `Booking confirmation - ${data.tour} (${data.date} ${data.time})`;
        const html = `
            <h2>Thank you for your booking, ${data.name}!</h2>
            <p>Here are your details:</p>
            <ul>
                <li><strong>Tour:</strong> ${data.tour}</li>
                <li><strong>Date:</strong> ${data.date}</li>
                <li><strong>Time:</strong> ${data.time}</li>
                <li><strong>Total:</strong> €${data.total.toFixed(2)}</li>
                <li><strong>Booking ID:</strong> ${data.bookingId}</li>
            </ul>
            <p>We look forward to seeing you!</p>
        `;

        await transporter.sendMail({
            from: SMTP_USER,
            to: data.email,
            subject,
            html,
        });

        return { success: true, message: "Confirmation email sent", recipient: data.email, bookingId: data.bookingId };
    }

    // Fallback: demo mode
    console.warn("SMTP is not configured. Falling back to demo email log.");
    console.log("📧 Email to:", data.email);
    console.log("📝 Booking:", { name: data.name, tour: data.tour, date: data.date, time: data.time, total: data.total, bookingId: data.bookingId });
    return { success: true, message: "Demo: email not actually sent", recipient: data.email, bookingId: data.bookingId };
}

const sendSMSSchema = z.object({
    phone: z.string().min(1),
    name: z.string().min(1),
    tour: z.string().min(1),
    date: z.string().min(1),
    time: z.string().min(1),
    bookingId: z.string().min(1),
});

export async function sendSMSConfirmation(body: unknown) {
    const data = sendSMSSchema.parse(body);
  
    const { SMS_API_KEY, SMS_SENDER_ID } = process.env;
    if (!SMS_API_KEY) {
        console.warn("SMS_API_KEY is not set. Skipping real SMS send and returning demo response.");
        return { success: true, message: "Demo: SMS not actually sent", recipient: data.phone, bookingId: data.bookingId };
    }

    // Placeholder for real SMS provider integration (e.g., Twilio)
    console.log("📱 Would send SMS via provider", { from: SMS_SENDER_ID, to: data.phone });
    return { success: true, message: "SMS queued (simulated)", recipient: data.phone, bookingId: data.bookingId };
}