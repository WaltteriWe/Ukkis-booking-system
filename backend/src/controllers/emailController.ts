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
    participantGearSizes: z.record(z.string(), z.object({
        name: z.string(),
        jacket: z.string(),
        pants: z.string(),
        boots: z.string(),
        gloves: z.string(),
        helmet: z.string(),
    })).optional(),
});

export async function sendConfirmationEmail(body: unknown) {
    const data = sendConfirmationSchema.parse(body);

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
        console.log('📧 Creating SMTP transporter with config:', { host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER });
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT),
            secure: Number(SMTP_PORT) === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        const subject = `Booking confirmation - ${data.tour} (${data.date} ${data.time})`;
        
        // Generate gear sizes section if provided
        let gearSizesHtml = '';
        if (data.participantGearSizes && Object.keys(data.participantGearSizes).length > 0) {
            gearSizesHtml = `
                <h3>Participant Gear Sizes</h3>
                <div style="margin-bottom: 20px;">
            `;
            
            Object.entries(data.participantGearSizes).forEach(([participantNum, gearInfo]) => {
                gearSizesHtml += `
                    <div style="margin-bottom: 15px; padding: 10px; background-color: #f8f9fa; border-left: 3px solid #ffb64d; border-radius: 4px;">
                        <strong>${gearInfo.name || `Participant ${participantNum}`}</strong>
                        <ul style="margin: 5px 0; padding-left: 20px;">
                            <li>Jacket: ${gearInfo.jacket}</li>
                            <li>Pants: ${gearInfo.pants}</li>
                            <li>Boots: ${gearInfo.boots}</li>
                            <li>Gloves: ${gearInfo.gloves}</li>
                            <li>Helmet: ${gearInfo.helmet}</li>
                        </ul>
                    </div>
                `;
            });
            
            gearSizesHtml += '</div>';
        }
        
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #ffb64d, #ff8c3a); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">Ukkis Safaris</h1>
                    <h2 style="margin: 10px 0 0 0; font-size: 20px; font-weight: normal;">Booking Confirmation</h2>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #101651; margin-top: 0;">Thank you for your booking, ${data.name}!</h2>
                    <p style="color: #3b4463; font-size: 16px;">We're excited to provide you with an unforgettable Arctic adventure. Here are your booking details:</p>
                    
                    <div style="background: #f7fbf9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #101651; margin-top: 0;">Booking Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Tour:</strong></td><td style="padding: 8px 0; color: #101651;">${data.tour}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Date:</strong></td><td style="padding: 8px 0; color: #101651;">${data.date}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Time:</strong></td><td style="padding: 8px 0; color: #101651;">${data.time}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Total:</strong></td><td style="padding: 8px 0; color: #ff8c3a; font-size: 18px; font-weight: bold;">€${data.total.toFixed(2)}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Booking ID:</strong></td><td style="padding: 8px 0; color: #101651; font-family: monospace;">${data.bookingId}</td></tr>
                        </table>
                    </div>
                    
                    ${gearSizesHtml}
                    
                    <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #101651; margin-top: 0;">Important Information</h3>
                        <ul style="color: #3b4463; margin: 0; padding-left: 20px;">
                            <li>Please arrive 15 minutes before your scheduled time</li>
                            <li>Dress warmly in layers - we'll provide the outer gear in your selected sizes</li>
                            <li>Bring your ID and confirmation email</li>
                            <li>Contact us at least 24 hours in advance for any changes</li>
                        </ul>
                    </div>
                    
                    <p style="color: #3b4463; text-align: center; font-size: 16px;">
                        We look forward to seeing you for your Arctic adventure!<br>
                        <strong style="color: #101651;">Team Ukkis Safaris</strong>
                    </p>
                </div>
            </div>
        `;

        console.log('📧 Attempting to send email to:', data.email);
        await transporter.sendMail({
            from: SMTP_USER,
            to: data.email,
            subject,
            html,
        });

        console.log('✅ Email sent successfully to:', data.email);
        return { success: true, message: "Confirmation email sent", recipient: data.email, bookingId: data.bookingId };
    }

    // Fallback: demo mode
    console.warn("SMTP is not configured. Falling back to demo email log.");
    console.log("📧 Email to:", data.email);
    console.log("📝 Booking:", { name: data.name, tour: data.tour, date: data.date, time: data.time, total: data.total, bookingId: data.bookingId });
    return { success: true, message: "Demo: email not actually sent", recipient: data.email, bookingId: data.bookingId };
}

