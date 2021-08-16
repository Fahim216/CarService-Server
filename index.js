const express = require('express')
const cors=require('cors')
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload')
const fs= require('fs-extra')
const MongoClient = require('mongodb').MongoClient;
const ObjectId=require('mongodb').ObjectId;

require('dotenv').config()
const port = 5000;





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uswlv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('workers'))
app.use(fileUpload());

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const WorkerCollection = client.db("CarService").collection("Workers")
  const CarCollection = client.db("CarService").collection("Review")
  const OrderCollection = client.db("CarService").collection("orders")


app.post('/orders',(req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const service = req.body.service;
  OrderCollection.insertOne({name,email,service})
  .then(result=>{
    res.send(result.insertedCount>0);
  })
})



app.post("/addWorker",(req, res) => {
  const file=req.files.file;
  const name=req.body.name;
  const email=req.body.email;
  const description=req.body.description;
  const newImg=file.data;
  const encImg=newImg.toString('base64');
  // const filePath=`${__dirname}/workers/${file.name}`

  // console.log(name,email,file);
  // file.mv(filePath)
  

  var image={
    contentType:file.mimetype,
    size:file.size,
    img:Buffer.from(encImg,'base64')
  }

  WorkerCollection.insertOne({name,email,image,description})
  .then(result=>{
    res.send(result.insertedCount>0);
    })
  
 
})
app.get('/allOrders',(req, res)=>{
  OrderCollection.find({})
  .toArray((err,documents)=>{
    res.send(documents)
  })
});
app.get('/workers', (req, res) => {
  WorkerCollection.find({})
      .toArray((err, documents) => {
          res.send(documents);
      })
});

  app.get('/review',(req, res) => {
    CarCollection.find({})
    .toArray((err,documents) => {
      res.send(documents)
    })
  })






  // perform actions on the collection object
  app.post('/addReview',(req, res) => {
    const review=req.body;
    CarCollection.insertOne(review)
    .then(result => {
      res.send(result.insertedCount>0)
    })
  
  })

  app.delete('/delete/:id',(req, res) => {
    OrderCollection.deleteOne({_id:ObjectId(req.params.id)})
    .then(result=>{
      console.log(result)
    })
  
  })
  
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.listen(process.env.PORT||port)