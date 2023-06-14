const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.S3_BUCKET}:${process.env.SECRET_KEY}@cluster0.25nqiwd.mongodb.net/?retryWrites=true&w=majority`;
// const uri = "mongodb://0.0.0.0:27017";
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
    const taskCollections = client.db("taskshuTask").collection("task");

    // post new task
    app.post("/addNewTask", async (req, res) => {
      const taskData = req.body;
      const result = await taskCollections.insertOne(taskData);
      res.send(result);
    });

    // get all task by id
    app.get("/allTask/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollections.findOne(query);
      res.send(result);
    });
    // update

    app.patch("/updateTask", async (req, res) => {
      const id = req.query.id;
      console.log(id);
      const updatedTaskData = req.body;
      console.log(updatedTaskData);
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          ...updatedTaskData,
        },
      };
      const result = await taskCollections.updateOne(query, updatedDoc);
      res.send(result);
    });
    // get pending task
    app.get("/pendingTask", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const result = await taskCollections
        .find({
          email: email,
          status: "pending",
        })
        .toArray();
      res.send(result);
    });

    // set status working
    app.patch("/status/pending/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "working",
        },
      };
      const result = await taskCollections.updateOne(filter, updateDoc);
      res.send(result);
    });
    // get working task
    app.get("/workingTask", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const result = await taskCollections
        .find({
          email: email,
          status: "working",
        })
        .toArray();
      res.send(result);
    });

    // set status finished
    app.patch("/status/finished/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "finished",
        },
      };
      const options = { returnOriginal: false }; // Retrieve the updated document
      const result = await taskCollections.findOneAndUpdate(
        filter,
        updateDoc,
        options
      );
      res.send(result.value); // Send the updated document as the response
    });

    // get finished task
    app.get("/finishedTask", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const result = await taskCollections
        .find({
          email: email,
          status: "finished",
        })
        .toArray();
      res.send(result);
    });

    // delete task
    app.delete("/deleteTask/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollections.deleteOne(query);
      res.send(result);
    });

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Taskshu Server is running..");
});

app.listen(port, () => {
  console.log(`Taskshu is running on port ${port}`);
});
