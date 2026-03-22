import mongoose from "mongoose";

import { env } from "@/config/env";

declare global {
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const cache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cache;

export async function connectToDatabase() {
  if (!env.mongoUri) {
    return null;
  }

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(env.mongoUri, {
      dbName: "calorietrack",
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
