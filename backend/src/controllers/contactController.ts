import 'dotenv/config'
import { z } from "zod";
import nodemailer from "nodemailer";
import { PrismaClient } from "@generated/prisma";

const prisma = new PrismaClient();

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

export async function handleContact(body: unknown) {
  const data = contactSchema.parse(body);

  // Save to DB
  const saved = await prisma.contactMessage.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
    },
  });

  // Send email to site admin
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const html = `
      <h2>New contact message</h2>
      <p><strong>From:</strong> ${data.name} &lt;${data.email}&gt;</p>
      <p><strong>Phone:</strong> ${data.phone || "-"}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong><br/>${data.message.replace(/\n/g, "<br/>")}</p>
    `;

    await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to: SMTP_FROM || SMTP_USER, // send to admin
      subject: `Contact: ${data.subject}`,
      replyTo: data.email,
      html,
    });
  } else {
    // demo fallback: log
    console.warn("SMTP not configured - contact email not sent. Message saved.");
  }

  return { success: true, id: saved.id };
}

export async function listContactMessages() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
  return messages;
}

export async function deleteContactMessage(id: number) {
  const deleted = await prisma.contactMessage.delete({ where: { id } });
  return deleted;
}

export async function sendContactReply(id: number, payload: { to?: string; subject?: string; body: string }) {
  const msg = await prisma.contactMessage.findUnique({ where: { id } });
  if (!msg) throw new Error('Message not found');

  const toAddress = payload.to || msg.email;
  const subject = payload.subject || `Re: ${msg.subject || 'Your message'}`;
  const body = payload.body || '';

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to: toAddress,
      subject,
      html: body.replace(/\n/g, '<br/>'),
      replyTo: SMTP_FROM || SMTP_USER,
    });
  } else {
    // If SMTP not configured, log for debugging
    console.warn('SMTP not configured - reply not sent. Reply payload:', { toAddress, subject, body });
  }

  // Mark message as replied
  try {
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { repliedAt: new Date() },
    });
    return { success: true, repliedAt: updated.repliedAt };
  } catch (err) {
    // if DB update fails, still return success for send, but report no timestamp
    console.error('Failed to update repliedAt:', err);
    return { success: true };
  }
}