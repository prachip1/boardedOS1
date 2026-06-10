// Sends a "you've been added to a project" email to a newly invited member.
//
// Best-effort by design: if RESEND_API_KEY isn't set, or sending fails, we
// return a non-fatal response so the invite itself never breaks. Transactional
// email is a nice-to-have on top of the DB invite, not a prerequisite.
import { Resend } from 'resend'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // No email provider configured — silently skip so invites still work.
    return res.status(200).json({ sent: false, skipped: true })
  }

  const { to, projectName, role, inviterEmail } = req.body || {}
  if (!to || !projectName) {
    return res.status(400).json({ error: 'Missing recipient or project name.' })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://boarded.app'
  const from = process.env.EMAIL_FROM || 'Boarded <onboarding@resend.dev>'
  const projectsLink = `${appUrl}/projects`

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `You've been added to "${projectName}" on Boarded`,
      html: renderInviteEmail({ projectName, role, inviterEmail, projectsLink }),
    })

    if (error) {
      console.error('Resend error:', error)
      return res.status(200).json({ sent: false, error: error.message })
    }
    return res.status(200).json({ sent: true })
  } catch (err) {
    console.error('notify-member error:', err)
    return res.status(200).json({ sent: false, error: err.message })
  }
}

function renderInviteEmail({ projectName, role, inviterEmail, projectsLink }) {
  const inviter = inviterEmail ? `${inviterEmail} added you` : 'You were added'
  const roleLine = role ? `Your role: <strong>${escapeHtml(role)}</strong>.` : ''
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#0b0b0d;padding:32px;color:#e7e7ea;">
    <div style="max-width:480px;margin:0 auto;background:#141417;border:1px solid #26262b;border-radius:12px;overflow:hidden;">
      <div style="padding:28px 28px 8px;">
        <h1 style="margin:0 0 12px;font-size:18px;color:#ffffff;">You've joined a project 🎉</h1>
        <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#b5b5bd;">
          ${escapeHtml(inviter)} to the project <strong style="color:#fff;">${escapeHtml(projectName)}</strong> on Boarded.
        </p>
        <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#b5b5bd;">${roleLine}</p>
        <a href="${projectsLink}" style="display:inline-block;background:#ffd60a;color:#000;text-decoration:none;font-weight:600;font-size:14px;padding:11px 20px;border-radius:8px;">
          Open the project
        </a>
        <p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:#7a7a82;">
          Sign in to Boarded with the email address this message was sent to, and the project will appear in your Projects list automatically.
        </p>
      </div>
      <div style="padding:16px 28px;border-top:1px solid #26262b;font-size:11px;color:#6a6a72;">
        Sent by Boarded · client workspace for freelancers
      </div>
    </div>
  </div>`
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ))
}
