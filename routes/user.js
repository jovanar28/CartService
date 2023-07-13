const express = require ("express");
const router = express.Router();
const redisClient = require("../app.js")

router.use(express.json());
module.exports = router;

const userData = [
    { name: "Shaq",email: "shaq@example.com"},
    { name: "Jelena",email: "jelena@example.com"},
    { name: "Simon",email: "simon@example.com"}
];


var indeks = 1; 
var userKey = `user${indeks}`;
  
async function insertAll (obj){
      for(let i = 0 ;i < obj.length; i++){
          let curr = obj[i];
          await doRedis(JSON.stringify(curr));
      }
}
async function doRedis(obj){
      await redisClient.set(userKey,obj);
      console.log(obj,userKey);
      indeks=indeks+1;
      userKey = `user${indeks}`;
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
        insertAll(userData);
        res.status(200);
    }
    catch(err){
        console.log(err);
    }
})

router.get("/:id", async (req,res)=>{
    try{
        const users = await getRedis(`user${req.params.id}`);
        return res.status(200).json(users);
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Greska", data:err});
    }
   
})
