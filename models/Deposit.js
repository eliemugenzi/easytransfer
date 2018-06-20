const mongoose=require('mongoose');

let DepositSchema=new mongoose.Schema({
    customer:String,
    agent:String,
    amount:Number
});

module.exports=mongoose.model('Deposit',DepositSchema);