const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rgswvir.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const queriesCollections = client.db("options").collection("queries");

    // queries related api

    // get queries
    app.get("/queries", async (req, res) => {
      const cursur = queriesCollections.find();
      const result = await cursur.toArray();
      res.send(result);
    });

    // add queries with post
    app.post("/add-queries", async (req, res) => {
      const queries = req.body;
      queries.timestamp = new Date();

      const result = await queriesCollections.insertOne(queries);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port);
