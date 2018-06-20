const mongoose=require('mongoose');

let AgentSchema=new mongoose.Schema({
    names:String,
    email:String,
    password:String
});

module.exports=mongoose.model('Agent',AgentSchema);