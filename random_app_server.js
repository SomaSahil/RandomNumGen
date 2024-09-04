const express = require('express')
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express()
const port = 5000

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection URI
const uri = 'mongodb+srv://rduser:6drQ8G7VuPSagMLr@cluster0.h9ncona.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Adjust this to your MongoDB URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


let collection;
// Connect to MongoDB and initialize collection
const initDb = async () => {
    try {
      await client.connect();
      console.log('Connected to MongoDB');
      const db = client.db('randomDB'); // Replace 'mydatabase' with your database name
      collection = db.collection('randomdata'); // Replace 'mycollection' with your collection name
    } catch (err) {
      console.error('Failed to connect to MongoDB', err);
      process.exit(1);
    }
  };

  initDb();

app.post('/addData', async (req, res) => {
    const { number, createdon } = req.body;
    console.log('Number Recieved:',number);
    console.log('Date Recieved:',createdon);
  
    if (typeof number !== 'number' || isNaN(number) || !createdon) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input'
      });
    }
  
    try {
      // Find the latest entry to determine the next serial number
      const latestEntry = await collection.find().sort({ serial: -1 }).limit(1).toArray();
      const nextSerial = latestEntry.length > 0 ? latestEntry[0].serial + 1 : 1;
        
      // Insert new data with the next serial number
      const result = await collection.insertOne({
        serial: nextSerial,
        number,
        createdon
      });
  
      res.status(201).json({
        success: true,
        message: 'Data inserted successfully',
        result: result.insertedId
      });
    } catch (error) {
      console.error('Error inserting data', error);
      res.status(500).json({
        success: false,
        message: 'Failed to insert data'
      });
    }
  });

//getData endpoint to fetch data from DB to serve frontend
app.get('/getData', async (req, res) => {
    if (!collection) {
      return res.status(500).json({
        success: false,
        message: 'Database not initialized'
      });
    }
  
    try {
      const data = await collection.find().sort({ serial: 1 }).toArray();
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error fetching data', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch data'
      });
    }
  });

app.listen(port, () => {
  console.log(`Random Number Generator App listening on port ${port}`)
})