#!/bin/bash
# Local Build Deployment Script for GrowthCanvas
# This script builds locally and deploys only the build files to save server space

set -e  # Exit on error

# Configuration
SERVER_IP="165.227.124.184"
SSH_USER="root"
REMOTE_FRONTEND_DIR="/var/www/growthcanvas/frontend"
REMOTE_BACKEND_DIR="/var/www/growthcanvas/backend"
SERVICE_NAME="growthcanvas"

# Function to deploy frontend (build locally, deploy build files only)
deploy_frontend() {
  echo ""
  echo "===== Starting Frontend Deployment ====="
  echo "$(date)"
  
  # Make sure we're in the frontend directory
  if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Make sure you're in the frontend directory."
    return 1
  fi
  
  # Step 1: Install dependencies locally
  echo "Installing npm dependencies locally..."
  npm ci || npm install
  
  # Step 2: Build the application locally
  echo "Building the application locally..."
  npm run build
  
  # Step 3: Verify SimpleAnalytics script is in the local build
  if grep -q "simpleanalyticscdn" build/index.html; then
    echo "SimpleAnalytics script successfully included in the build."
  else
    echo "WARNING: SimpleAnalytics script not found in the built index.html!"
    echo "Make sure it's included in your public/index.html file."
    read -p "Continue anyway? (y/n): " continue_deploy
    if [[ $continue_deploy != "y" && $continue_deploy != "Y" ]]; then
      echo "Deployment aborted."
      return 1
    fi
  fi
  
  # Step 4: Create a zip archive of only the build directory
  echo "Creating zip archive of the build..."
  BUILD_PACKAGE="frontend_build.zip"
  (cd build && zip -r ../${BUILD_PACKAGE} .)
  
  # Step 5: Copy the build package to the server
  echo "Copying build to remote server..."
  scp ${BUILD_PACKAGE} ${SSH_USER}@${SERVER_IP}:/tmp/
  
  # Step 6: SSH into the server and deploy the build
  echo "Deploying on remote server..."
  ssh ${SSH_USER}@${SERVER_IP} << EOF
    # Backup current build
    TIMESTAMP=\$(date +"%Y%m%d_%H%M%S")
    mkdir -p ${REMOTE_FRONTEND_DIR}/backups
    if [ -d "${REMOTE_FRONTEND_DIR}/build" ]; then
      echo "Backing up current build..."
      tar -czf ${REMOTE_FRONTEND_DIR}/backups/build_backup_\${TIMESTAMP}.tar.gz -C ${REMOTE_FRONTEND_DIR} build
    fi
    
    # Remove old build and create a new one
    echo "Replacing build directory..."
    rm -rf ${REMOTE_FRONTEND_DIR}/build
    mkdir -p ${REMOTE_FRONTEND_DIR}/build
    
    # Extract the build files
    echo "Extracting new build files..."
    unzip -q /tmp/${BUILD_PACKAGE} -d ${REMOTE_FRONTEND_DIR}/build
    
    # Set proper permissions
    echo "Setting permissions..."
    chown -R www-data:www-data ${REMOTE_FRONTEND_DIR}/build
    chmod -R 755 ${REMOTE_FRONTEND_DIR}/build
    
    # Clean up
    echo "Cleaning up..."
    rm /tmp/${BUILD_PACKAGE}
    
    # Restart nginx
    echo "Restarting Nginx..."
    systemctl restart nginx
EOF
  
  # Step 7: Clean up local build package
  echo "Cleaning up local files..."
  rm ${BUILD_PACKAGE}
  
  echo "===== Frontend Deployment Completed Successfully ====="
  echo "$(date)"
}

# Function to deploy backend
deploy_backend() {
  echo ""
  echo "===== Starting Backend Deployment ====="
  echo "$(date)"
  
  # Check if we're in the backend directory
  if [ ! -f "requirements.txt" ]; then
    echo "Error: requirements.txt not found. Make sure you're in the backend directory."
    return 1
  fi
  
  # Step 1: Bundle only the necessary backend code (excluding unnecessary directories)
  echo "Creating deployment package..."
  TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
  DEPLOY_PACKAGE="backend_deploy_${TIMESTAMP}.zip"
  
  # Create a zip archive of your backend code, excluding unnecessary files
  zip -r ${DEPLOY_PACKAGE} . -x "*.git*" -x "*__pycache__*" -x "*.pyc" -x "*.pyo" -x "venv/*" -x "node_modules/*" -x "*.log" -x "backups/*"
  
  # Step 2: Copy the package to the server
  echo "Copying deployment package to remote server..."
  scp ${DEPLOY_PACKAGE} ${SSH_USER}@${SERVER_IP}:/tmp/
  
  # Step 3: SSH into the server and deploy
  echo "Deploying on remote server..."
  ssh ${SSH_USER}@${SERVER_IP} << EOF
    # Create backup of current code (excluding large directories)
    echo "Backing up current code..."
    TIMESTAMP=\$(date +"%Y%m%d_%H%M%S")
    mkdir -p ${REMOTE_BACKEND_DIR}/backups
    
    # Use find to create a list of files to back up, excluding large directories
    cd ${REMOTE_BACKEND_DIR}
    find . -type f -not -path "./venv/*" -not -path "./.git/*" -not -path "./__pycache__/*" -not -path "./backups/*" -not -path "./node_modules/*" > /tmp/backup_files.txt
    
    # Create a more space-efficient backup
    tar -czf ${REMOTE_BACKEND_DIR}/backups/backend_backup_\${TIMESTAMP}.tar.gz -T /tmp/backup_files.txt
    rm /tmp/backup_files.txt
    
    # Create a temporary directory for new code
    echo "Preparing deployment..."
    mkdir -p /tmp/backend_deploy
    unzip -q /tmp/${DEPLOY_PACKAGE} -d /tmp/backend_deploy
    
    # Copy files to production (preserving venv and .env)
    echo "Copying new files to production..."
    # Using rsync to avoid overwriting venv and .env
    rsync -a --exclude="venv" --exclude=".env" /tmp/backend_deploy/ ${REMOTE_BACKEND_DIR}/
    
    # Install/update Python dependencies
    echo "Installing Python dependencies..."
    cd ${REMOTE_BACKEND_DIR}
    ${REMOTE_BACKEND_DIR}/venv/bin/pip install --upgrade pip
    ${REMOTE_BACKEND_DIR}/venv/bin/pip install -r requirements.txt
    
    # Run database migrations (if applicable)
    echo "Running database migrations..."
    if [ -f "${REMOTE_BACKEND_DIR}/alembic.ini" ]; then
      # Using Alembic for migrations
      ${REMOTE_BACKEND_DIR}/venv/bin/alembic upgrade head
      echo "Alembic migrations completed."
    elif [ -f "${REMOTE_BACKEND_DIR}/manage.py" ]; then
      # Using Django
      ${REMOTE_BACKEND_DIR}/venv/bin/python manage.py migrate
      echo "Django migrations completed."
    else
      echo "No migration system detected. Skipping migrations."
    fi
    
    # Set appropriate permissions
    echo "Setting appropriate permissions..."
    chown -R www-data:www-data ${REMOTE_BACKEND_DIR}
    chmod -R 755 ${REMOTE_BACKEND_DIR}
    
    # Clean up
    echo "Cleaning up..."
    rm -rf /tmp/backend_deploy
    rm /tmp/${DEPLOY_PACKAGE}
    
    # Restart the backend service
    echo "Restarting backend service..."
    systemctl restart ${SERVICE_NAME}
    sleep 2
    systemctl status ${SERVICE_NAME} --no-pager
EOF
  
  # Step 4: Clean up local package
  echo "Cleaning up local files..."
  rm ${DEPLOY_PACKAGE}
  
  echo "===== Backend Deployment Completed Successfully ====="
  echo "$(date)"
}

# Function to clean up old backups to save space
clean_backups() {
  echo ""
  echo "===== Cleaning Up Old Backups ====="
  
  # SSH into server and remove backups older than 7 days
  ssh ${SSH_USER}@${SERVER_IP} << EOF
    # Remove frontend backups older than 7 days
    echo "Cleaning up old frontend backups..."
    find ${REMOTE_FRONTEND_DIR}/backups -name "*.tar.gz" -type f -mtime +7 -delete
    
    # Remove backend backups older than 7 days
    echo "Cleaning up old backend backups..."
    find ${REMOTE_BACKEND_DIR}/backups -name "*.tar.gz" -type f -mtime +7 -delete
    
    # Clean npm cache
    echo "Cleaning npm cache..."
    npm cache clean --force
    
    # Display disk usage
    echo "Current disk usage:"
    df -h /
EOF
  
  echo "===== Backup Cleanup Completed ====="
}

# Main script execution
echo "GrowthCanvas Deployment"
echo "======================="
echo "1) Deploy Frontend"
echo "2) Deploy Backend"
echo "3) Deploy Both"
echo "4) Clean Up Old Backups"
echo ""
read -p "Choose an option (1-4): " choice

case $choice in
  1)
    deploy_frontend
    ;;
  2)
    deploy_backend
    ;;
  3)
    echo "Deploying both frontend and backend..."
    # Check if we're in a project root with both directories
    if [ -d "frontend" ] && [ -d "backend" ]; then
      # Deploy frontend first
      cd frontend
      deploy_frontend
      cd ..
      
      # Then deploy backend
      cd backend
      deploy_backend
      cd ..
    else
      echo "Error: frontend and backend directories not found in current directory."
      echo "Make sure you're in the project root or run each deployment separately."
      exit 1
    fi
    ;;
  4)
    clean_backups
    ;;
  *)
    echo "Invalid option"
    exit 1
    ;;
esac

echo ""
echo "Deployment process completed!"
