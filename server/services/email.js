import nodemailer from 'nodemailer'
import { getDb } from '../db/database.js'

/**
 * Fetch SMTP configuration from the `settings` table,
 * falling back to process.env or sensible Hostinger defaults.
 */
export async function getSmtpConfig() {
  const db = getDb()
  const { rows } = await db.execute('SELECT key, value FROM settings')
  const settings = rows.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})

  const host = settings.smtp_host || process.env.SMTP_HOST || 'smtp.hostinger.com'
  const port = Number(settings.smtp_port || process.env.SMTP_PORT || 465)
  const secure = settings.smtp_secure !== undefined 
    ? (settings.smtp_secure === '1' || settings.smtp_secure === 'true' || settings.smtp_secure === true)
    : (process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465)
  const user = settings.smtp_user || process.env.SMTP_USER || 'contact@codelifeai.com'
  const pass = settings.smtp_pass || process.env.SMTP_PASS || ''
  const from = settings.smtp_from || process.env.SMTP_FROM || `"CodeLifeAI" <${user}>`

  return { host, port, secure, user, pass, from }
}

/**
 * Creates and verifies a nodemailer transporter.
 */
export async function createEmailTransporter() {
  const config = await getSmtpConfig()
  if (!config.pass) {
    throw new Error('SMTP Password is not configured. Please enter your email password in Admin Panel → Settings → Email Configuration.')
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure, // true for 465, false for 587
    auth: {
      user: config.user,
      pass: config.pass,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  })

  return { transporter, config }
}

/**
 * Format message body text into HTML paragraphs.
 */
function formatMessageToHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .split(/\n\n+/)
    .map(p => `<p style="margin: 0 0 16px; line-height: 1.65; color: #e2e8f0; font-size: 15px;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('')
}

/**
 * Send an email reply to a contact form enquiry.
 */
export async function sendReplyEmail({ to, toName, subject, message, originalMessage, originalDate }) {
  const { transporter, config } = await createEmailTransporter()

  const cleanSubject = subject?.trim() || 'Response from CodeLifeAI'
  const htmlBody = formatMessageToHtml(message)
  const formattedDate = originalDate ? new Date(originalDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : ''

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cleanSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #06060f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f0efe9; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #06060f; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0d0d1e; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 32px 32px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); background: linear-gradient(135deg, rgba(0,212,245,0.08) 0%, rgba(124,58,237,0.06) 100%);">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
                      Code<span style="color: #00d4f5;">Life</span>AI
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #00d4f5; background: rgba(0,212,245,0.1); border: 1px solid rgba(0,212,245,0.25); padding: 4px 10px; rounded: 8px; border-radius: 6px;">
                      Official Reply
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 20px; font-size: 16px; font-weight: 600; color: #ffffff;">
                Hello ${toName || 'there'},
              </p>
              
              ${htmlBody}

              <!-- Sign-off -->
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.06);">
                <p style="margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #ffffff;">The CodeLifeAI Team</p>
                <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                  <a href="https://codelifeai.com" style="color: #00d4f5; text-decoration: none;">codelifeai.com</a> · 
                  <a href="mailto:contact@codelifeai.com" style="color: #94a3b8; text-decoration: none;">contact@codelifeai.com</a>
                </p>
              </div>

              <!-- Quoted Original Message -->
              ${originalMessage ? `
              <div style="margin-top: 28px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-left: 3px solid #00d4f5; border-radius: 8px; padding: 16px;">
                <p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8;">
                  Your Original Enquiry ${formattedDate ? `(${formattedDate})` : ''}:
                </p>
                <p style="margin: 0; font-size: 13px; color: #cbd5e1; line-height: 1.5; font-style: italic; white-space: pre-wrap;">${originalMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.04); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                This message was sent in response to your enquiry on <a href="https://codelifeai.com" style="color: #00d4f5; text-decoration: none;">codelifeai.com</a>.
                <br/>You can reply directly to this email at <a href="mailto:contact@codelifeai.com" style="color: #94a3b8; text-decoration: none;">contact@codelifeai.com</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  const text = `
Hello ${toName || 'there'},

${message}

---
The CodeLifeAI Team
https://codelifeai.com
contact@codelifeai.com

${originalMessage ? `\n[Your Original Enquiry ${formattedDate ? `(${formattedDate})` : ''}]:\n${originalMessage}` : ''}
  `.trim()

  const info = await transporter.sendMail({
    from: config.from,
    to: toName ? `"${toName}" <${to}>` : to,
    replyTo: config.user,
    subject: cleanSubject,
    text,
    html,
  })

  return info
}

/**
 * Send a test email to verify SMTP configuration.
 */
export async function sendTestEmail({ to }) {
  const { transporter, config } = await createEmailTransporter()
  const recipient = to?.trim() || config.user

  const info = await transporter.sendMail({
    from: config.from,
    to: recipient,
    subject: 'CodeLifeAI SMTP Configuration Test — Success! ✨',
    text: `Your SMTP configuration is working properly!\n\nHost: ${config.host}\nPort: ${config.port}\nSender: ${config.from}\nTimestamp: ${new Date().toISOString()}`,
    html: `
<div style="background-color: #06060f; color: #f0efe9; padding: 40px 20px; font-family: sans-serif;">
  <div style="max-width: 500px; margin: 0 auto; background-color: #0d0d1e; border: 1px solid rgba(0,212,245,0.3); border-radius: 12px; padding: 24px;">
    <h2 style="color: #00d4f5; margin-top: 0;">SMTP Test Successful! ✨</h2>
    <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6;">
      Your email service for <strong>CodeLifeAI</strong> is connected and ready to send replies directly from the Admin Panel.
    </p>
    <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 12px; font-size: 13px; color: #94a3b8; font-family: monospace;">
      <p style="margin: 4px 0;"><strong>Host:</strong> ${config.host}</p>
      <p style="margin: 4px 0;"><strong>Port:</strong> ${config.port}</p>
      <p style="margin: 4px 0;"><strong>Sender:</strong> ${config.from}</p>
      <p style="margin: 4px 0;"><strong>Delivered to:</strong> ${recipient}</p>
    </div>
  </div>
</div>
    `,
  })

  return info
}
