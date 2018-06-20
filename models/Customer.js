const mongoose=require('mongoose');

let CustomerSchema=new mongoose.Schema({
    names:String,
    email:String,
    password:String,
    amount:{
        type:Number,
        default:0
    }
});

module.exports=mongoose.model('Customer',CustomerSchema);