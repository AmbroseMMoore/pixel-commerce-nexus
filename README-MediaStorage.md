
# Media Storage Configuration

This project supports two types of media storage:

## 1. Cloud Storage (Supabase - Default)
- Files are stored in Supabase Storage
- Automatic public URLs
- Scalable and managed
- No server configuration required

## 2. Local Server Storage
- Files are stored on your hosting server
- Requires server-side upload handling
- You have full control over files
- Requires custom backup solutions

## Configuration

### Switching Storage Types
Edit `src/config/mediaStorage.ts` and change the `type` field:

```typescript
export const MEDIA_STORAGE_CONFIG: MediaStorageConfig = {
  type: 'local', // Change from 'cloud' to 'local'
  // ... rest of config
};
```

### For Local Storage Setup:
1. Implement the upload API endpoint on your server (see `public/api-examples/upload-endpoint.js`)
2. Create an `/uploads` directory in your server's public folder
3. Ensure your server can write to the uploads directory
4. Set up proper file serving for the uploads path

### Required Server Dependencies (for local storage):
```bash
npm install multer express
```

### Server Configuration Example:
```javascript
const express = require('express');
const uploadRouter = require('./api-examples/upload-endpoint');

const app = express();
app.use('/api', uploadRouter);
```

## Admin Interface
- Access media storage configuration in Admin → Content Management → Media Storage tab
- Switch between storage types
- Configure paths and settings
