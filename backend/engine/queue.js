const {Queue,Worker,QueueEvents}=require('bullmq');
const {executors}=require('./executors');
const nodeQueue=new Queue("node-execution",{
    connection:{host:'localhost',port:6379}
});
const queueEvents=new QueueEvents("node-execution",{
    connection:{host:'localhost',port:6379}
});

const worker=new Worker("node-execution",async (job)=>{
    const {node,runId}=job.data;
    const executorFn=executors[node.type];
    if(!executorFn){
        throw new Error(`No executor found for type: ${node.type}`);
    }
    await executorFn(node,runId);
},{connection:{host:'localhost',port:6379}
});

async function queueWave(waveNodeIds,allNodes,runId){
    const jobs=[];
    for(const nodeId of waveNodeIds){
        const node=allNodes.find(n=>n.id===nodeId);
        const job=await nodeQueue.add("run-node",{node,runId});
        jobs.push({nodeId,job})

    }
    const results=await Promise.allSettled(jobs.map(({job})=>job.waitUntilFinished(queueEvents)));
    const failures=[];
    results.forEach((result,i) => {
        if(result.status==="rejected"){
            failures.push({nodeId:jobs[i].nodeId,error:result.reason})
        }
    });
    return {failures};
}
async function runAllWaves(waves,allNodes,runId){
    const allFailures=[];
    for (const wave of waves){
        const {failures}=await queueWave(wave,allNodes,runId); 
        allFailures.push(...failures)
    }
    return {success:allFailures.length===0, failures:allFailures};
}

module.exports={runAllWaves,queueWave};