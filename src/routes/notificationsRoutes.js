const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('../schemas/userSchema');
const Chat = require('../schemas/ChatSchema');
const app = express();
const router = express.Router();

router.get("/", (req, res, next) => {

    var payload = {
        pageTitle: "NotificationsPage",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }
    
    res.status(200).render("notificationsPage", payload);
})


 
module.exports = router;