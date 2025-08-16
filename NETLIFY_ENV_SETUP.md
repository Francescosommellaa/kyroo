# Netlify Environment Variables Setup

This guide explains how to configure environment variables in Netlify to replace local .env files for production deployments.

## Required Environment Variables

The following environment variables need to be configured in your Netlify dashboard:

### Supabase Configuration
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_URL`: Your Supabase project URL (for server-side functions)
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (mark as secret)

### Milvus/Zilliz Configuration
- `VITE_MILVUS_ENDPOINT`: Your Milvus/Zilliz endpoint URL
- `VITE_MILVUS_TOKEN`: Your Milvus/Zilliz token (mark as secret)
- `MILVUS_ENDPOINT`: Your Milvus/Zilliz endpoint URL (for server-side functions)
- `MILVUS_TOKEN`: Your Milvus/Zilliz token (mark as secret)

### Google OAuth Configuration
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret (mark as secret)

## How to Configure in Netlify

1. Go to your Netlify dashboard
2. Select your project
3. Navigate to **Site settings** > **Environment variables**
4. Click **Add a variable** for each environment variable
5. For sensitive values (tokens, secrets, keys), check **Contains secret values**

## Important Security Notes

- Always mark sensitive values as secrets in Netlify
- Never commit actual .env files with real values to your repository
- The .env file should only be used for local development
- Production builds will use environment variables from Netlify dashboard

## Local Development

For local development, continue using the .env file in the project root. The Vite configuration has been updated to only load .env files in development mode.