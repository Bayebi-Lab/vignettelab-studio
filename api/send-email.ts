import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { to, subject, template_type, data } = body;

    if (!to || !subject || !template_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    let html = '';

    if (template_type === 'download_ready') {
      const { orderId, packageName, downloadLinks } = data;
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #8B4513;">Your Portraits Are Ready!</h1>
            <p>Great news! Your ${packageName} portraits have been processed and are ready for download.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Order Details</h2>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Package:</strong> ${packageName}</p>
            </div>
            
            <div style="margin: 30px 0;">
              <a href="${downloadLinks[0]}" style="display: inline-block; background-color: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Download Your Portraits
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              <strong>Note:</strong> This download link will expire in 7 days. Please download your portraits soon.
            </p>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>The VignetteLab Studio Team</p>
          </body>
        </html>
      `;
    } else {
      html = data?.html || '<p>No content provided</p>';
    }

    const result = await resend.emails.send({
      from: process.env.ADMIN_EMAIL || 'noreply@vignettelab.com',
      to,
      subject,
      html,
    });

    return new Response(
      JSON.stringify({ success: true, id: result.data?.id }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to send email',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
