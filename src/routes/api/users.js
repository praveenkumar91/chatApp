const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uniqid = require('uniqid');
const User = require('../../schemas/userSchema');
const Post = require('../../schemas/PostSchema');
const Notification = require('../../schemas/NotificationsSchema');
const app = express();
const router = express.Router();

app.use(bodyParser.urlencoded({ extended: false}));

const upload = multer({ 
    dest: "uploads/",
	limits:{
		fileSize: 1000000
    },
    storage: multer.memoryStorage()
})

router.get("/", async (req, res, next) => {
    var searchObj = req.query;
    if(req.query.search !==undefined){
        searchObj = { 
            $or:[
                {firstName:{$regex: req.query.search, $options: "i"}},
                {lastName:{$regex: req.query.search, $options: "i"}},
                {username:{$regex: req.query.search, $options: "i"}}
            ]
         };
    }

    User.find(searchObj)
    .then(results => res.status(200).send(results))
    .catch(error=>{
        console.log(error);
        res.sendStatus(400);
    });

});
router.put("/:userId/follow", async (req, res, next) => {
    if(!req.params.userId){
        console.log("user id not found");
        return res.sendStatus(400);
    }

    var userId = req.params.userId;
    var user = await User.findById(userId);
    if(null==user){
        console.log("user not found");
        return res.sendStatus(400);
    }

    var isFollowing = user.followers && user.followers.includes(req.session.user._id);
    var option = isFollowing ? "$pull" : "$addToSet";
    //updating user loggged in following
    req.session.user = await User.findByIdAndUpdate(req.session.user._id,{ [option] : { following:userId }}, {new: true})
    .catch(error=>{
        console.log(error);
        res.sendStatus(400);
    });


    //updating other user followers
    User.findByIdAndUpdate(userId,{ [option] : { followers:req.session.user._id }})
    .catch(error=>{
        console.log(error);
        res.sendStatus(400);
    });

    if(!isFollowing){
        await Notification.insertNotification(userId, req.session.user._id, "follow", req.session.user._id);
    }

    res.status(201).send(req.session.user);
})


router.get("/:userId/following", async (req, res, next) => {
    if(!req.params.userId){
        console.log("user id not found");
        return res.sendStatus(400);
    }

    var userId = req.params.userId;
    User.findById(userId)
    .populate("following")
    .then(results=>{
        res.status(200).send(results);
    })
    .catch(error=>{
        console.log(error);
        res.sendStatus(400);
    });
})


router.get("/:userId/followers", async (req, res, next) => {
    if(!req.params.userId){
        console.log("user id not found");
        return res.sendStatus(400);
    }

    var userId = req.params.userId;
    User.findById(userId)
    .populate("followers")
    .then(results=>{
        res.status(200).send(results);
    })
    .catch(error=>{
        console.log(error);
        res.sendStatus(400);
    });
})


router.post("/profilePicture", upload.single("croppedImage"), async (req, res, next) => {
    if(!req.file){
        consol.log("No file uploaded with ajax request");
        return res.sendStatus(400)
    }
    
    var filePath = `/uploads/images/profilePic_${uniqid()}.png`;
    var filename = path.join(__dirname,`../../..${filePath}`);

    const fileContents = Buffer.from(req.file.buffer, 'base64');
    
    fs.writeFile(filename, fileContents, (err) => {
        if (err) {
            console.error(err);
            fs.unlinkSync(filename)
        } 
        console.log('Upload file saved to ', filename)
    })

    req.session.user = await User.findByIdAndUpdate(req.session.user._id, { profilePic: filePath, profilePicBuffer: req.file.buffer }, { new: true})
    res.sendStatus(204); 
});

router.post("/coverPhoto", upload.single("croppedImage"), async (req, res, next) => {
    if(!req.file){
        consol.log("No file uploaded with ajax request");
        return res.sendStatus(400)
    }

    var filePath = `/uploads/images/coverPhoto_${uniqid()}.png`;
    var filename = path.join(__dirname,`../../..${filePath}`);

    const fileContents = Buffer.from(req.file.buffer, 'base64');
    
    fs.writeFile(filename, fileContents, (err) => {
        if (err) {
            console.error(err);
            fs.unlinkSync(filename)
        } 
        //console.log('Upload file saved to ', filename)
    })

    req.session.user = await User.findByIdAndUpdate(req.session.user._id, { coverPhoto: filePath, coverPhotoBuffer: req.file.buffer }, { new: true})
    res.sendStatus(204); 
});

module.exports = router;
