const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true,
		trim: true
	},
	lastName: {
		type: String,
		required: true,
		trim: true
    },
    username: {
		type: String,
		required: true,
        trim: true,
        unique: true,
	},
	email:{
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		unique: true,
		validate(value){
			if(!validator.isEmail(value)){
				throw new Error('Email is invalid');  
			}
		}
		
	},
	password:{
		type: String,
		required: true,
		trim: true,
		minlength: 2,
		validate(value){
			if(validator.contains(value.toLowerCase(),'password')){
				throw new Error('Password can not have string password');  
			}
		}
		
	},
	profilePic:{
        type: String,
        default: "/images/profilePic.jpeg"
	},
	coverPhoto:{
        type: String
	},
	likes:[{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Post'
	}],
	retweets:[{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Post'
	}],
	following: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}],
	followers: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}],
	profilePicBuffer:{
		type: Buffer
	},
	coverPhotoBuffer:{
		type: Buffer
	}

},{
	timestamps:true
});

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject();
    delete userObject.profilePicBuffer;
    delete userObject.coverPhotoBuffer;
    return userObject;
}

userSchema.statics.findByCredentials = async (username, password)=>{
	
	const user = await User.findOne({
		$or:[
			{username:username},
			{email:username}
		]
	});
	
	if(!user){
		throw new Error('Unable to login');
	}
	
	const isMatch = await bcrypt.compare(password,user.password);
	
	if(!isMatch){
		throw new Error('Unable to login');
	}
	
	return user;
}

userSchema.statics.findUser = async (username)=>{
	const user = await User.findOne({username});
	return user;
}

//hash the plain pwd before saving
userSchema.pre('save',async function(next){
	const user = this;
	if(user.isModified('password')){
		user.password = await bcrypt.hash(user.password,8);
	}
	next();
});

const User = mongoose.model('User',userSchema)

module.exports = User;