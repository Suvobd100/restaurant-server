const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 8000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8qsyw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@main.yolij.mongodb.net/?retryWrites=true&w=majority&appName=Main`

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
    const db = client.db("restaurantDB");
    const foodsCollection = db.collection("foods");
    const usersCollection = db.collection("users");

    // get all foods data from db
    app.get("/foods", async (req, res) => {
      const result = await foodsCollection.find().toArray();
      res.send(result);
    });

    // get a single food data by _id from db
    app.get('/food/:id', async (req, res) => {
        const id = req.params.id
        console.log(id);
        const query = { _id: new ObjectId(id) }
        const result = await foodsCollection.findOne(query)
        res.send(result)
      })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello from Restaurant Management Server....");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
