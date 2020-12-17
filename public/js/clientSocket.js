var connected = false;

const socket = io()

socket.emit("setup",userLoggedIn._id);

socket.on("connected",()=>{
    connected = true;
})

socket.on("message received",(newMessage)=>{
        messageReceived(newMessage);
})

socket.on("notification received",()=>{
   $.get("/api/notifications/latest",(notificationData)=>{
       showNotificationPopup(notificationData);
       refreshNotificationsBadge();
   })
})


function emitNotification(userId){
    if(userId == userLoggedIn._id) return;
 
    socket.emit("notification received",userId);

}