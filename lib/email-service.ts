import nodemailer from 'nodemailer'

// Configuración del servicio de email (usando Ethereal para desarrollo)
export async function createEmailTransporter() {
  // Para desarrollo, usar Ethereal (funciona sin configuración real)
  if (process.env.NODE_ENV === 'development') {
    const testAccount = await nodemailer.createTestAccount()
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
  }

  // Para producción, configurar con variables de entorno
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendVerificationEmail(email: string, code: string) {
  const transporter = await createEmailTransporter()

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verifica tu email - TechZone</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 40px;
          border-radius: 0 0 10px 10px;
        }
        .code {
          background: #fff;
          border: 2px dashed #667eea;
            padding: 20px;
          text-align: center;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          margin: 30px 0;
          border-radius: 8px;
          color: #667eea;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚀 TechZone</h1>
        <p>Verifica tu dirección de email</p>
      </div>
      
      <div class="content">
        <h2>¡Bienvenido a TechZone!</h2>
        <p>Gracias por registrarte. Para completar tu registro, por favor verifica tu dirección de email usando el siguiente código:</p>
        
        <div class="code">${code}</div>
        
        <p><strong>Este código expirará en 15 minutos.</strong></p>
        
        <p>Si no solicitaste este código, puedes ignorar este email de forma segura.</p>
        
        <div class="footer">
          <p>© 2024 TechZone - Tu tienda de tecnología de confianza</p>
          <p>Este es un email automático, por favor no respondas a este mensaje.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const info = await transporter.sendMail({
      from: '"TechZone" <noreply@techzone.com>',
      to: email,
      subject: 'Verifica tu email - TechZone',
      html: htmlContent,
    })

    console.log('Email sent successfully!', info.messageId)
    
    // En desarrollo, mostrar URL de preview
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info))
    }

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

const STATUS_LABELS: Record<string, { label: string; emoji: string; description: string }> = {
  confirmed:  { label: "Confirmado",  emoji: "✅", description: "Tu pedido fue confirmado y está siendo procesado." },
  processing: { label: "Preparando",  emoji: "📦", description: "Estamos preparando tu pedido para el envío." },
  shipped:    { label: "Despachado",  emoji: "🚚", description: "Tu pedido fue despachado y está en camino." },
  delivered:  { label: "Entregado",   emoji: "🎉", description: "Tu pedido fue entregado. ¡Gracias por tu compra!" },
  cancelled:  { label: "Cancelado",   emoji: "❌", description: "Tu pedido fue cancelado. Contactanos si tenés dudas." },
}

export async function sendOrderStatusEmail(params: {
  to: string
  orderId: string
  status: string
  trackingNumber?: string
  note?: string
}) {
  const { to, orderId, status, trackingNumber, note } = params
  const info = STATUS_LABELS[status]
  if (!info) return { success: false, error: "Estado desconocido" }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techzonecde.com"
  const orderUrl = `${siteUrl}/mis-pedidos/${orderId}`
  const shortId = orderId.slice(-8).toUpperCase()

  const trackingSection = trackingNumber ? `
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;margin:20px 0;text-align:center;">
      <p style="margin:0 0 6px;font-size:13px;color:#3b82f6;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Número de seguimiento AEX</p>
      <p style="margin:0;font-size:24px;font-weight:800;letter-spacing:6px;color:#1e3a8a;font-family:monospace;">${trackingNumber}</p>
      <p style="margin:8px 0 0;font-size:12px;color:#6b7280;">Usá este código para rastrear tu paquete en aex.com.py</p>
    </div>` : ""

  const noteSection = note ? `<p style="color:#6b7280;font-size:14px;margin:12px 0;padding:12px;background:#f9fafb;border-radius:8px;border-left:3px solid #d1d5db;">${note}</p>` : ""

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:32px;text-align:center;">
      <p style="margin:0;font-size:28px;font-weight:800;color:#fff;">TechZone</p>
      <p style="margin:6px 0 0;font-size:14px;color:#bfdbfe;">Actualización de tu pedido</p>
    </div>
    <div style="padding:32px;">
      <p style="font-size:24px;margin:0 0 4px;text-align:center;">${info.emoji}</p>
      <h2 style="text-align:center;color:#111827;margin:8px 0 4px;font-size:22px;">Pedido ${info.label}</h2>
      <p style="text-align:center;color:#6b7280;font-size:14px;margin:0 0 20px;">Pedido #${shortId}</p>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">${info.description}</p>
      ${noteSection}
      ${trackingSection}
      <div style="text-align:center;margin:24px 0;">
        <a href="${orderUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:13px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">Ver mi pedido</a>
      </div>
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin:16px 0 0;">Si no realizaste esta compra, ignorá este email.</p>
    </div>
    <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} TechZone CDE — Este es un email automático.</p>
    </div>
  </div>
</body></html>`

  const transporter = await createEmailTransporter()
  try {
    const result = await transporter.sendMail({
      from: `"TechZone" <${process.env.SMTP_USER || "noreply@techzonecde.com"}>`,
      to,
      subject: `${info.emoji} Tu pedido #${shortId} — ${info.label}`,
      html,
    })
    console.log(`📧 Email estado enviado a ${to}:`, result.messageId)
    return { success: true }
  } catch (error) {
    console.error("Error enviando email de estado:", error)
    return { success: false, error: String(error) }
  }
}
