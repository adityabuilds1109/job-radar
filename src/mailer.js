import nodemailer from "nodemailer";

const escape = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function scoreColor(score) {
  if (score >= 80) return "#1a7f37";
  if (score >= 60) return "#9a6700";
  return "#cf222e";
}

// Email clients handle tables far more reliably than divs, so each job is a table.
function jobCard(j) {
  const why = j.reasons.length ? `<b>Why:</b> ${j.reasons.map(escape).join("; ")}<br>` : "";
  const gaps = j.missing.length ? `<b>Gaps:</b> ${j.missing.map(escape).join(", ")}` : "";
  return `
  <table width="100%" cellpadding="14" cellspacing="0" style="border:1px solid #ddd;border-radius:8px;margin-bottom:12px;font-family:Arial,sans-serif">
    <tr><td>
      <span style="font-size:16px"><b>${escape(j.title)}</b> &middot; ${escape(j.company)}</span><br>
      <span style="color:#666;font-size:13px">${escape(j.location || "Location not listed")}</span><br><br>
      <span style="font-size:15px">Match score: <b style="color:${scoreColor(j.score)}">${j.score}/100</b></span><br>
      <span style="font-size:13px;line-height:1.6">${why}${gaps}</span><br><br>
      <a href="${escape(j.url)}" style="background:#3E5C76;color:#ffffff;padding:8px 16px;border-radius:6px;text-decoration:none;font-size:14px">Apply</a>
    </td></tr>
  </table>`;
}

export async function sendEmail(jobs) {
  const { GMAIL_USER, GMAIL_APP_PASSWORD, MAIL_TO } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error("Missing GMAIL_USER or GMAIL_APP_PASSWORD (see README)");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });

  const top = jobs[0];
  await transporter.sendMail({
    from: `Job Alert Agent <${GMAIL_USER}>`,
    to: MAIL_TO || GMAIL_USER,
    subject: `${jobs.length} new job match${jobs.length === 1 ? "" : "es"} (top: ${top.company}, ${top.score}/100)`,
    html: `<p style="font-family:sans-serif">Sorted by AI match score against your resume.</p>${jobs.map(jobCard).join("")}`,
  });
}
