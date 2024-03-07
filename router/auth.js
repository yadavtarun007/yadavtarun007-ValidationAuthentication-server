const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv');
const upload = require('../middleware/upload');
const authenticate = require('../middleware/authenticate');
const path = require('path');
require('multer');

require('../db/conn');
dotenv.config({ path: './config.env' });
const User = require("../model/userSchema");
const { Console } = require('console');


// router.get('/contact',(req,res)=>{
//     res.cookie("jwtoken","thapa"); 
//     res.send(`Hello home router`);
// });

//Defining Insert image function//

router.use(cookieParser());

//register...Using Async method//upload.single('image'),//
router.post('/register',async (req, res, next) => {

    const { name, email, phone, work, password, cpassword } = req.body;

    if (!name || !email || !phone || !work || !password || !cpassword) {
        return res.status(422).json({ error: "Plz fill credantials" })
    }

    try {
        const userExist = await User.findOne({ email: email });
        if (userExist) {
            return res.status(400).json({ error: "User Exixts" });
        }

        //Here we are saving the file on the database according to its presense//
        let user = new User({ name, email, phone, work, password, cpassword});
        //here we use the hashing for password using middleware (in userschema)// 
        await user.save();

        res.status(201).json({ message: "Registered Successfully" });

    } catch (err) {
        console.log(err);
    }

})

//login//
router.post('/signin', async (req, res, next) => {

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            console.log("Plz fill the credentials", email,"  ",password)
            return res.status(422).json({ error: "Plz fill credantials" });
        }
        const userLogin = await User.findOne({ email: email });

        if (userLogin) {
            const isMatch = await bcrypt.compare(password, userLogin.password);

            //callling the generate Autentication function//
            const token = await userLogin.genrateAuthToken();
            // console.log(token)

            //generate cookie code// 
           const cooky =  res.cookie("jwtoken", token, {
                expires: new Date(Date.now() + 60000*5),
                httpOnly: true
            });//code ends//

            if (isMatch) res.status(200).json({ message: "Successfully Login" });

            else res.status(400).json({ error: "Invalid Credentials" });
        } 
        else res.status(400).json({ error: "Invalid Credentials" });


    } catch (err) {
        console.log(err);
    }

});

//About Page//

router.get('/about',authenticate,(req,res)=>{
    console.log('Hello About');
    // console.log(req.rootUser);
    res.send(req.rootuser);
});

//Home page//
router.get('/getdata', authenticate, (req,res)=>{
    console.log("Hello GetData");   
    res.send(req.rootuser);
}); 

//contact page//
router.post('/contact', authenticate, async(req,res)=>{
    try{ //const date = new Date.now();
        console.log("Contact page")
        const {message} = req.body;
        if(!message){ console.log("message not found")
            return response.status(422).json({message:"Message not found"});
        } 
        
        const userContact = await User.findOne({_id:req.userID});

        if(userContact){
            const userMessage = await userContact.addMessage(message);
            await userContact.save();
            res.status(201).json({message:"Contact saved Successfully"});
            console.log(userMessage);
        }    
    }catch(err){
        console.log("root err")
    }
});

//Logout Page//
router.get('/logout', (req,res)=>{
    console.log("Hello Logout");   
    res.clearCookie('jwtoken',{path:'/'});
    res.status(201).json({ message: 'Logout successful' });
});

//registration...Using Promise method//
// router.post('/register', (req,res)=>{
//     const {name,email,phone,work,password,cpassword} = req.body;

//     if(!name || !email || !phone || !work || !password || !cpassword)
//      {
//         return res.status(422).json({error:"Plz fill credantials"})
//      } 

//  User.findOne({email:email})
//  .then((userExist) => {
//     if(userExist){
//         return res.status(400).json({error:"User already exists"});
//     }

//     const user = new User({name,email,phone,work,password,cpassword});

//     user.save().then(()=>{
//         res.status(201).json({message:"user registered successfully"});
//     }).catch((err)=>res.status(500).json({error:"failed to register"}));
// }).catch((err)=>{
//     console.log(err);
// })

// console.log(name)
// console.log(req.body);
// res.json({name});
// });

module.exports = router;