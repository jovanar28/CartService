const express = require ("express");
const router = express.Router();
const redis= require('redis');
const redisClient = require("../app.js");
const { json } = require("body-parser");



router.use(express.json());
module.exports = router;

const cartData = [
    {  user_id: "1",product_id:["2","3"],quantity: ["2","1"]},
    {  user_id: "2",product_id: ["3"],quantity:["2"]},
    {  user_id: "3",product_id: ["4"],quantity: ["2"]},
];


var indeks = 1; 
var cartKey = `cart${indeks}`;
  
async function insertAll (obj){
      for(let i = 0 ;i < obj.length; i++){
          let curr = obj[i];
          await doRedis(JSON.stringify(curr));
      }
}
async function doRedis(obj){
      await redisClient.set(cartKey,obj);
      console.log(obj,cartKey);
      indeks=indeks+1;
      cartKey = `cart${indeks}`;
}
  
async function getRedis(obj){
      let jsonres = null;
    //  console.log(obj);
      let value =  await redisClient.get(obj).then(res => {  
          jsonres = JSON.parse(res);
      })
    
      //console.log(jsonres);
      return jsonres;
}


router.get("/insertData",async(req,res)=>{
    try{
        await insertAll(cartData);
        return res.status(200).json({msg: "Cart tmp data added"});
    }
    catch(err){
        console.log(err);
    }
})



//get cart
/*
router.get("/:id", async (req,res)=>{
    try{
        const carts = await getRedis(`cart${req.params.id}`);
        return res.status(200).json(carts);
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Greska", data:err});
    }
   
})
*/

//get all products from cart

router.get("/:id", async (req,res)=>{
    try{
        let cart = redisClient.get(`cart${req.params.id}`);
        cart.then(function (result){
        let jsonObj = JSON.parse(result);
        let products = jsonObj.product_id;
       
        return res.status(200).json(products);
    
     })
     
       
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Greska", data:err});
    }
   
})



//add product to cart

router.post("/addToCart", async(req,res) => {

   
    try{
     let cart_id = req.body.id;
     let product_id = req.body.product_id;
     let quantity = req.body.quantity;

    
     let myObject = redisClient.get(`cart${cart_id}`);
        myObject.then(function (result){
        let jsonObj = JSON.parse(result);
        jsonObj.product_id.push(product_id);
        jsonObj.quantity.push(quantity);
         
        let stringifyJSON = JSON.stringify(jsonObj);
        redisClient.set(`cart${cart_id}`,stringifyJSON);

        console.log(jsonObj);
        return res.status(200).json(jsonObj);
    
     })

      

    } catch(err){
        res.status(500).json({error: "Error", data:err});
    }
});

//update produts quantity

router.put("/updateCart/:id/:productid/:quant", async (req,res) =>{
    try{
        let cart = redisClient.get(`cart${req.params.id}`);
        cart.then(function (result){
        let jsonObj = JSON.parse(result);
        let products = jsonObj.product_id;
        let quantites = jsonObj.quantity;
        let newProd  = req.params.productid;
        let newQuant = req.params.quant;

        if(products.includes(newProd)){
           let index = products.indexOf(newProd);
            products[index] = newProd;
            quantites[index] = newQuant;
        }

        let stringifyJSON = JSON.stringify(jsonObj);
        redisClient.set(`cart${req.params.id}`,stringifyJSON);

        res.status(200).json(jsonObj);
    })

    }catch(err){
        res.status(500).json({error:"Error", data:err});
    }
})

//delete product

router.delete ("/delete/:id/:productid",async (req,res)=>{
    try{
        let cart = redisClient.get(`cart${req.params.id}`);
        cart.then(function (result){
        let jsonObj = JSON.parse(result);
        let products = jsonObj.product_id;
        let quantites = jsonObj.quantity;
        let prodRem  = req.params.productid;
       
        if(products.includes(prodRem)){
           let index = products.indexOf(prodRem);
           products.splice(index);
           quantites.splice(index);
        }

        let stringifyJSON = JSON.stringify(jsonObj);
        redisClient.set(`cart${req.params.id}`,stringifyJSON);

        res.status(200).json(jsonObj);
    })

    }catch(err){
        res.status(500).json({error:"Error", data:err});
    }
})