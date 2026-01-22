#!/bin/bash
# Grocito Database Migration Script
# Migrates data from local MySQL to TiDB Cloud

# ===========================================
# STEP 1: Export from Local MySQL
# ===========================================

echo "=== Grocito Database Migration ==="
echo ""

# Configuration - Update these values
LOCAL_HOST="localhost"
LOCAL_PORT="3306"
LOCAL_USER="root"
LOCAL_DB="grocito_db"
BACKUP_FILE="grocito_backup_$(date +%Y%m%d_%H%M%S).sql"

echo "Step 1: Exporting from local MySQL..."
echo "Database: $LOCAL_DB"
echo "Output: $BACKUP_FILE"
echo ""

# Export command
mysqldump -h $LOCAL_HOST -P $LOCAL_PORT -u $LOCAL_USER -p \
    --single-transaction \
    --routines \
    --triggers \
    --set-gtid-purged=OFF \
    $LOCAL_DB > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✓ Export successful: $BACKUP_FILE"
    echo "  Size: $(ls -lh $BACKUP_FILE | awk '{print $5}')"
else
    echo "✗ Export failed!"
    exit 1
fi

echo ""
echo "===========================================
STEP 2: Import to TiDB Cloud
===========================================

1. Go to https://tidbcloud.com and sign in
2. Create a Serverless cluster (free tier)
3. Click 'Connect' and get connection details
4. Run the import command:

mysql -h <TIDB_HOST> -P 4000 -u <TIDB_USER> -p --ssl-mode=VERIFY_IDENTITY < $BACKUP_FILE

Example:
mysql -h gateway01.us-east-1.prod.aws.tidbcloud.com -P 4000 -u 3Qxxxxxx.root -p --ssl-mode=VERIFY_IDENTITY < $BACKUP_FILE

===========================================
STEP 3: Update Render Environment Variables
===========================================

In Render dashboard, set these environment variables:

SPRING_DATASOURCE_URL=jdbc:mysql://gateway01.us-east-1.prod.aws.tidbcloud.com:4000/grocito_db?sslMode=VERIFY_IDENTITY
SPRING_DATASOURCE_USERNAME=3Qxxxxxx.root
SPRING_DATASOURCE_PASSWORD=<your_tidb_password>

==========================================="
