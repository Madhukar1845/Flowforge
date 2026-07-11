const mongoose=require('mongoose');

const runSchema=new mongoose.Schema({
    workflowId:{type:String,required:true},
    runId:{type:String,required:true,unique:true},
    success:{type:Boolean,required:true},
    failures:{type:Array,default:[]},
    createdAt:{type:Date,default:Date.now}
})

module.exports=mongoose.model('Run',runSchema);