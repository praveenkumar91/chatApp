const express = require('express');
const bodyParser = require('body-parser');
const User = require('../../schemas/userSchema');
const Post = require('../../schemas/PostSchema');
const Chat = require('../../schemas/ChatSchema');
const Message = require('../../schemas/MessageSchema');
const Notification = require('../../schemas/NotificationsSchema');
const app = express();
const router = express.Router();

app.use(bodyParser.urlencoded({ extended: false}));

router.post("/", async (req, res, next) => {
    if (!req.body.content || !req.body.chatId) {
        console.log("invalid data passed with request");
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.session.user._id,
        content: req.body.content,
        chat: req.body.chatId
    }

    Message.create(newMessage)
    .then(async message => {
        message = await message.populate("sender").execPopulate();
        message = await message.populate("chat").execPopulate();
        message = await User.populate(message, { path: "chat.users" });

        var chat=  await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message }).catch(error => console.log(error));

        insertNotification(chat, message);

        res.status(201).send(message);
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

});

function insertNotification(chat, message){

    chat.users.forEach(userId =>{
        if(userId == message.sender._id.toString()) return;

        Notification.insertNotification(userId, message.sender._id, "newMessage", message.chat._id);
    });
}


router.get("/", async (req, res, next) => {
    Chat.find({
        users: {
            $elemMatch:{
                $eq: req.session.user._id
            }
    }})
    .populate("users")
    .populate("latestMessage")
    .sort({ updatedAt: -1})
    .then(async results => {
        results = await User.populate(results,{path:"latestMessage.sender"})
        res.status(200).send(results)
    })
    .catch(error=>{
        console.log(error);
        res.sendStatus(400);
    });
});

module.exports = router;