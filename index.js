const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const recommendCollections = client.db("options").collection("recommend");

    // queries related api

    // get queries
    app.get("/queries", async (req, res) => {
      const cursur = queriesCollections.find();
      const result = await cursur.toArray();
      res.send(result);
    });

    // get user queries
    app.get("/user-queries", async (req, res) => {
      const userEmail = req.query;

      const result = await queriesCollections
        .find({ userEmail: userEmail.email })
        .toArray();

      res.send(result);
    });

    // get single querie
    app.get("/querie/:id", async (req, res) => {
      const id = req.params;

      const query = { _id: new ObjectId(id) };

      const result = await queriesCollections.findOne(query);

      res.send(result);
    });

    // add queries with post
    app.post("/add-queries", async (req, res) => {
      const queries = req.body;
      queries.timestamp = new Date();

      const result = await queriesCollections.insertOne(queries);
      res.send(result);
    });

    app.patch("/update-querie", async (req, res) => {
      const id = req.query.id;
      const updatedData = req.body.updatedQuerie;

      const filter = { _id: new ObjectId(id) };

      const updateDocument = {
        $set: {
          productName: updatedData.productName,
          productBrand: updatedData.productBrand,
          photoURL: updatedData.photoURL,
          queryTitle: updatedData.queryTitle,
          boycottingReason: updatedData.boycottingReason,
        },
      };

      const result = await queriesCollections.updateOne(filter, updateDocument);

      res.send(result);
    });

    app.delete("/delete-querie/:id", async (req, res) => {
      const id = req.params;

      const query = { _id: new ObjectId(id) };

      const result = await queriesCollections.deleteOne(query);

      res.send(result);
    });

    // recommend api

    app.get("/recommendation", async (req, res) => {
      const id = req?.query?.queryId;

      const result = await recommendCollections.find({ queryId: id }).toArray();

      res.send(result);
    });

    app.get("/my-recommendation", async (req, res) => {
      const email = req.query.email;

      const filter = { RecommenderEmail: email };

      const result = await recommendCollections.find(filter).toArray();

      res.send(result);
    });

    app.get("/recommendations-for-me", async (req, res) => {
      const email = req.query.email;

      const filter = { userEmail: email };

      const result = await recommendCollections.find(filter).toArray();

      res.send(result);
    });

    app.post("/add-recommend", async (req, res) => {
      const product = req.body;
      const id = product.queryId;

      const query = { _id: new ObjectId(id) };

      const updatedDoc = {
        $inc: { recommendationCount: +1 },
      };

      await queriesCollections.updateOne(query, updatedDoc);

      const result = await recommendCollections.insertOne(product);

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
