const mongoose = require("mongoose");

async function connectDB(mongoUri) {
  if (!mongoUri) throw new Error("MONGODB_URI is not defined");
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("MongoDB connected");
}

module.exports = { connectDB, mongoose };
