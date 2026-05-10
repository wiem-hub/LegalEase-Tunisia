# app/services/email.py
# Email service using Resend API
# Sends deadline reminders and notifications to users
import resend
from app.core.config import settings


def get_resend_client():
    resend.api_key = settings.RESEND_API_KEY
    return resend


def send_deadline_reminder(
    to_email: str,
    username: str,
    step_title: str,
    procedure_name: str,
    days_remaining: int,
    due_date: str,
) -> bool:
    """Send a deadline reminder email."""
    if not settings.RESEND_API_KEY:
        print("⚠️  RESEND_API_KEY not configured — skipping email")
        return False

    if days_remaining == 0:
        urgency    = "🔴 Today"
        urgency_fr = "aujourd'hui"
        color      = "#C8102E"
    elif days_remaining <= 3:
        urgency    = f"🟡 In {days_remaining} day(s)"
        urgency_fr = f"dans {days_remaining} jour(s)"
        color      = "#D97706"
    else:
        urgency    = f"📅 In {days_remaining} day(s)"
        urgency_fr = f"dans {days_remaining} jour(s)"
        color      = "#1C2B4A"

    html = f"""
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Rappel deadline — LegalEase Tunisia</title>
</head>
<body style="margin:0;padding:0;background:#FAF9F7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF9F7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#1C2B4A;padding:28px 36px;border-left:4px solid #C8102E;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:22px;font-weight:700;color:#FFFFFF;letter-spacing:-0.5px;">
                      Legal<span style="color:#C8102E;">Ease</span> Tunisia
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size:11px;color:rgba(255,255,255,0.4);font-family:monospace;letter-spacing:1px;text-transform:uppercase;">
                      Notification
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 28px;">
              <p style="margin:0 0 6px;font-size:13px;color:#9C9A96;font-family:monospace;letter-spacing:1px;text-transform:uppercase;">
                Rappel d'échéance
              </p>
              <h1 style="margin:0 0 24px;font-size:24px;font-weight:700;color:#1A1916;line-height:1.2;">
                Bonjour {username} 👋
              </h1>

              <p style="margin:0 0 20px;font-size:15px;color:#6A6865;line-height:1.6;">
                Votre étape <strong style="color:#1A1916;">"{step_title}"</strong> dans la procédure
                <strong style="color:#1A1916;">{procedure_name}</strong> arrive à échéance.
              </p>

              <!-- Deadline card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F4F1;border-radius:10px;border-left:4px solid {color};margin-bottom:28px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <span style="font-size:13px;color:#9C9A96;font-family:monospace;text-transform:uppercase;letter-spacing:1px;">
                            Échéance
                          </span><br/>
                          <span style="font-size:20px;font-weight:700;color:{color};">
                            {urgency}
                          </span>
                        </td>
                        <td align="right">
                          <span style="font-size:13px;color:#6A6865;">
                            📅 {due_date}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 28px;font-size:14px;color:#6A6865;line-height:1.6;">
                Connectez-vous à votre espace pour voir les documents requis et mettre à jour le statut de cette étape.
              </p>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#1C2B4A;border-radius:8px;">
                    <a href="https://legalease.tn/timeline"
                       style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;letter-spacing:0.3px;">
                      Voir ma Timeline →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F5F4F1;padding:20px 36px;border-top:1px solid #E8E5DF;">
              <p style="margin:0;font-size:12px;color:#9C9A96;line-height:1.5;">
                Vous recevez cet email car vous avez activé les rappels de deadlines sur LegalEase Tunisia.<br/>
                <a href="https://legalease.tn/notifications" style="color:#C8102E;text-decoration:none;">
                  Gérer mes notifications
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    subject = f"⏰ Rappel : {step_title} — échéance {urgency_fr}"

    try:
        r = get_resend_client()
        r.Emails.send({
            "from":    settings.RESEND_FROM_EMAIL,
            "to":      [to_email],
            "subject": subject,
            "html":    html,
        })
        print(f"   ✅ Email sent to {to_email} — {step_title}")
        return True
    except Exception as e:
        print(f"   ❌ Email failed to {to_email}: {e}")
        return False


def send_welcome_email(to_email: str, username: str) -> bool:
    """Send a welcome email after signup."""
    if not settings.RESEND_API_KEY:
        return False

    html = f"""
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#FAF9F7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#1C2B4A;padding:28px 36px;border-left:4px solid #C8102E;">
              <span style="font-size:22px;font-weight:700;color:#FFFFFF;">
                Legal<span style="color:#C8102E;">Ease</span> Tunisia
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px;">
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1A1916;">
                Bienvenue {username} ! 🎉
              </h1>
              <p style="margin:0 0 20px;font-size:15px;color:#6A6865;line-height:1.6;">
                Votre compte LegalEase Tunisia est créé. Vous pouvez maintenant suivre vos procédures administratives étape par étape.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#1C2B4A;border-radius:8px;">
                    <a href="https://legalease.tn/dashboard"
                       style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;">
                      Accéder au Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#F5F4F1;padding:20px 36px;border-top:1px solid #E8E5DF;">
              <p style="margin:0;font-size:12px;color:#9C9A96;">
                © 2026 LegalEase Tunisia. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    try:
        r = get_resend_client()
        r.Emails.send({
            "from":    settings.RESEND_FROM_EMAIL,
            "to":      [to_email],
            "subject": "Bienvenue sur LegalEase Tunisia 🎉",
            "html":    html,
        })
        print(f"   ✅ Welcome email sent to {to_email}")
        return True
    except Exception as e:
        print(f"   ❌ Welcome email failed: {e}")
        return False