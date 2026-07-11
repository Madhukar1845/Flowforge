const express=require('express');
const dotenv=require('dotenv');
const {nodesToGraph}=require('../engine/nodesToGraph');
const {runAllWaves}=require('../engine/queue');
const {compile}=require('../engine/compile');
const {randomUUID}=require('crypto');
const connectDB=require("./db");
const Workflow=require('../models/Workflow');
const Run=require('../models/Run');
const cors=require('cors');
const app=express();

dotenv.config();
const workflows={};
app.use(express.json());
app.use(cors());
connectDB();
app.get('/',(req,res)=>{
    res.send(`Server is running on PORT ${process.env.PORT}`);
});


app.post('/workflows',async(req,res)=>{
    const {nodes}=req.body;
    const graph=nodesToGraph(nodes);
    const {valid,error}= compile(graph);
    if(!valid){
        return res.status(400).json({error})
    }
    const workflow=await Workflow.create({nodes});
    res.status(201).json({workflowId:workflow._id});
});

app.post('/workflows/:id/run',async(req,res)=>{
    const workflow=await Workflow.findById(req.params.id);
    if(!workflow){
        return res.status(404).json({error:'Workflow Not Found'});
    }
    const graph=nodesToGraph(workflow.nodes);
    const {waves}=compile(graph);
    const runId=randomUUID();
    const result=await runAllWaves(waves,workflow.nodes,runId);
    const savedResult=await Run.create({workflowId:workflow._id,runId,...result});
    console.log("Saved run:", savedResult);
    res.json({runId,...result});
});

app.get('/runs/:runId',async(req,res)=>{
    const run=await Run.findOne({runId:req.params.runId});
    if(!run){
        return res.status(404).json({error:"Run not found"})
    }
    res.json(run);
})

app.listen(process.env.PORT || 3000,()=>{
    console.log('Server is Running.')
});

