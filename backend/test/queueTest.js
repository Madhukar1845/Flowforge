const {Queue,Worker}=require('bullmq');
const {QueueEvents}=require('bullmq');
const nodeQueue=new Queue("node-execution",{
    connection:{host:'localhost',port:6379}
});
const queueEvents=new QueueEvents("node-execution",{
    connection:{host:'localhost',port:6379}
});

const worker=new Worker("node-execution",async (job)=>{
    const {nodeId,data}=job.data;
    await new Promise(r=>setTimeout(r,2000));
    console.log(`Executing node ${nodeId} with `,data);
},{connection:{host:'localhost',port:6379}
});

async function queueWave(waveNodes){
    const jobs=[];
    for(const nodeId of waveNodes){
        const job=await nodeQueue.add("run-node",{nodeId,data:{} });
        jobs.push(job);
    }
    await Promise.all(jobs.map(job=>job.waitUntilFinished(queueEvents)));
}
async function runAllWaves(waves){
    for (const wave of waves){
        console.log("Starting Wave : ",wave);
        await queueWave(wave);
        console.log('Wave finished :',wave);
    }
}

runAllWaves([["A"],['B','C'],['D']]);