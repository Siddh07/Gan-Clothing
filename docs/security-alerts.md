# Security Alerting Thresholds & Incident Response Matrix

This document defines alerting rules, threshold conditions, severity tiers, and incident runbooks for the Garment Association of Nepal (GAN) B2B Export Platform.

All security events are emitted as structured JSON via `src/lib/logger.ts` to `stdout` and collected by log drains (Datadog, AWS CloudWatch, Axiom, or Vercel Log Drains).

---

## 🚨 Alert Threshold Rules

| Event Type | Threshold Condition | Severity | Recommended Response Action |
|:---|:---|:---:|:---|
| `auth.failure` | `> 10 in 5 min per IP` | **HIGH** | Temporarily block IP address at Cloudflare/WAF layer; notify on-call security engineer; verify if targeted accounts require proactive lockout. |
| `auth.failure` | `> 50 in 1 hr globally` | **CRITICAL** | High probability of a distributed credential stuffing or brute-force campaign. Review compromised accounts, enforce global CAPTCHA/Turnstile challenges on login endpoints, check IP reputation lists. |
| `rate_limit.hit` | `> 100 in 10 min` | **MEDIUM** | Review traffic origin patterns. Inspect whether an aggressive web scraper or crawler is hammering the RFQ/inquiry endpoints. Adjust WAF rate-limit rules if necessary. |
| `authz.unauthorized` | `Any occurrence (>= 1)` | **HIGH** | Immediate investigation. Indicates privilege escalation, IDOR attempt, or unauthorized administrative action attempted by a low-privilege or unauthenticated actor. Inspect user session, source IP, and target resource ID. |
| `upload.rejected` | `> 20 in 1 hr per IP` | **MEDIUM** | Potential file upload fuzzing or polyglot payload upload attempt. Inspect source IP, review rejected filenames and MIME signatures, confirm Cloudinary API key has not been abused. |
| `validation.rejection` | `> 30 in 10 min per IP` | **MEDIUM** | Potential injection attempt (SQLi, XSS probing, parameter tampering). Review query/payload contents in log drains. Block offending IP if automated attack detected. |

---

## 🛠️ SIEM / Log Filter Queries

### Datadog Logs
```text
service:gan-export-platform @event:auth.failure
service:gan-export-platform @event:authz.unauthorized
service:gan-export-platform @event:rate_limit.hit
service:gan-export-platform @event:upload.rejected
service:gan-export-platform @event:validation.rejection
```

### AWS CloudWatch Logs Insights
```sql
fields @timestamp, event, ip, userId, reason
| filter service = "gan-export-platform"
| filter event in ["auth.failure", "authz.unauthorized", "rate_limit.hit"]
| stats count(*) by event, ip, bin(5m)
| filter count > 10
```

---

## 📞 Incident Escalation Protocol

1. **CRITICAL / HIGH Severity**: PagerDuty/Opsgenie triggers alert to primary On-Call Engineer within 5 minutes.
2. **Escalation**: If unacknowledged in 15 minutes, auto-escalates to Lead Architect & Security Lead.
3. **Containment**: Offending IPs or accounts are blocked via Cloudflare WAF or database flag (`lockedUntil = now + 24h`).
4. **Post-Mortem**: Document incident in internal incident log within 24 hours of resolution.
