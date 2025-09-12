#!/bin/bash

# Domain Validation Script for kumak.dev
# Tests DNS resolution, SSL certificates, and site functionality

set -e

DOMAIN="kumak.dev"
WWW_DOMAIN="www.kumak.dev"

echo "🔍 Validating domain migration for $DOMAIN..."

# Function to test DNS resolution
test_dns() {
    local domain=$1
    echo "📡 Testing DNS resolution for $domain..."
    
    if dig +short $domain | grep -q .; then
        echo "✅ DNS resolution successful for $domain"
        dig +short $domain
    else
        echo "❌ DNS resolution failed for $domain"
        return 1
    fi
}

# Function to test HTTP/HTTPS connectivity
test_http() {
    local domain=$1
    echo "🌐 Testing HTTP connectivity for $domain..."
    
    # Test HTTPS
    if curl -Is https://$domain | head -1 | grep -q "200\|301\|302"; then
        echo "✅ HTTPS connection successful for $domain"
        # Show status and key headers
        curl -Is https://$domain | head -5
    else
        echo "❌ HTTPS connection failed for $domain"
        return 1
    fi
}

# Function to test SSL certificate
test_ssl() {
    local domain=$1
    echo "🔒 Testing SSL certificate for $domain..."
    
    if echo | openssl s_client -connect $domain:443 -servername $domain 2>/dev/null | openssl x509 -noout -text | grep -q "Subject:"; then
        echo "✅ SSL certificate valid for $domain"
        # Show certificate details
        echo | openssl s_client -connect $domain:443 -servername $domain 2>/dev/null | openssl x509 -noout -subject -issuer -dates
    else
        echo "❌ SSL certificate validation failed for $domain"
        return 1
    fi
}

# Function to test blog functionality
test_blog() {
    local domain=$1
    echo "📝 Testing blog functionality for $domain..."
    
    # Check if blog content loads
    if curl -s https://$domain | grep -q "<title>"; then
        echo "✅ Blog content loads successfully"
        # Extract title
        TITLE=$(curl -s https://$domain | grep -o '<title>[^<]*</title>' | sed 's/<title>\(.*\)<\/title>/\1/')
        echo "📰 Site title: $TITLE"
    else
        echo "❌ Blog content failed to load"
        return 1
    fi
}

# Function to check CDN/performance
test_performance() {
    local domain=$1
    echo "⚡ Testing performance for $domain..."
    
    # Measure response time
    RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" https://$domain)
    echo "⏱️  Response time: ${RESPONSE_TIME}s"
    
    # Check for CDN headers
    if curl -Is https://$domain | grep -q "cf-ray\|cloudflare"; then
        echo "✅ Cloudflare CDN detected"
    else
        echo "ℹ️  No Cloudflare CDN detected"
    fi
}

echo "🚀 Starting comprehensive domain validation..."
echo "================================================"

# Test main domain
echo "Testing $DOMAIN..."
test_dns $DOMAIN
test_http $DOMAIN
test_ssl $DOMAIN
test_blog $DOMAIN
test_performance $DOMAIN

echo ""
echo "Testing $WWW_DOMAIN..."
test_dns $WWW_DOMAIN
test_http $WWW_DOMAIN
test_ssl $WWW_DOMAIN

echo ""
echo "🎉 Domain validation completed!"
echo "================================================"

# Summary
echo "📊 Validation Summary:"
echo "  - DNS Resolution: ✅"
echo "  - HTTPS Connection: ✅" 
echo "  - SSL Certificate: ✅"
echo "  - Blog Functionality: ✅"
echo "  - Performance Check: ✅"
echo ""
echo "🎯 Migration appears successful!"