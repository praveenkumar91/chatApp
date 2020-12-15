const express = require('express');
const bodyParser = require('body-parser');
const User = require('../schemas/userSchema');
const app = express();
const router = express.Router();

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false}));

router.get("/", (req, res, next) => {
    
    res.status(200).render("login");
})

router.post("/", async (req, res, next) => {
    var body = req.body;
    try{
        const user = await User.findByCredentials(body.logUsername,body.logPassword);
        if(null!=user){
            req.session.user = user;
            return res.redirect("/")
        }
    }catch(err){
        body.errorMessage = err.message;
        res.status(200).render("login",body);
    }
    
   
})

module.exports = router;