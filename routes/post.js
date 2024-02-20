const express=require('express')
const router=express.Router()
const mongoose=require('mongoose')
const Post=mongoose.model("Post")
const requireLogin=require(`../middleware/requireLogin`)


router.get('/allPosts',(req,res)=>{
    Post.find()
    .populate("postedBy","_id name")   //To get id and name only
    .populate("comments.postedBy","_id name")
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.get('/subscribedPosts',requireLogin,(req,res)=>{
    Post.find({postedBy:{$in:req.user.following}}) //if postedBy in following
    .populate("postedBy","_id name")   //To get id and name only
    .populate("comments.postedBy","_id name")
    .then(posts=>{
        res.json({posts})
        console.log(posts)
    })
    .catch(err=>{
        console.log(err)
    })
})


router.get('/myPosts',requireLogin,(req,res)=>{
    Post.find({postedBy: req.user._id})
    .populate("postedBy","_id name")
    .then(post=>{
        res.json({post})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.post('/createPost',requireLogin,(req,res)=>{
    const {title,body,pic}=req.body
    console.log(title)
    console.log(body)
    console.log(pic)
    if(!title || !body || !pic){
      return  res.status(422).json("Please provide all the fields")
    }
  //  console.log(req.user)
   // res.send("OK")
   req.user.password=undefined
   const post=new Post({
    title:title,
    body:body,
    photo: pic,
    postedBy:req.user
   })

   post.save().then(result=>{
    res.json({post:result})
   })
   .catch(err=>{
    console.log(err)
   })
})

router.put('/like',requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,
    {
         $push:{likes:req.user._id}
    },{
        new:true,
    })
    .exec((result,err,)=>{
        if(err){
           return res.status(422).json({error:err})
        }
        else{
           res.json(result)
        }
    })

})

router.put('/unlike',requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,
    {
         $pull:{likes:req.user._id}
    },{
        new:true,
    })
    .exec((err,result)=>{
        if(err){
           return res.status(422).json({error:err})
        }
        else{
           res.json(result)
        }
    })

})

router.post('/comment',requireLogin,(req,res)=>{
    const comment={
        text:req.body.text,
        postedBy:req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId,
        {
             $push:{comments:comment}
        },{
            new:true,
        })
        .populate("comments.postedBy","_id name")
        .exec()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            res.status(422).json({error: err});
        });
    

})

router.delete('/deletePost/:postId', requireLogin, (req, res) => {
    Post.findOne({ _id: req.param.postId })
        .populate("postedBy", "_id")
        .exec()
        .then(post => {
            if (!post) {
                return res.status(422).json({ error: "Post not found" });
            }
            if (post.postedBy._id.toString() !== req.user._id.toString()) {
                return res.status(401).json({ error: "Unauthorized access" });
            }
            // If the user is the owner of the post, proceed to delete it
            post.remove()
                .then(result => {
                    res.json(result);
                })
                .catch(err => {
                    res.status(500).json({ error: "Error deleting post", details: err });
                });
        })
        .catch(err => {
            res.status(500).json({ error: "Error finding post", details: err });
        });
});


module.exports=router