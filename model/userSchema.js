//const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
//dotenv.config({path: './config.env'});


const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    work:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    cpassword:{
        type:String,
        required:true
    },
    messages:[
        {
            message:{
                type:String,
                required:true
            },
            date:{
                type:Date,
                default:Date.now()
            }
        }
    ],
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ]
    
});


//Defining the middleware to hash pass & cpass//
userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        console.log('hello every one');
        this.password = await bcrypt.hash(this.password,12);
        this.cpassword = await bcrypt.hash(this.cpassword,12);
        
    }
    
    next();
});

//Defining token Authentication//
userSchema.methods.genrateAuthToken = async function(){
    
    try{
        let genratetoken = jwt.sign({_id:this.id}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:genratetoken});
        await this.save();
        return genratetoken;
    }catch(err){
        console.log(err);
    }
}

userSchema.methods.addMessage = async function (message){
    try{
        this.messages = this.messages.concat({message:message});
        await this.save();
        return this.messages;
    }catch(err){
        console.log("Message err in Schema");
    }
}

const User = mongoose.model('REGISTRATION',userSchema);

module.exports=User;


