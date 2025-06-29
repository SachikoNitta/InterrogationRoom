# Setup Documentation

This directory contains comprehensive setup guides for the Interrogation Room application.

## 📚 Available Guides

| Guide | Purpose | Audience |
|-------|---------|----------|
| **[Infrastructure Setup](./infrastructure.md)** | Google Cloud infrastructure and deployment setup | DevOps, Developers |
| **[Local Development](./local.md)** | Setting up local development environment | Developers |
| **[Production Deployment](./prod.md)** | Production deployment and configuration | DevOps |

## 🚀 Quick Start

### For New Projects

1. **Infrastructure Setup** (First time only)
   ```bash
   # Follow infrastructure.md guide
   ./infra/setup-service-account.sh
   ./infra/setup-secrets.sh
   ./infra/setup-firebase-auth-secrets.sh
   ./infra/setup-cloudbuild-permissions.sh
   ```

2. **Deploy to Production**
   ```bash
   # Every deployment
   gcloud builds submit --config=infra/cloudbuild-frontend.yml
   ```

3. **Local Development**
   ```bash
   # Follow local.md guide
   cp app/.env.example app/.env.local
   # Fill in Firebase configuration
   npm run dev
   ```

## 📋 Setup Checklist

### Infrastructure (One Time)
- [ ] Google Cloud Project created with billing enabled
- [ ] Firebase project created and configured
- [ ] Service account created (`./infra/setup-service-account.sh`)
- [ ] Secrets stored in Secret Manager (`./infra/setup-secrets.sh`)
- [ ] Firebase authentication configured (`./infra/setup-firebase-auth-secrets.sh`)
- [ ] Cloud Build permissions configured (`./infra/setup-cloudbuild-permissions.sh`)

### Development Environment
- [ ] Node.js 20+ installed
- [ ] gcloud CLI installed and authenticated
- [ ] Local environment variables configured (`.env.local`)
- [ ] Dependencies installed (`npm install`)

### Production Deployment
- [ ] Application deployed to Cloud Run
- [ ] Firebase authentication configured
- [ ] Domain configured (if using custom domain)
- [ ] Monitoring and logging set up

## 🔗 Related Documentation

- [Architecture Overview](../architecture.md)
- [User Manual](../manual/user.md)
- [Admin Manual](../manual/admin.md)
- [Security Configuration](../../SECURITY.md)

## 🆘 Need Help?

1. **Check the specific guide** for your use case
2. **Review troubleshooting sections** in each guide
3. **Verify prerequisites** are met
4. **Check logs** in Google Cloud Console
5. **Re-run setup scripts** (they're idempotent)

## 🔄 Updates

When updating the infrastructure:

1. **Review changes** in the relevant guide
2. **Test in development** environment first
3. **Update production** following the deployment guide
4. **Verify functionality** after deployment