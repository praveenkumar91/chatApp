const express = require('express');
require('./src/db/mongoose');
const app = express();
const port = process.env.PORT;
const middleware = require('./middleware')
const path = require('path')
const bodyParser = require('body-parser');
const session = require('express-session');

const server = app.listen(port, () => console.log("Server listening on port " + port));
const io = require('socket.io')(server, { pingTimeout: 60000 });

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret:"praveen",
    resave: true,
    saveUninitialized: false
}))
 
// Routes
const loginRoute = require('./src/routes/loginRoutes');
const registerRoute = require('./src/routes/registerRoutes');
const logutRoute = require('./src/routes/logoutRoutes');
const postRoute = require('./src/routes/postRoutes');
const profileRoute = require('./src/routes/profileRoutes');
const uploadsRoute = require('./src/routes/uploadRoutes');
const searchRoute = require('./src/routes/searchRoutes');
const messageRoute = require('./src/routes/messagesRoutes');
const notificationsRoute = require('./src/routes/notificationsRoutes');
 
//api routes 
const postApiRoute = require('./src/routes/api/posts');
const userApiRoute = require('./src/routes/api/users');
const chatApiRoute = require('./src/routes/api/chats');
const messageApiRoute = require('./src/routes/api/messages');
const notificationApiRoute = require('./src/routes/api/notifications');

app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logutRoute);
app.use("/posts",middleware.requireLogin, postRoute);
app.use("/profile",middleware.requireLogin, profileRoute);
app.use("/uploads", uploadsRoute);
app.use("/search",middleware.requireLogin, searchRoute);
app.use("/messages",middleware.requireLogin, messageRoute);
app.use("/notifications",middleware.requireLogin, notificationsRoute);

app.use("/api/posts", postApiRoute);
app.use("/api/users", userApiRoute);
app.use("/api/chats", chatApiRoute);
app.use("/api/messages", messageApiRoute);
app.use("/api/notifications", notificationApiRoute);


app.get("/", middleware.requireLogin, (req, res, next) => {

    var payload = {
        pageTitle: "Home",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
    }

    res.status(200).render("home", payload);
})

io.on("connection",(socket)=>{
    
    socket.on('setup', userData => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on('join room', room => {
        socket.join(room);
    });

    socket.on('typing', room => {
        socket.in(room).emit("typing");
    });

    socket.on('stop typing', room => {
        socket.in(room).emit("stop typing");
    });

    socket.on('new message', newMessage => {
        var chat = newMessage.chat;
        if(!chat.users) return console.log("Chat.users not defined");

        chat.users.forEach(user => {
            if(user._id == newMessage.sender._id) return;
            socket.in(user._id).emit("message received", newMessage);
        });
    });
    
    socket.on('notification received', room => {
        socket.in(room).emit("notification received");
    });

})