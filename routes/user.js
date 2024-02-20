const express=require('express')
const router=express.Router()
const mongoose=require('mongoose')
const Post=mongoose.model("Post")
const requireLogin=require(`../middleware/requireLogin`)

const User=mongoose.model("User")

router.get('/user/:id',async(req,res)=>{
    console.log(req.params)
    try{User.findOne({_id:req.params.id})
    .select("-password")
    .then(user=>{
        Post.find({postedBy:req.params.id})
        .populate("postedBy","_id name")
        .exec()
        .then(posts=>{
            res.json({user,posts})
        })
    })
}
    catch(err){
        res.status(422).json({error:err})
    } 
})

router.put('/follow', requireLogin, async (req, res) => {
    try {
        const { followId } = req.body;
        // Update the user with followId to add current user's ID to their followers array
        const updatedFollowedUser = await User.findByIdAndUpdate(
            followId,
            { $push: { followers: req.user._id } },
            { new: true }
        );
        // Update the current user to add followId to their following array
        const updatedCurrentUser = await User.findByIdAndUpdate(
            req.user._id,
            { $push: { following: followId } },
            { new: true }
        ).select("-password");
        res.json({ followedUser: updatedFollowedUser, currentUser: updatedCurrentUser });
    } catch (err) {
        res.status(422).json({ error: err });
    }
});


router.put('/unfollow',requireLogin,async(req,res)=>{
    try{
        const {unfollowId}=req.body
        const updatedFollowedUser = await User.findByIdAndUpdate(
            unfollowId,
            { $pull: { followers: req.user._id } },
            { new: true }
        );
        // Update the current user to add followId to their following array
        const updatedCurrentUser = await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { following: unfollowId } },
            { new: true }
        ).select("-password");
        res.json({ unfollowedUser: updatedFollowedUser, currentUser: updatedCurrentUser });
    }
    
   
catch (err) {
    res.status(422).json({ error: err });
}
});


router.put('/updatePic',requireLogin,(req,res)=>{
    console.log("Image"+req.body.pic)
    User.findByIdAndUpdate(req.user._id,{
        $set:{pic:req.body.pic},
          },
          {
            new:true,
          }).exec()
          .then(result=>{
            console.log(result)
            res.json(result)
            
          })
          .catch(err=>res.status(422).json({error:err}))
})

 




module.exports=router