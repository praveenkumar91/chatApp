const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const User = require('../schemas/userSchema');
const app = express();
const router = express.Router();

router.get("/images/:path", async (req, res, next) => {

    const filename = path.join(__dirname,`../../uploads/images/${req.params.path}`);
    if(fs.existsSync(filename)){
        res.sendFile(filename);
    }else{
        if(req.params.path.includes('profilePic_')){
            var userId = req.session.user._id;
            const user = await User.findById(userId);
            const fileContents = Buffer.from(user.profilePicBuffer, 'base64');
            fs.writeFile(filename, fileContents, (err) => {
                if (err) {
                    console.error(err);
                    fs.unlinkSync(filename)
                } 
                //console.log('file saved to ', filename)
                res.sendFile(filename);
            })
        }else if(req.params.path.includes('coverPhoto_')){
            var userId = req.session.user._id;
            const user = await User.findById(userId);
            const fileContents = Buffer.from(user.coverPhotoBuffer, 'base64');
            fs.writeFile(filename, fileContents, (err) => {
                if (err) {
                    console.error(err);
                    fs.unlinkSync(filename)
                } 
                //console.log('file saved to ', filename)
                res.sendFile(filename);
            })
        }
    }    
})

module.exports = router;