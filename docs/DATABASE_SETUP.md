# Database Setup (MongoDB Atlas)

## Atlas Cluster
1. Create a free/shared cluster in MongoDB Atlas
2. Create database user with readWrite role
3. Network access: allow Render egress IPs or 0.0.0.0/0 temporarily
4. Get connection string and set `MONGODB_URI`

## Performance Indexes
Run after first deploy:

```bash
cd backend
npm run migrate:indexes
```

## Backups
- Enable Atlas Continuous Backup (preferred) or periodic snapshots
- For manual backup:

```bash
mongodump --uri "$MONGODB_URI" --out ./backup-$(date +%F)
```

Restore:
```bash
mongorestore --uri "$MONGODB_URI" ./backup-folder
```

## Seeding Exercises
```bash
cd backend
npm run seed:exercises
```

## Connection Pooling
- Default `MONGODB_POOL_SIZE=10` (override in env)
- Tune based on concurrency on Render
