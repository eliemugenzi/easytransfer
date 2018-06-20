const mongoose=require('mongoose');

let TransferSchema=new mongoose.Schema({
    from:String,
    to:String,
    amount:Number
});

module.exports=mongoose.model('Transfer',TransferSchema);
