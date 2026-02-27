import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("❌ Please add MONGODB_URI in .env.local");
}

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // Use global variable in dev to prevent multiple connections
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production always create new connection
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;