const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//we are pointing the fields of the documents in favorite collection to users and campsites collection
//favorite field contains array of campsite id's
const favoriteSchema = new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    favorite:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Campsite'
    }]
},{
    timestamps:true
})

const Favorite = new mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;//exporting the model