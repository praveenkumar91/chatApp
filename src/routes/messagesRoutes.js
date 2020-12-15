const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('../schemas/userSchema');
const Chat = require('../schemas/ChatSchema');
const app = express();
const router = express.Router();

router.get("/", (req, res, next) => {

    var payload = {
        pageTitle: "Inbox",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }
    
    res.status(200).render("inboxPage", payload);
})

router.get("/new", (req, res, next) => {

    var payload = {
        pageTitle: "New message",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }
    
    res.status(200).render("newMessage", payload);
})

router.get("/:chatId", async (req, res, next) => {

    var userId = req.session.user._id;
    var chatId = req.params.chatId;

    var isValidId = mongoose.isValidObjectId(chatId);

    var payload = {
        pageTitle: "Chat",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }

    if(!isValidId){
        payload.errorMessage = "Chat does not exist or you do dont have permission to view it."; 
        return res.status(200).render("chatPage", payload);
    }

    var chat = await Chat.findOne({_id:chatId, users: { $elemMatch:{ $eq: userId }}})
    .populate("users");

    if(chat==null){
        var userFound = await User.findById(chatId);
        if(userFound!=null){
            chat = await getChatByUserId(userFound._id, userId)
        }
    }

    if(chat==null){
        payload.errorMessage = "Chat does not exist or you do dont have permission to view it."; 

    }else{
        payload.chat = chat;
    }
    
    res.status(200).render("chatPage", payload);
})

function getChatByUserId(userLoggedInId, OtherUserId){
    return Chat.findOneAndUpdate({
        isGroupChat: false,
        users:{
            $size: 2,
            $all: [
                { $elemMatch:{ $eq: mongoose.Types.ObjectId(userLoggedInId) }},
                { $elemMatch:{ $eq: mongoose.Types.ObjectId(OtherUserId) }},
            ]
        }
    },
    {
        $setOnInsert: {
            users:[userLoggedInId, OtherUserId]
        }
    },
    {
        new: true,
        upsert: true
    })
    .populate("users");
}
 
module.exports = router;