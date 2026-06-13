# Media Storage Configuration

## Current Architecture

This project uses an **external Media Server** for all file storage. Images are not stored in Supabase Storage or on a local filesystem — they are uploaded to and served from a dedicated media server whose configuration is managed dynamically via the Supabase database.

### How It Works

1. **Configuration Table** — Active media server settings are stored in the Supabase table `media_server_api_table`.
   - `api_url`: The base domain of the media server (e.g., `media.example.com/`).
   - `active_or_no`: Boolean flag indicating whether this server is active.
   - `order_of_procedence`: Used to select the primary server when multiple rows exist.

2. **Dynamic Resolution** — At runtime, the app queries `media_server_api_table` for the first active record and uses its `api_url` for all upload, fetch, and delete operations.

3. **Upload Flow**
   - User selects an image in the admin panel.
   - A safe filename is generated: base name (alphanumeric/underscore, max 150 chars) + timestamp suffix (`YYYYMMDDThhmmssSSS`).
   - The file is sent via `POST` to `https://{api_url}upload` as multipart/form-data.
   - The media server returns the stored filename.
   - The app constructs the public URL as `https://{api_url}file/{filename}.{ext}`.

4. **Delete Flow**
   - Deletion sends a `DELETE` request to `https://{api_url}delete/{filename}.{ext}`.

### API Endpoints Expected by the Media Server

Your external media server must expose the following endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Accepts `multipart/form-data` with `file` and `filename` fields. Returns `{ success: true, filename }`. |
| GET | `/file/{filename}.{ext}` | Serves the stored image publicly. |
| DELETE | `/delete/{filename}.{ext}` | Removes the file. Returns `{ success: true }`. |

> **Note:** The `public/api-examples/upload-endpoint.js` file is a **Node.js/Express reference implementation** for the media server itself, not for this frontend application.

### Admin Interface

- Go to **Admin → Content Management → Media Storage**.
- The panel displays the current storage type as **Media Server**.
- Server selection and failover are handled automatically by querying `media_server_api_table`; there is no manual toggle in the UI.

### Adding or Changing a Media Server

1. Insert a new row into `media_server_api_table` with the desired `api_url`.
2. Set `active_or_no = true` and adjust `order_of_procedence` as needed.
3. Ensure the server implements the three endpoints listed above.
4. The app will pick up the new configuration on the next upload without a code change.
