const redis= require('redis');
const express = require ("express");
const path = require("path");



const app = express ();
app.use(express.json());

const redisClient = redis.createClient({ url: 'redis://localhost:6379' });

(async () => {
    redisClient.on("error", (error) => console.error(`Ups : ${error}`));
    
    await redisClient.connect();
   
  })();


module.exports = redisClient;

/*
function createAppInstance(port) {
  const app = express();
  
  app.use(express.json());
*/

  //set routes
const cartRoutes = require("./routes/cart.js");
app.use("/cart",cartRoutes);

const userRoutes = require("./routes/user.js");
app.use("/user",userRoutes);

const productRoutes = require("./routes/product.js");
app.use("/product",productRoutes);

  // Start the app on the specified port
const port=2000;
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
  });




module.exports = app


