const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({

    userTo:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
    },
    userFrom:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
    },
	notificationType: {
		type: String,
		trim: true
	},
    opened: { 
        type: Boolean, 
        default: false
    },
    entityId: mongoose.Schema.Types.ObjectId
},{
    timestamps:true
});

notificationSchema.statics.insertNotification = async (userTo, userFrom, notificationType, entityId)=>{
    var data = {
        userTo: userTo,
        userFrom: userFrom,
        notificationType: notificationType,
        entityId: entityId
    };

    await Notification.deleteOne(data)
    .catch(error=>{
        console.log(error);
    });

    return Notification.create(data)
    .catch(error=>{
        console.log(error);
    });
}

const Notification = mongoose.model('Notification',notificationSchema)

module.exports = Notification;