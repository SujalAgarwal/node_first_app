const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const k = path.resolve();
const mongoose = require("mongoose");
const cookieParser=require("cookie-parser");
const jwt=require("jsonwebtoken");
const { log } = require("console");
const bcrypt=require('bcrypt');
mongoose.connect("mongodb://localhost:27017", {
    dbname: "backend",
}).then(() => {
    console.log("database connected");
}).catch(() => {
    console.log("error");
})
//we have to create message schema for the moongose and the mongo db
const user_schema = new mongoose.Schema({
    name: String,
    email: String,
    password:String,
})
const User = mongoose.model("User", user_schema);


//temporary array to store the data...
//const users = [];
app.use(express.static(path.join(k, "public")));
//we are using middleware here
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.set("view engine", "ejs");
app.listen(5000, () => {
    console.log("server is working")
})
const isAuthenticated=async (req,res,next)=>{
    const token=req.cookies.token;
    console.log(token);
    if(token)
    {
      const decoded=jwt.verify(token,"ygecgyebc");
      const {id,iat}=(decoded);
      req.user= await User.findById(id);
      console.log(req.user);

     next();
    }
    else
    {
     res.render("login");
    }
 }
app.get("/",isAuthenticated, (req, res) => {
    console.log(req.user);
    res.render("logout",{name:req.user.name});
    

})

app.post("/login",async (req,res)=>{
   
    //console.log(req.body)
    const email=req.body.email;
    const name=req.body.name;
    const password=req.body.password;
    const user= await User.findOne({name,email,password});  
     console.log(user);
     if(user)
     {
        const token=jwt.sign({id:user._id},"ygecgyebc");
        res.cookie("token",token);
     }
     
    //console.log(user);
    if(!user)
    { 
        console.log("Register First");
        return res.redirect("/register");
    }
   
    console.log("hello");
    res.redirect("/");
   
    
   
})
app.get("/logout",(req,res)=>{
  
   res.cookie("token","");
 
   res.redirect("/");
   });
 app.get("/register",(req,res)=>{
     res.render("register");
    
 })
app.post("/register",async(req,res)=>{
    const user=await User.create(
        {
            name:req.body.name,
            email:req.body.email,
            password:req.body.password
        }
    )
    const token=jwt.sign({id:user._id},"ygecgyebc");
    res.cookie("token",token);
    res.redirect("/login");
  
})
app.get("/login",(req,res)=>{
    res.render("login");
})

