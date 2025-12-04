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
        overalls: z.string(), // Changed from jacket and pants
        boots: z.string(),
        gloves: z.string(),
        helmet: z.string(),
    })).optional(),
});

export async function sendConfirmationEmail(body: unknown) {
    const data = sendConfirmationSchema.parse(body);

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
        console.log('📧 Creating SMTP transporter with config:', { host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER });
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT),
            secure: Number(SMTP_PORT) === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        const subject = `Booking Request - ${data.tour} (${data.date} ${data.time})`;
        
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #ffb64d, #ff8c3a); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">Ukkis Safaris</h1>
                    <h2 style="margin: 10px 0 0 0; font-size: 20px; font-weight: normal;">Booking Request</h2>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #101651; margin-top: 0;">Hi ${data.name},</h2>
                    <p style="color: #3b4463; font-size: 16px;">Your booking request has been received. We are reviewing your request and will send you a confirmation email shortly.</p>
                    
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
                    
                    <p style="color: #3b4463; text-align: center; font-size: 14px;">
                        Thank you for choosing Ukkis Safaris!<br>
                        <strong style="color: #101651;">Team Ukkis Safaris</strong>
                    </p>
                </div>
            </div>
        `;

        try {
            console.log('📧 Verifying SMTP connection...');
            await transporter.verify();
            console.log('📧 SMTP connection ok');

            console.log('📧 Attempting to send email to:', data.email);
            await transporter.sendMail({
                from: SMTP_FROM || SMTP_USER,
                to: data.email,
                subject,
                html,
            });

            console.log('✅ Email sent successfully to:', data.email);
            return { success: true, message: "Booking request email sent", recipient: data.email, bookingId: data.bookingId };
        } catch (err: any) {
            console.error('❌ Email sending failed:', err);
            const msg = err?.message || 'Unknown email error';
            throw new Error(`Mail command failed: ${msg}`);
        }
    }

    // Fallback: demo mode
    console.warn("SMTP is not configured. Falling back to demo email log.");
    console.log("📧 Email to:", data.email);
    console.log("📝 Booking:", { name: data.name, tour: data.tour, date: data.date, time: data.time, total: data.total, bookingId: data.bookingId });
    return { success: true, message: "Demo: email not actually sent", recipient: data.email, bookingId: data.bookingId };
}

const sendApprovalSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
    tour: z.string().min(1),
    date: z.string().min(1),
    time: z.string().min(1),
    total: z.number().positive(),
    bookingId: z.string().min(1),
    participants: z.number().int().positive(),
    adminMessage: z.string().optional(),
    participantGearSizes: z.record(z.string(), z.object({
        name: z.string(),
        overalls: z.string(),
        boots: z.string(),
        gloves: z.string(),
        helmet: z.string(),
    })).optional(),
});

export async function sendApprovalEmail(body: unknown) {
    const data = sendApprovalSchema.parse(body);

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
        console.log('📧 Creating SMTP transporter for approval email...');
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT),
            secure: Number(SMTP_PORT) === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        const subject = `✅ Your booking has been approved - ${data.tour} (${data.date} ${data.time})`;
        
        // Generate gear sizes section if provided
        let gearSizesHtml = '';
        if (data.participantGearSizes && Object.keys(data.participantGearSizes).length > 0) {
            gearSizesHtml = `
                <h3 style="color: #101651;">Participant Gear Sizes Confirmed</h3>
                <div style="margin-bottom: 20px;">
            `;
            
            Object.entries(data.participantGearSizes).forEach(([participantNum, gearInfo]) => {
                gearSizesHtml += `
                    <div style="margin-bottom: 15px; padding: 10px; background-color: #f8f9fa; border-left: 3px solid #27ae60; border-radius: 4px;">
                        <strong>${gearInfo.name || `Participant ${participantNum}`}</strong>
                        <ul style="margin: 5px 0; padding-left: 20px;">
                            <li>Overalls: ${gearInfo.overalls}</li>
                            <li>Boots: ${gearInfo.boots}</li>
                            <li>Gloves: ${gearInfo.gloves}</li>
                            <li>Helmet: ${gearInfo.helmet}</li>
                        </ul>
                    </div>
                `;
            });
            
            gearSizesHtml += '</div>';
        }

        const adminMessageHtml = data.adminMessage ? `
            <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #101651; margin-top: 0;">Message from our team:</h3>
                <p style="color: #3b4463; margin: 0;">${data.adminMessage}</p>
            </div>
        ` : '';
        
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #27ae60, #229954); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">✅ Booking Approved!</h1>
                    <h2 style="margin: 10px 0 0 0; font-size: 20px; font-weight: normal;">Your Arctic Adventure is Confirmed</h2>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #101651; margin-top: 0;">Great news, ${data.name}!</h2>
                    <p style="color: #3b4463; font-size: 16px;">Your booking has been approved by our team. Your Arctic adventure is now officially confirmed!</p>
                    
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #101651; margin-top: 0;">Confirmed Booking Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Tour:</strong></td><td style="padding: 8px 0; color: #101651;">${data.tour}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Date:</strong></td><td style="padding: 8px 0; color: #101651;">${data.date}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Time:</strong></td><td style="padding: 8px 0; color: #101651;">${data.time}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Participants:</strong></td><td style="padding: 8px 0; color: #101651;">${data.participants}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Total Price:</strong></td><td style="padding: 8px 0; color: #27ae60; font-size: 18px; font-weight: bold;">€${data.total.toFixed(2)}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Booking ID:</strong></td><td style="padding: 8px 0; color: #101651; font-family: monospace;">${data.bookingId}</td></tr>
                        </table>
                    </div>
                    
                    ${gearSizesHtml}
                    
                    ${adminMessageHtml}
                    
                    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #92400e; margin-top: 0;">📋 Next Steps</h3>
                        <ul style="color: #78350f; margin: 0; padding-left: 20px;">
                            <li>Check your email for any special instructions</li>
                            <li>Please arrive 15 minutes before your scheduled time</li>
                            <li>Bring your ID and this confirmation email</li>
                            <li>Dress warmly - we'll provide the outer gear in your selected sizes</li>
                            <li>Contact us at least 24 hours in advance for any changes</li>
                        </ul>
                    </div>
                    
                    <p style="color: #3b4463; text-align: center; font-size: 16px;">
                        We can't wait to welcome you for your Arctic adventure!<br>
                        <strong style="color: #101651;">Team Ukkis Safaris</strong>
                    </p>
                </div>
            </div>
        `;

        try {
            console.log('📧 Verifying SMTP connection...');
            await transporter.verify();
            console.log('📧 SMTP connection ok');

            console.log('📧 Attempting to send approval email to:', data.email);
            await transporter.sendMail({
                from: SMTP_FROM || SMTP_USER,
                to: data.email,
                subject,
                html,
            });

            console.log('✅ Approval email sent successfully to:', data.email);
            return { success: true, message: "Approval email sent", recipient: data.email, bookingId: data.bookingId };
        } catch (err: any) {
            console.error('❌ Email sending failed:', err);
            const msg = err?.message || 'Unknown email error';
            throw new Error(`Mail command failed: ${msg}`);
        }
    }

    // Fallback: demo mode
    console.warn("SMTP is not configured. Falling back to demo approval email log.");
    console.log("📧 Approval Email to:", data.email);
    console.log("📝 Booking approval:", { name: data.name, tour: data.tour, date: data.date, time: data.time, total: data.total, bookingId: data.bookingId });
    if (data.adminMessage) {
        console.log("📝 Admin message:", data.adminMessage);
    }
    return { success: true, message: "Demo: approval email not actually sent", recipient: data.email, bookingId: data.bookingId };
}

const sendRejectionSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
    tour: z.string().min(1),
    bookingId: z.string().min(1),
    rejectionReason: z.string().min(1, 'Rejection reason is required'),
});

export async function sendRejectionEmail(body: unknown) {
    const data = sendRejectionSchema.parse(body);

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
        console.log('📧 Creating SMTP transporter for rejection email...');
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT),
            secure: Number(SMTP_PORT) === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        const subject = `⚠️ Booking Status Update - ${data.tour} (Booking ID: ${data.bookingId})`;
        
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">Booking Status Update</h1>
                    <h2 style="margin: 10px 0 0 0; font-size: 20px; font-weight: normal;">Your Request Could Not Be Approved</h2>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #101651; margin-top: 0;">Dear ${data.name},</h2>
                    <p style="color: #3b4463; font-size: 16px;">Thank you for your interest in booking with Ukkis Safaris. Unfortunately, we are unable to approve your booking at this time.</p>
                    
                    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
                        <h3 style="color: #101651; margin-top: 0;">Booking Information</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Tour:</strong></td><td style="padding: 8px 0; color: #101651;">${data.tour}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Booking ID:</strong></td><td style="padding: 8px 0; color: #101651; font-family: monospace;">${data.bookingId}</td></tr>
                        </table>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #101651; margin-top: 0;">Reason for Cancellation</h3>
                        <p style="color: #3b4463; margin: 0; padding: 15px; background: white; border-left: 3px solid #dc3545; border-radius: 4px;">
                            ${data.rejectionReason}
                        </p>
                    </div>
                    
                    <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #101651; margin-top: 0;">What You Can Do</h3>
                        <ul style="color: #3b4463; margin: 0; padding-left: 20px;">
                            <li>Contact us to discuss alternative dates or tours</li>
                            <li>Check our website for other available packages</li>
                            <li>Reach out to our team if you have any questions</li>
                        </ul>
                    </div>
                    
                    <p style="color: #3b4463; text-align: center; font-size: 14px; margin-top: 30px;">
                        We appreciate your understanding.<br>
                        <strong style="color: #101651;">Team Ukkis Safaris</strong>
                    </p>
                </div>
            </div>
        `;

        try {
            console.log('📧 Verifying SMTP connection...');
            await transporter.verify();
            console.log('📧 SMTP connection ok');

            console.log('📧 Attempting to send rejection email to:', data.email);
            await transporter.sendMail({
                from: SMTP_FROM || SMTP_USER,
                to: data.email,
                subject,
                html,
            });

            console.log('✅ Rejection email sent successfully to:', data.email);
            return { success: true, message: "Rejection email sent", recipient: data.email, bookingId: data.bookingId };
        } catch (err: any) {
            console.error('❌ Email sending failed:', err);
            const msg = err?.message || 'Unknown email error';
            throw new Error(`Mail command failed: ${msg}`);
        }
    }

    // Fallback: demo mode
    console.warn("SMTP is not configured. Falling back to demo rejection email log.");
    console.log("📧 Rejection Email to:", data.email);
    console.log("📝 Booking rejection:", { name: data.name, tour: data.tour, bookingId: data.bookingId });
    console.log("📝 Rejection reason:", data.rejectionReason);
    return { success: true, message: "Demo: rejection email not actually sent", recipient: data.email, bookingId: data.bookingId };
}

// Schema for pending booking notification email
const sendPendingBookingSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
    tour: z.string().min(1),
    date: z.string().min(1),
    time: z.string().min(1),
    total: z.number().positive(),
    bookingId: z.string().min(1),
    participants: z.number().int().positive(),
    participantGearSizes: z.record(z.string(), z.object({
        name: z.string(),
        overalls: z.string(),
        boots: z.string(),
        gloves: z.string(),
        helmet: z.string(),
    })).optional(),
});

// Schema for snowmobile rental request notification
const sendSnowmobileRentalRequestSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
    snowmobileName: z.string().min(1),
    date: z.string().min(1),
    startTime: z.string().min(1),
    endTime: z.string().min(1),
    total: z.number().positive(),
    rentalId: z.string().min(1),
});

// Schema for snowmobile rental approval
const sendSnowmobileRentalApprovalSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
    snowmobileName: z.string().min(1),
    date: z.string().min(1),
    startTime: z.string().min(1),
    endTime: z.string().min(1),
    total: z.number().positive(),
    rentalId: z.string().min(1),
    adminMessage: z.string().optional(),
});

// Schema for snowmobile rental rejection
const sendSnowmobileRentalRejectionSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
    snowmobileName: z.string().min(1),
    rentalId: z.string().min(1),
    rejectionReason: z.string().min(1, 'Rejection reason is required'),
});

export async function sendPendingBookingEmail(body: unknown) {
    const data = sendPendingBookingSchema.parse(body);

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
        console.log('📧 Creating SMTP transporter for pending booking email...');
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT),
            secure: Number(SMTP_PORT) === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        const subject = `⏳ Booking Request Received - ${data.tour} (${data.date} ${data.time})`;
        
        // Generate gear sizes section if provided
        let gearSizesHtml = '';
        if (data.participantGearSizes && Object.keys(data.participantGearSizes).length > 0) {
            gearSizesHtml = `
                <h3 style="color: #101651;">Participant Gear Sizes</h3>
                <div style="margin-bottom: 20px;">
            `;
            
            Object.entries(data.participantGearSizes).forEach(([participantNum, gearInfo]) => {
                gearSizesHtml += `
                    <div style="margin-bottom: 15px; padding: 10px; background-color: #f8f9fa; border-left: 3px solid #ffb64d; border-radius: 4px;">
                        <strong>${gearInfo.name || `Participant ${participantNum}`}</strong>
                        <ul style="margin: 5px 0; padding-left: 20px;">
                            <li>Overalls: ${gearInfo.overalls}</li>
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
                    <h1 style="margin: 0; font-size: 28px;">⏳ Booking Request Received</h1>
                    <h2 style="margin: 10px 0 0 0; font-size: 20px; font-weight: normal;">Awaiting Confirmation</h2>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #101651; margin-top: 0;">Thank you for your booking request, ${data.name}!</h2>
                    <p style="color: #3b4463; font-size: 16px;">We have received your booking request and it is currently being reviewed by our team. You will receive another email once your booking is confirmed or if we need any additional information.</p>
                    
                    <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffb64d;">
                        <h3 style="color: #101651; margin-top: 0;">📋 Your Booking Request Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Tour:</strong></td><td style="padding: 8px 0; color: #101651;">${data.tour}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Date:</strong></td><td style="padding: 8px 0; color: #101651;">${data.date}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Time:</strong></td><td style="padding: 8px 0; color: #101651;">${data.time}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Participants:</strong></td><td style="padding: 8px 0; color: #101651;">${data.participants}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Total Price:</strong></td><td style="padding: 8px 0; color: #ff8c3a; font-size: 18px; font-weight: bold;">€${data.total.toFixed(2)}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Reference ID:</strong></td><td style="padding: 8px 0; color: #101651; font-family: monospace;">${data.bookingId}</td></tr>
                        </table>
                    </div>
                    
                    ${gearSizesHtml}
                    
                    <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #101651; margin-top: 0;">⏰ What Happens Next?</h3>
                        <ul style="color: #3b4463; margin: 0; padding-left: 20px;">
                            <li>Our team will review your booking request</li>
                            <li>You will receive a confirmation email within 24 hours</li>
                            <li>Payment instructions will be included in the confirmation</li>
                            <li>If we need additional information, we will contact you</li>
                        </ul>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <p style="color: #6b7280; margin: 0; font-size: 14px;">
                            Questions? Contact us at <a href="mailto:info@ukkissafaris.fi" style="color: #ff8c3a;">info@ukkissafaris.fi</a>
                        </p>
                    </div>
                    
                    <p style="color: #3b4463; text-align: center; font-size: 16px;">
                        Thank you for choosing Ukkis Safaris!<br>
                        <strong style="color: #101651;">Team Ukkis Safaris</strong>
                    </p>
                </div>
            </div>
        `;

        try {
            console.log('📧 Verifying SMTP connection...');
            await transporter.verify();
            console.log('📧 SMTP connection ok');

            console.log('📧 Attempting to send pending booking email to:', data.email);
            await transporter.sendMail({
                from: SMTP_FROM || SMTP_USER,
                to: data.email,
                subject,
                html,
            });

            console.log('✅ Pending booking email sent successfully to:', data.email);
            return { success: true, message: "Pending booking email sent", recipient: data.email, bookingId: data.bookingId };
        } catch (err: any) {
            console.error('❌ Email sending failed:', err);
            const msg = err?.message || 'Unknown email error';
            throw new Error(`Mail command failed: ${msg}`);
        }
    }

    // Fallback: demo mode
    console.warn("SMTP is not configured. Falling back to demo pending booking email log.");
    console.log("📧 Pending Booking Email to:", data.email);
    console.log("📝 Booking pending:", { name: data.name, tour: data.tour, date: data.date, time: data.time, total: data.total, bookingId: data.bookingId });
    return { success: true, message: "Demo: pending booking email not actually sent", recipient: data.email, bookingId: data.bookingId };
}

// ====== SNOWMOBILE RENTAL EMAILS ======

export async function sendSnowmobileRentalRequestEmail(body: unknown) {
    const data = sendSnowmobileRentalRequestSchema.parse(body);

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
        console.log('📧 Creating SMTP transporter for snowmobile rental request email...');
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT),
            secure: Number(SMTP_PORT) === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        const subject = `⏳ Snowmobile Rental Request Received - ${data.snowmobileName} (${data.date})`;
        
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #ffb64d, #ff8c3a); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">⏳ Rental Request Received</h1>
                    <h2 style="margin: 10px 0 0 0; font-size: 20px; font-weight: normal;">Awaiting Confirmation</h2>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #101651; margin-top: 0;">Thank you for your rental request, ${data.name}!</h2>
                    <p style="color: #3b4463; font-size: 16px;">We have received your snowmobile rental request and it is currently being reviewed by our team. You will receive another email once your rental is confirmed or if we need any additional information.</p>
                    
                    <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffb64d;">
                        <h3 style="color: #101651; margin-top: 0;">📋 Your Rental Request Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Snowmobile:</strong></td><td style="padding: 8px 0; color: #101651;">${data.snowmobileName}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Date:</strong></td><td style="padding: 8px 0; color: #101651;">${data.date}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Start Time:</strong></td><td style="padding: 8px 0; color: #101651;">${data.startTime}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>End Time:</strong></td><td style="padding: 8px 0; color: #101651;">${data.endTime}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Total Price:</strong></td><td style="padding: 8px 0; color: #ff8c3a; font-size: 18px; font-weight: bold;">€${data.total.toFixed(2)}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Reference ID:</strong></td><td style="padding: 8px 0; color: #101651; font-family: monospace;">${data.rentalId}</td></tr>
                        </table>
                    </div>
                    
                    <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #101651; margin-top: 0;">⏰ What Happens Next?</h3>
                        <ul style="color: #3b4463; margin: 0; padding-left: 20px;">
                            <li>Our team will review your rental request</li>
                            <li>You will receive a confirmation email within 24 hours</li>
                            <li>Payment instructions will be included in the confirmation</li>
                            <li>If we need additional information, we will contact you</li>
                        </ul>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <p style="color: #6b7280; margin: 0; font-size: 14px;">
                            Questions? Contact us at <a href="mailto:info@ukkissafaris.fi" style="color: #ff8c3a;">info@ukkissafaris.fi</a>
                        </p>
                    </div>
                    
                    <p style="color: #3b4463; text-align: center; font-size: 16px;">
                        Thank you for choosing Ukkis Safaris!<br>
                        <strong style="color: #101651;">Team Ukkis Safaris</strong>
                    </p>
                </div>
            </div>
        `;

        try {
            console.log('📧 Verifying SMTP connection...');
            await transporter.verify();
            console.log('📧 SMTP connection ok');

            console.log('📧 Attempting to send snowmobile rental request email to:', data.email);
            await transporter.sendMail({
                from: SMTP_FROM || SMTP_USER,
                to: data.email,
                subject,
                html,
            });

            console.log('✅ Snowmobile rental request email sent successfully to:', data.email);
            return { success: true, message: "Rental request email sent", recipient: data.email, rentalId: data.rentalId };
        } catch (err: any) {
            console.error('❌ Email sending failed:', err);
            const msg = err?.message || 'Unknown email error';
            throw new Error(`Mail command failed: ${msg}`);
        }
    }

    // Fallback: demo mode
    console.warn("SMTP is not configured. Falling back to demo snowmobile rental request email log.");
    console.log("📧 Snowmobile Rental Request Email to:", data.email);
    console.log("📝 Rental request:", { name: data.name, snowmobileName: data.snowmobileName, date: data.date, startTime: data.startTime, endTime: data.endTime, total: data.total, rentalId: data.rentalId });
    return { success: true, message: "Demo: snowmobile rental request email not actually sent", recipient: data.email, rentalId: data.rentalId };
}

export async function sendSnowmobileRentalApprovalEmail(body: unknown) {
    const data = sendSnowmobileRentalApprovalSchema.parse(body);

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
        console.log('📧 Creating SMTP transporter for snowmobile rental approval email...');
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT),
            secure: Number(SMTP_PORT) === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        const subject = `✅ Your Snowmobile Rental Approved - ${data.snowmobileName} (${data.date})`;
        
        const adminMessageHtml = data.adminMessage ? `
            <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #101651; margin-top: 0;">Message from our team:</h3>
                <p style="color: #3b4463; margin: 0;">${data.adminMessage}</p>
            </div>
        ` : '';
        
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #27ae60, #229954); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">✅ Rental Approved!</h1>
                    <h2 style="margin: 10px 0 0 0; font-size: 20px; font-weight: normal;">Your Snowmobile Rental is Confirmed</h2>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #101651; margin-top: 0;">Great news, ${data.name}!</h2>
                    <p style="color: #3b4463; font-size: 16px;">Your snowmobile rental has been approved by our team. Your Arctic adventure is now officially confirmed!</p>
                    
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #101651; margin-top: 0;">Confirmed Rental Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Snowmobile:</strong></td><td style="padding: 8px 0; color: #101651;">${data.snowmobileName}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Date:</strong></td><td style="padding: 8px 0; color: #101651;">${data.date}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Start Time:</strong></td><td style="padding: 8px 0; color: #101651;">${data.startTime}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>End Time:</strong></td><td style="padding: 8px 0; color: #101651;">${data.endTime}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Total Price:</strong></td><td style="padding: 8px 0; color: #27ae60; font-size: 18px; font-weight: bold;">€${data.total.toFixed(2)}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Rental ID:</strong></td><td style="padding: 8px 0; color: #101651; font-family: monospace;">${data.rentalId}</td></tr>
                        </table>
                    </div>
                    
                    ${adminMessageHtml}
                    
                    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #92400e; margin-top: 0;">📋 Important Information</h3>
                        <ul style="color: #78350f; margin: 0; padding-left: 20px;">
                            <li>Please arrive 15 minutes before your rental start time</li>
                            <li>Bring a valid ID and this confirmation email</li>
                            <li>Dress warmly in layers for the Arctic conditions</li>
                            <li>Please contact us at least 24 hours in advance for any changes</li>
                        </ul>
                    </div>
                    
                    <p style="color: #3b4463; text-align: center; font-size: 16px;">
                        We can't wait to welcome you for your Arctic adventure!<br>
                        <strong style="color: #101651;">Team Ukkis Safaris</strong>
                    </p>
                </div>
            </div>
        `;

        try {
            console.log('📧 Verifying SMTP connection...');
            await transporter.verify();
            console.log('📧 SMTP connection ok');

            console.log('📧 Attempting to send snowmobile rental approval email to:', data.email);
            await transporter.sendMail({
                from: SMTP_FROM || SMTP_USER,
                to: data.email,
                subject,
                html,
            });

            console.log('✅ Snowmobile rental approval email sent successfully to:', data.email);
            return { success: true, message: "Rental approval email sent", recipient: data.email, rentalId: data.rentalId };
        } catch (err: any) {
            console.error('❌ Email sending failed:', err);
            const msg = err?.message || 'Unknown email error';
            throw new Error(`Mail command failed: ${msg}`);
        }
    }

    // Fallback: demo mode
    console.warn("SMTP is not configured. Falling back to demo snowmobile rental approval email log.");
    console.log("📧 Snowmobile Rental Approval Email to:", data.email);
    console.log("📝 Rental approved:", { name: data.name, snowmobileName: data.snowmobileName, date: data.date, startTime: data.startTime, endTime: data.endTime, total: data.total, rentalId: data.rentalId });
    if (data.adminMessage) {
        console.log("📝 Admin message:", data.adminMessage);
    }
    return { success: true, message: "Demo: snowmobile rental approval email not actually sent", recipient: data.email, rentalId: data.rentalId };
}

export async function sendSnowmobileRentalRejectionEmail(body: unknown) {
    const data = sendSnowmobileRentalRejectionSchema.parse(body);

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
        console.log('📧 Creating SMTP transporter for snowmobile rental rejection email...');
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT),
            secure: Number(SMTP_PORT) === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        const subject = `⚠️ Rental Status Update - ${data.snowmobileName} (Rental ID: ${data.rentalId})`;
        
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">Rental Status Update</h1>
                    <h2 style="margin: 10px 0 0 0; font-size: 20px; font-weight: normal;">Your Request Could Not Be Approved</h2>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #101651; margin-top: 0;">Dear ${data.name},</h2>
                    <p style="color: #3b4463; font-size: 16px;">Thank you for your interest in renting from Ukkis Safaris. Unfortunately, we are unable to approve your rental request at this time.</p>
                    
                    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
                        <h3 style="color: #101651; margin-top: 0;">Rental Information</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Snowmobile:</strong></td><td style="padding: 8px 0; color: #101651;">${data.snowmobileName}</td></tr>
                            <tr><td style="padding: 8px 0; color: #3b4463;"><strong>Rental ID:</strong></td><td style="padding: 8px 0; color: #101651; font-family: monospace;">${data.rentalId}</td></tr>
                        </table>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #101651; margin-top: 0;">Reason for Cancellation</h3>
                        <p style="color: #3b4463; margin: 0; padding: 15px; background: white; border-left: 3px solid #dc3545; border-radius: 4px;">
                            ${data.rejectionReason}
                        </p>
                    </div>
                    
                    <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #101651; margin-top: 0;">What You Can Do</h3>
                        <ul style="color: #3b4463; margin: 0; padding-left: 20px;">
                            <li>Contact us to discuss alternative dates or snowmobiles</li>
                            <li>Check our website for other available options</li>
                            <li>Reach out to our team if you have any questions</li>
                        </ul>
                    </div>
                    
                    <p style="color: #3b4463; text-align: center; font-size: 14px; margin-top: 30px;">
                        We appreciate your understanding.<br>
                        <strong style="color: #101651;">Team Ukkis Safaris</strong>
                    </p>
                </div>
            </div>
        `;

        try {
            console.log('📧 Verifying SMTP connection...');
            await transporter.verify();
            console.log('📧 SMTP connection ok');

            console.log('📧 Attempting to send snowmobile rental rejection email to:', data.email);
            await transporter.sendMail({
                from: SMTP_FROM || SMTP_USER,
                to: data.email,
                subject,
                html,
            });

            console.log('✅ Snowmobile rental rejection email sent successfully to:', data.email);
            return { success: true, message: "Rental rejection email sent", recipient: data.email, rentalId: data.rentalId };
        } catch (err: any) {
            console.error('❌ Email sending failed:', err);
            const msg = err?.message || 'Unknown email error';
            throw new Error(`Mail command failed: ${msg}`);
        }
    }

    // Fallback: demo mode
    console.warn("SMTP is not configured. Falling back to demo snowmobile rental rejection email log.");
    console.log("📧 Snowmobile Rental Rejection Email to:", data.email);
    console.log("📝 Rental rejection:", { name: data.name, snowmobileName: data.snowmobileName, rentalId: data.rentalId });
    console.log("📝 Rejection reason:", data.rejectionReason);
    return { success: true, message: "Demo: snowmobile rental rejection email not actually sent", recipient: data.email, rentalId: data.rentalId };
}

