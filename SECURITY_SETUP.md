# 🔒 Security Setup Instructions

## ⚠️ IMPORTANT: Required Setup Before Running the Application

### 1. Database Configuration

The application requires a local database configuration file that is **NOT** tracked by git for security reasons.

**Steps:**
1. Copy the template file:
   ```bash
   cp src/main/resources/application-secrets.properties.template src/main/resources/application-secrets.properties
   ```

2. Edit `src/main/resources/application-secrets.properties` and add your actual database password:
   ```properties
   spring.datasource.password=YOUR_ACTUAL_DATABASE_PASSWORD
   ```

### 2. Email Configuration (Optional)

If you plan to use email features, add your email credentials to the same file:
```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

### 3. Payment Configuration (For Production)

For production Razorpay integration, add your actual keys:
```properties
razorpay.key.id=rzp_live_YOUR_ACTUAL_KEY
razorpay.key.secret=YOUR_ACTUAL_SECRET
```

## 🛡️ Security Best Practices

### Files That Should NEVER Be Committed:
- `application-secrets.properties`
- `application-local.properties`
- `application-prod.properties`
- Any `.env` files with actual values
- Any files containing passwords, API keys, or secrets

### What's Safe to Commit:
- `application-secrets.properties.template` (template only)
- `application.properties` (no sensitive data)
- `.env.example` files (template only)

## 🚨 If You Accidentally Commit Secrets:

1. **Immediately rotate/change the exposed credentials**
2. **Remove the secret from git history:**
   ```bash
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch path/to/file/with/secret' --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push to update remote repository**
4. **Notify team members to re-clone the repository**

## ✅ Verification

Before committing any changes, always run:
```bash
git status
```

And verify that no files containing secrets are staged for commit.

## 📞 Support

If you have questions about security setup, please contact the development team.