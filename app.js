const express=require('express')
const cors = require('cors');



const {MONGOURI}=require(`./keys`)
const app=express()

const mongoose=require(`mongoose`)
app.use(cors());
require(`./models/user`)
require('./models/post')

app.use(express.json())
app.use(require('./routes/auth'))
app.use(require('./routes/post'))
app.use(require('./routes/user'))


//mongoose.model("User")

const PORT=5000

mongoose.connect(MONGOURI)

mongoose.connection.on('connected',()=>{
    console.log('Connected to MONGODB')
})

mongoose.connection.on('error',(err)=>{
    console.log('err connecting',err)
})


/*const custommiddleWare=(req,res,next)=>{
    console.log("Executing MiddleWare")
    next()
}

//app.use(custommiddleWare)
app.get('/home',(req,res)=>{
  res.send("Hello World")
})

app.get('/about',custommiddleWare,(req,res)=>{
    res.send("IN ABOUT")
  })*/

app.listen(PORT,()=>{
    console.log(`Listening on Port ${PORT}`)
})