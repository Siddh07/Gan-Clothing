# Secrets Rotation Runbook & Compromise Remediation Guide

This runbook defines mandatory procedures for rotating cryptographic keys, database credentials, and third-party service tokens for the Garment Association of Nepal (GAN) B2B Export Platform.

---

## 🚨 When to Rotate (Triggers)

Immediate secret rotation is mandatory under any of the following triggers:

1. **Git Commit Exposure**: Any secret committed to git, even if reverted in subsequent commits or branches. Git history retains the secret indefinitely and must be treated as compromised.
2. **Team Member Offboarding**: A team member, contractor, or DevOps engineer with production secret access leaves the organization.
3. **Vendor Security Incident**: A third-party SaaS provider (Resend, Cloudinary, Upstash, Supabase, Neon) discloses a security incident, breach, or credential leak.
4. **Anomaly / Usage Spike**: Unusual outbound API traffic, quota spikes, or authentication failures indicating token harvest or credential abuse.
5. **Periodic Lifecycle Rotation**: Every 90 days for operational hygiene.

---

## 🔄 Rotation Procedure Per Secret Type

### 1. `DATABASE_URL` / Database Connection String
*Zero-Downtime Cutover Procedure:*

1. **Provision New Database Credentials**: In your managed database console (Neon, Supabase, AWS RDS), create a secondary user or new database role with the identical permissions.
2. **Update Environment Stores**: Update `DATABASE_URL` in `.env.local` and all staging/production deployment environment configuration stores (Vercel Project Settings, AWS Secrets Manager, GitHub Secrets).
3. **Deploy the Application**: Trigger a deployment. Keep the previous database credentials active during the cutover window (at least 15 minutes) to ensure ongoing requests or serverless containers complete gracefully.
4. **Health Check**: Confirm the newly deployed application successfully executes database queries and passes `/api/health`.
5. **Revoke Old Credentials**: Revoke and delete the old database role/password in the database console.
6. **Invalidate Active Sessions**: Wipe active sessions or rotate `NEXTAUTH_SECRET` to invalidate compromised tokens.

---

### 2. `NEXTAUTH_SECRET` / `JWT_SECRET` / `MFA_ENCRYPTION_KEY`
*Session Invalidation Warning: Rotating this secret invalidates all active sessions immediately, logging all users out.*

1. **Generate New Cryptographic Key**:
   ```bash
   openssl rand -base64 32
   ```
2. **Synchronize Across Environments**: Update `NEXTAUTH_SECRET` across all hosting environments and CI runner secrets simultaneously.
3. **Redeploy Application**: Deploy to production.
4. **User Communication**: Because all logged-in administrators and factory reps will be required to re-authenticate, schedule rotation during off-peak trade hours and communicate the maintenance window in advance.

---

### 3. Third-Party API Keys (Resend, Cloudinary, Upstash, Cloudflare)
*Zero-Downtime Overlap Strategy:*

1. **Generate Secondary Key in Provider Dashboard FIRST**:
   - **Resend**: Create a new API Key in *Resend Dashboard -> API Keys*. Do **NOT** delete the old key yet.
   - **Cloudinary**: Generate a new API Secret in *Cloudinary Settings -> Access Keys*.
   - **Upstash Redis**: Generate a new REST Token in *Upstash Console -> Redis*.
2. **Update Application Environment Variables**: Push new keys to deployment settings.
3. **Deploy & Validate**: Deploy and verify that transactional emails (Resend), media uploads (Cloudinary), and rate limiting (Upstash) operate without error.
4. **Revoke Old Key**: Delete the old API key from the provider dashboard.

---

## 🧹 Git History Remediation (If a Secret Was Committed)

> [!CAUTION]
> If the repository is or was public at any time, treat the secret as **FULLY COMPROMISED** immediately. Automated scrapers harvest secrets from public GitHub commits within seconds. Rotate the secret before performing git history rewriting.

Do **NOT** use `git filter-branch` — it is deprecated, slow, and leaves orphaned refs. Use `git-filter-repo`:

### Step-by-Step Remediation:

1. **Install `git-filter-repo`**:
   ```bash
   pip install git-filter-repo
   ```

2. **Make a Fresh Clone**:
   ```bash
   git clone --bare git@github.com:Siddh07/Gan-Clothing.git repo-cleanup.git
   cd repo-cleanup.git
   ```

3. **Purge the Sensitive File(s)**:
   ```bash
   git filter-repo --path .env --invert-paths
   ```
   *(To purge specific text instead of an entire file:)*
   ```bash
   git filter-repo --replace-text <(echo "compromised-secret==>REDACTED_SECRET")
   ```

4. **Force-Push All Branches and Tags**:
   ```bash
   git remote add origin git@github.com:Siddh07/Gan-Clothing.git
   git push origin --force --all
   git push origin --force --tags
   ```

5. **Notify Team Members**:
   - Instruct all engineers to delete their local clones and clone a fresh copy:
     ```bash
     rm -rf Gan-Clothing && git clone git@github.com:Siddh07/Gan-Clothing.git
     ```
   - Any local commit containing the old tree will reintroduce the purged commit if pushed.

---

## ✅ Post-Rotation Verification Checklist

- [ ] Old credentials revoked and confirmed disabled in provider dashboard
- [ ] New credentials deployed and verified in staging
- [ ] Production deployment healthy and accepting traffic
- [ ] `.env.example` updated if variable names or schemas changed (never commit actual secrets)
- [ ] Security incident entry logged in the team incident register:
  - **Date & UTC Time**
  - **Secret Type Rotated**
  - **Trigger Reason**
  - **Remediation Steps Taken**
  - **Lead Engineer / Authorizer**
