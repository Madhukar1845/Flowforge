const Redis=require("ioredis");
const redis=new Redis();

async function writeNodeOutput(runId,nodeId,data){
    await redis.hset(`run:${runId}`,`${nodeId}_output`,JSON.stringify(data));
}

async function readNodeOutput(runId,nodeId){
    const raw=await redis.hget(`run:${runId}`,`${nodeId}_output`);
    return raw? JSON.parse(raw):null;
}

module.exports={writeNodeOutput,readNodeOutput};
