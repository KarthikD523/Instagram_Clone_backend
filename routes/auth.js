const express=require(`express`)
const requireLogin=require(`../middleware/requireLogin`)
const {JWT_SECRET}=require(`../keys`)
const bcrypt=require(`bcryptjs`)
const jwt=require('jsonwebtoken')
const router=express.Router()
const mongoose=require(`mongoose`)
const User=mongoose.model("User")

const nodemailer=require('nodemailer')
const sendGridTransport = require('nodemailer-sendgrid-transport');
const sendgridTransport = require('nodemailer-sendgrid-transport')

//0DA5703351467483540C955F6F7B8BE0AF25EAE2CB1066E1F3C0CB48C4FC5E9DE4D1CB237F71BEE4832130ADBAE67C03


const transporter=nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key:'0DA5703351467483540C955F6F7B8BE0AF25EAE2CB1066E1F3C0CB48C4FC5E9DE4D1CB237F71BEE4832130ADBAE67C03'
    }
}))

router.get('/',(req,res)=>{
    res.send('Hi')
})

router.get('/protected',requireLogin,(req,res)=>{
    res.send('Hi User')
})

router.post('/signUp',(req,res)=>{
    const {name,email,password,pic}=req.body

    if(!email || !password || !name)
    {
       return res.status(422).json({error:"Please provide all the fields"})
    }

    //res.json({message:"Successfully posted"})

    User.findOne({email:email})
    .then((savedUser)=>{
        if(savedUser){
            return res.status(422).json({error:"User already exists"})
        }

        bcrypt.hash(password,12)
        .then(hashedPassword=>{
            const user=new User({
                name,
                email,
                password:hashedPassword,
                pic:pic
            })
            user.save()
            .then(
                
                user=>{
                  
                   
                    res.json({message:"Saved Successfully"})
                }
            )
            .catch(err=>{
                console.log(err)
            })
        })
        
    })
    .catch((err)=>{
        console.log(err)
    })
   
})

router.post('/signIn',(req,res)=>{
    const {email,password}=req.body
    if(!email || !password){
    return  res.json({message:"Please provide all the details"})
    }
   User.findOne({email:email})
   .then(savedUser=>{
    if(!savedUser){
       return res.status(422).json({error:"Invalid Email or Password"})
    }

    bcrypt.compare(password,savedUser.password)
    .then(doMatch=>{
        if(doMatch){
          //  res.json("Signed In Successfully")
            const token=jwt.sign({_id:savedUser._id},JWT_SECRET)
            const {_id,name,email,followers,following,pic}=savedUser
            res.json({token,user:{_id,name,email,followers,following,pic}},)
        }
        else{
            res.status(422).json({error:"Invalid Email or Password"})  //Only password is wrong
        }
    })
    .catch(err=>{
        console.log(err)
    })
   })

})

router.post('/searchUser',(req,res)=>{
    let userPattern=new RegExp("^"+req.body.query)
    User.find({email:{$regex:userPattern}})
    .select("_id email name")
    .then(user=>res.json({user}))
    .catch(err=>console.log(err))
})



module.exports=router