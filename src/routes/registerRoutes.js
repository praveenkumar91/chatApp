const express = require('express');
const bodyParser = require('body-parser');
const { Schema, SchemaTypes } = require('mongoose');
const User = require('../schemas/userSchema');
const app = express();
const router = express.Router();


app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false}));

router.get("/", (req, res, next) => {
    
    res.status(200).render("register");
})

router.post("/" ,async (req, res, next) => {
   
    var body = req.body;
    var firstName = body.firstName;
    var lastName = body.lastName;
    var username = body.username;
    var email = body.email;
    var password = body.password;
        
    if(firstName && lastName && username && email && password){
        const user = await User.findUser(username);
        if(null == user){
            const newuser = new User(req.body);
            const usercreated = await newuser.save();
            req.session.user = usercreated;
            return res.redirect("/")
        }else{
            if(username === user.username){
                body.errorMessage = "Username already in use"
            }else if(email === user.email){
                body.errorMessage = "Email already in use"
            }
            res.status(200).render("register",body);
        }
    }else{
        res.status(200).render("register",body);
    }
})

module.exports = router;