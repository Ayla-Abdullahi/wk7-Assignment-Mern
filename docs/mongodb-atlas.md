# MongoDB Atlas Setup

## 1. Create Cluster
1. Sign in to MongoDB Atlas.
2. Create a new Project (e.g., Week7Mern).
3. Build a free tier cluster (M0) or higher for production.

## 2. Network Access
- Add IP allowlist: For Render/Railway use 0.0.0.0/0 temporarily then restrict; or configure VPC peering.

## 3. Database User (Least Privilege)
Create a user with `readWrite` on your application database ONLY.

## 4. Connection String
Copy SRV URI (starts with `mongodb+srv://`). Use in `MONGO_URI` environment variable.

## 5. Recommended Options
```
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<dbname>?retryWrites=true&w=majority&appName=week7
```
Add `&tls=true` if not enforced.

## 6. Script to Create User (Admin Context)
Use maintenance script (see `backend/scripts/createMongoUser.js`).

## 7. Backups & Monitoring
- Enable backups (M2+ tiers) or use scheduled `mongodump` \+ storage.
- Set Alerts (cluster metrics, connection spikes, slow queries).

## 8. Security
- Rotate credentials quarterly.
- Enforce SCRAM authentication.
- Disable public access; restrict to platform egress IPs.

## 9. Connection Pooling
Mongoose manages pooling automatically; adjust `maxPoolSize` if concurrency changes.
