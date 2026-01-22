# Grocito Database Migration Script (Windows)
# Migrates data from local MySQL to TiDB Cloud

Write-Host "=== Grocito Database Migration ===" -ForegroundColor Green
Write-Host ""

# Configuration - Update these values
$LOCAL_HOST = "localhost"
$LOCAL_PORT = "3306"
$LOCAL_USER = "root"
$LOCAL_DB = "grocito_db"
$BACKUP_FILE = "grocito_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"

Write-Host "Step 1: Exporting from local MySQL..." -ForegroundColor Yellow
Write-Host "Database: $LOCAL_DB"
Write-Host "Output: $BACKUP_FILE"
Write-Host ""

# Export command
Write-Host "Run this command to export:" -ForegroundColor Cyan
Write-Host "mysqldump -h $LOCAL_HOST -P $LOCAL_PORT -u $LOCAL_USER -p --single-transaction --routines --triggers $LOCAL_DB > $BACKUP_FILE"
Write-Host ""

Write-Host "===========================================
STEP 2: Create TiDB Cloud Account
===========================================

1. Go to https://tidbcloud.com
2. Sign up with GitHub or email (free)
3. Create a 'Serverless' cluster
   - Choose region closest to your users
   - It's completely FREE (5GB storage)
4. Wait for cluster to be ready (~2 minutes)
5. Click 'Connect' button
6. Note down:
   - Host (e.g., gateway01.us-east-1.prod.aws.tidbcloud.com)
   - Port (4000)
   - Username (e.g., 3Qxxxxxx.root)
   - Password (set during creation)

===========================================
STEP 3: Import to TiDB Cloud
===========================================

Run this command to import:" -ForegroundColor Yellow

Write-Host "mysql -h <TIDB_HOST> -P 4000 -u <TIDB_USER> -p < $BACKUP_FILE" -ForegroundColor Cyan

Write-Host "
Example:
mysql -h gateway01.us-east-1.prod.aws.tidbcloud.com -P 4000 -u 3Qxxxxxx.root -p < $BACKUP_FILE

===========================================
STEP 4: Update Render Environment Variables
===========================================

In Render dashboard (render.com), set these environment variables:

SPRING_DATASOURCE_URL=jdbc:mysql://gateway01.us-east-1.prod.aws.tidbcloud.com:4000/grocito_db?sslMode=VERIFY_IDENTITY
SPRING_DATASOURCE_USERNAME=3Qxxxxxx.root
SPRING_DATASOURCE_PASSWORD=<your_tidb_password>

===========================================
STEP 5: Verify Connection
===========================================

After deployment, check backend logs in Render to ensure database connection is successful.

===========================================
" -ForegroundColor Yellow

Write-Host "Migration guide complete!" -ForegroundColor Green
