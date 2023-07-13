const express = require ("express");
const router = express.Router();
const redisClient = require("../app.js")

router.use(express.json());
module.exports = router;

const productData = [
    { quantity: "10", price:"10"},
    { quantity: "11", price:"5"},
    { quantity: "20", price:"1"},
    { quantity: "14", price:"14"},
    { quantity: "10", price:"10"},
];

var indeks = 1; 
var productKey = `product${indeks}`;

async function insertAll (obj){
    for(let i = 0 ;i < obj.length; i++){
        let curr = obj[i];
        await doRedis(JSON.stringify(curr));
    }
}
async function doRedis(obj){
    await redisClient.set(productKey,obj);
    console.log(obj,productKey);
    indeks=indeks+1;
    productKey = `product${indeks}`;
}

async function getRedis(obj){
    let jsonres = null;
    console.log(obj);
    let value =  await redisClient.get(obj).then(res => {  
        jsonres = JSON.parse(res);
    })
  
    console.log(jsonres);
    return jsonres;
}

router.get("/insertData",async(req,res)=>{
    try{
        insertAll(productData);
        return res.status(200);
    }
    catch(err){
        console.log(err);
    }
})

router.get("/:id", async (req,res)=>{
    try{
        const products = await getRedis(`product${req.params.id}`);
        return res.status(200).json(products);
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Greska", data:err});
    }
   
})