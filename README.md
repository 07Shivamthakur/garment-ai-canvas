# AI Garment Studio — Pro

Transform design concepts into realistic garment mockups and model try-ons with AI-powered processing.

## Features

- **Flow 1: Design → Garment Mockups** - Transform design images into professional garment mockups (t-shirts, hoodies, sarees, etc.)
- **Flow 2: Garment → Model Render** - Upload garment photos and get professional model renders
- **Flow 3: Exact Model Try-On** - Combine specific garments with specific models for personalized visualization
- **Secure Processing** - All files sent securely via HTTPS to Make.com
- **Google Drive Integration** - Preview and download results directly from Google Drive

## Configuration

### Webhook URL

Update the webhook URL in `src/lib/config.ts`:

```typescript
export const CONFIG = {
  WEBHOOK_URL: "YOUR_MAKE_WEBHOOK_URL_HERE",
  // ... other settings
};
```

### Authentication

To change the allowed username and password:

1. **Username**: Update `ALLOWED_USERNAME` in `src/lib/config.ts`

2. **Password**: Generate a SHA-256 hash of your password and update `PASSCODE_HASH`:

```javascript
// Run this in your browser console to generate a hash:
async function hashPassword(password) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Usage:
hashPassword("your_password_here").then(console.log);
```

Then update `PASSCODE_HASH` in `src/lib/config.ts` with the output.

## Make.com Integration

The app expects the Make.com webhook to return one of these response formats:

### Option 1: Direct Output URL (JSON)
```json
{
  "OutputURL": "https://drive.google.com/file/d/...",
  "output_url": "https://drive.google.com/file/d/..."
}
```

### Option 2: Status URL for Polling (JSON)
```json
{
  "status_url": "https://your-status-endpoint.com/check/123"
}
```

The app will poll this URL every 5 seconds until it returns an output URL.

### Option 3: Plain Text URL
```
https://drive.google.com/file/d/...
```

## Development

```bash
npm install
npm run dev
```

## Deployment

Deploy to Lovable:
1. Click the "Publish" button in the Lovable editor
2. Your app will be live at your custom domain or Lovable subdomain

## Flow Details

### Flow 1: Design → Garment
- **Required**: Garment Type (text), Design Image (file)
- **Optional**: Email, Output Format
- Transforms design concepts into realistic garment mockups

### Flow 2: Garment → Model Render
- **Required**: Garment Photo (file)
- **Optional**: Email, Output Format
- Generates professional model renders with your garment

### Flow 3: Garment + Model → Exact Model Wearing
- **Required**: Garment Photo (file), Model Photo (file)
- **Optional**: Email, Output Format
- Places specific garment on specific model for personalized visualization

## Security

- Password is hashed using SHA-256
- Session tokens stored in sessionStorage with 120-minute TTL
- All file uploads sent via HTTPS
- No sensitive data logged to console

## Support

For questions or issues, contact: support@example.com
