const mongoose = require('mongoose');//Importing mongoose
require('mongoose-currency').loadType(mongoose);//loading the Currency type to mongoose
const Currency = mongoose.Types.Currency;//using type currency

//defining a schema with fields, their data types and any constraints
const partnerSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    image:{
        type:String,
        required:true
    },
    featured:{
        type:String
    },
    description:{
        type:String,
        required:true
    }

},{
    timestamps:true

})

//creating a model that uses the schema for the documents in 'campsites' collection 
const Partner = new mongoose.model('Partner',partnerSchema);

module.exports = Partner;//exporting the module