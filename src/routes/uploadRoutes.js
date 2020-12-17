const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const User = require('../schemas/userSchema');
const app = express();
const router = express.Router();

router.get("/images/:path", async (req, res, next) => {

    const filename = path.join(__dirname,`../../uploads/images/${req.params.path}`);
    const defaultFilename = path.join(__dirname,`../../public/images/profilePic.jpeg`);
    if(fs.existsSync(filename)){
        res.sendFile(filename);
    }else{
        if(req.params.path.includes('profilePic_')){
            var array = req.params.path.split("_");
            var userId = req.session.user._id;
            if(array.length > 2){
                userId = array[1];
            }
            const user = await User.findById(userId);
            if(user.profilePicBuffer){
                const fileContents = Buffer.from(user.profilePicBuffer, 'base64');
                fs.writeFile(filename, fileContents, (err) => {
                    if (err) {
                        console.error(err);
                        fs.unlinkSync(filename)
                    } 
                    //console.log('file saved to ', filename)
                    res.sendFile(filename);
                })
            }else{
                res.sendFile(defaultFilename);
            }
        }else if(req.params.path.includes('coverPhoto_')){
            var array = req.params.path.split("_");
            var userId = req.session.user._id;
            if(array.length > 2){
                userId = array[1];
            }
            const user = await User.findById(userId);
            if(user.profilePicBuffer){
                const fileContents = Buffer.from(user.coverPhotoBuffer, 'base64');
                fs.writeFile(filename, fileContents, (err) => {
                    if (err) {
                        console.error(err);
                        fs.unlinkSync(filename)
                    } 
                    //console.log('file saved to ', filename)
                    res.sendFile(filename);
                })
            }else{
                res.sendFile(defaultFilename);
            }
        }
    }    
})

module.exports = router;