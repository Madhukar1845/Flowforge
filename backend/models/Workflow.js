const mongoose=require('mongoose');

const workflowSchema=new mongoose.Schema({
    nodes:{type:Array,required:true},
    createdAt:{type:Date,default:Date.now}
});

module.exports=mongoose.model("Workflow",workflowSchema);