export default {
  datasources: {
    db: {
      url: String(process.env.DATABASE_URL || ''),
    },
  },
} as const;
