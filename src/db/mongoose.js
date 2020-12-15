const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, { 
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify:false
}).then(()=>{
	console.log("DB Connection sucessful");
}).catch((err)=>{
	console.log("DB Connection error"+err);
})