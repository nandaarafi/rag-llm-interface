#!/bin/bash

# Script to upload environment variables to Vercel
echo "Uploading environment variables to Vercel..."

# Read .env.production and upload each variable
while IFS='=' read -r key value; do
  # Skip empty lines and comments
  if [[ -z "$key" || "$key" =~ ^[[:space:]]*# ]]; then
    continue
  fi
  
  # Remove quotes from value if present
  value=$(echo "$value" | sed "s/^['\"]//;s/['\"]$//")
  
  # Skip empty values (for LemonSqueezy variables you mentioned)
  if [[ -z "$value" ]]; then
    echo "Skipping $key (empty value)"
    continue
  fi
  
  echo "Adding $key..."
  echo "$value" | vercel env add "$key" production
  
done < .env.production

echo "Done uploading environment variables!"