#!/bin/bash

# LiveCodes - GitHub Pages Deployment Script
# This script automates the deployment of LiveCodes to GitHub Pages
# with all necessary configurations for permalinks, sharing, and saving features.

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Main deployment function
main() {
    print_header "LiveCodes GitHub Pages Deployment"

    # Step 1: Pre-deployment checks
    print_info "Running pre-deployment checks..."
    check_git
    check_node
    check_dependencies
    check_git_remote

    # Step 2: Confirm deployment
    confirm_deployment

    # Step 3: Export i18n strings (required)
    print_info "Exporting internationalization strings..."
    npm run i18n-export
    print_success "i18n strings exported"

    # Step 4: Build the application
    print_info "Building LiveCodes application..."
    npm run build
    print_success "Build completed successfully"

    # Step 5: Deploy to GitHub Pages
    print_info "Deploying to GitHub Pages..."
    npm run deploy
    print_success "Deployment completed successfully"

    # Step 6: Post-deployment information
    show_deployment_info
}

# Check if git is installed
check_git() {
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install git first."
        exit 1
    fi
    print_success "Git is installed"
}

# Check if node is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi

    NODE_VERSION=$(node -v)
    print_success "Node.js is installed (${NODE_VERSION})"
}

# Check if dependencies are installed
check_dependencies() {
    if [ ! -d "node_modules" ]; then
        print_warning "Dependencies not installed. Installing now..."
        npm install
        print_success "Dependencies installed"
    else
        print_success "Dependencies are installed"
    fi
}

# Check git remote
check_git_remote() {
    if ! git remote get-url origin &> /dev/null; then
        print_error "No git remote 'origin' found. Please configure your git remote first."
        exit 1
    fi

    REMOTE_URL=$(git remote get-url origin)
    print_success "Git remote configured: ${REMOTE_URL}"
}

# Confirm deployment with user
confirm_deployment() {
    echo ""
    print_warning "This will deploy LiveCodes to GitHub Pages."
    echo ""

    # Get repo information
    REMOTE_URL=$(git remote get-url origin)
    REPO_NAME=$(basename -s .git "$REMOTE_URL")
    USER_NAME=$(basename $(dirname "$REMOTE_URL"))

    echo "Repository: ${USER_NAME}/${REPO_NAME}"
    echo "Deployment URL: https://${USER_NAME}.github.io/${REPO_NAME}/"
    echo ""

    read -p "Do you want to continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deployment cancelled."
        exit 0
    fi
}

# Show post-deployment information
show_deployment_info() {
    echo ""
    print_header "Deployment Complete!"

    # Get repo information
    REMOTE_URL=$(git remote get-url origin)
    REPO_NAME=$(basename -s .git "$REMOTE_URL")
    USER_NAME=$(basename $(dirname "$REMOTE_URL"))

    DEPLOYMENT_URL="https://${USER_NAME}.github.io/${REPO_NAME}/"

    echo ""
    print_success "Your LiveCodes instance has been deployed!"
    echo ""
    echo "Deployment URL: ${DEPLOYMENT_URL}"
    echo ""

    print_info "It may take a few minutes for GitHub Pages to build and deploy your site."
    echo ""

    print_header "Available Features"
    echo ""
    echo "✓ Code Playground: Full-featured code editor with 90+ languages"
    echo "✓ Save Projects: Projects are saved in browser LocalStorage"
    echo "✓ Share Code: Generate shareable URLs (long URLs or short URLs via dpaste)"
    echo "✓ Permalinks: Create permanent links to your code (via dpaste)"
    echo "✓ Import/Export: Import from GitHub, CodePen, etc."
    echo "✓ GitHub Integration: Sync projects to/from GitHub (requires GitHub login)"
    echo "✓ Deploy Projects: Deploy individual projects to GitHub Pages"
    echo ""

    print_header "Important Notes"
    echo ""
    print_warning "Short URLs for sharing use dpaste.com and expire after 365 days."
    echo ""
    echo "If you need permanent short URLs or additional features, consider:"
    echo "  1. Docker Setup: Run 'cd server && docker compose up -d'"
    echo "  2. Become a sponsor: https://livecodes.io/docs/sponsor"
    echo ""

    print_header "Next Steps"
    echo ""
    echo "1. Wait 2-5 minutes for GitHub Pages to deploy"
    echo "2. Visit: ${DEPLOYMENT_URL}"
    echo "3. Enable GitHub Pages in your repository settings if not already enabled:"
    echo "   - Go to: https://github.com/${USER_NAME}/${REPO_NAME}/settings/pages"
    echo "   - Source: Deploy from a branch"
    echo "   - Branch: gh-pages / (root)"
    echo ""

    print_success "Happy coding! 🚀"
    echo ""
}

# Run main function
main
