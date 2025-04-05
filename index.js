const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();

const port = process.env.PORT || 8000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8qsyw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    // get single food by ID
    app.get("/food/:id", async (req, res) => {
      try {
        const id = req.params.id;
        // console.log("Received ID:", id, "Type:", typeof id);

        if (!ObjectId.isValid(id)) {
          return res.status(400).send("Invalid ID format");
        }

        const query = { _id: new ObjectId(id) };
        const result = await foodsCollection.findOne(query);

        if (!result) {
          return res.status(404).send("Food not found");
        }

        res.send(result);
      } catch (error) {
        // console.error("Error fetching food:", error);
        res.status(500).send("Internal server error");
      }
    });

    // save a userData in db
    app.post("/user-food", async (req, res) => {
      const userfoodData = req.body;
      const result = await usersCollection.insertOne(userfoodData);
      // console.log(result)
      res.send(result);
    });

    // get all foods posted by a specific user
    app.get("/foods/user/:email", async (req, res) => {
      const email = req.params.email;
    //   console.log("email from params-->", email);

      const query = { buyerEmail: email };
      const result = await usersCollection.find(query).toArray();
    //   console.log(result);
      res.send(result);
    });

    // update(put) route for specific user food
    app.put("/foods/user/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedFood = req.body;
        // console.log("Updating food with ID:", id, "Data:", updatedFood);

        
        const result = await usersCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
            
              BuyingQuantity: updatedFood.BuyingQuantity,
            },
          }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ message: "Food item not found" });
        }
        res.send({ message: "Update successful", result });
      } catch (error) {
        // console.error("Error updating food:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    //  Add food item for a specific user
    app.post("/foods/user/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const foodData = req.body;
        // console.log(foodData);

        
        const result = await usersCollection.insertOne(foodData);
        // console.log(result);
        res.status(201).json({
          message: "Food item added successfully",
          insertedId: result.insertedId
        });
      } catch (error) {
        // console.error("Error adding food item:", error);
        res.status(500).json({ message: "Failed to add food item" });
      }
    });

   
    // DELETE endpoint for removing food items
    app.delete("/foods/:id", async (req, res) => {
        try {
          const { id } = req.params;
        //   console.log("Attempting to delete food with ID:", id);
      
              
          const result = await usersCollection.deleteOne({ 
            _id: new ObjectId(id) 
          });
          
        //   console.log("Delete operation result:", result);
      
          if (result.deletedCount === 0) {
            // console.log("No document found with ID:", id);
            return res.status(404).json({
              success: false,
              message: "Food item not found"
            });
          }
      
          res.status(200).json({
            success: true,
            message: "Food item deleted successfully"
          });
      
        } catch (error) {
        //   console.error("Full delete error:", error);
          res.status(500).json({
            success: false,
            message: "Failed to delete food item",
            
          });
        }
      });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello from Restaurant Management Server....");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
