function topoWaves(graph){
    const inDegree={};
    for(const node of Object.keys(graph)){
        inDegree[node]=0;
    }
    for(const node of Object.keys(graph)){
        for(const n of graph[node]){
            inDegree[n]+=1;
        }
    }
    let queue=[];
    let result=[];
    for (const node of Object.keys(graph)){
        if(inDegree[node]==0){
            queue.push(node);
        }
    }
    while (queue.length>0){
        let currentWave=[...queue];
        queue=[];
        for(const node of currentWave){
            for(const n of graph[node]){
                inDegree[n]-=1;
                if(inDegree[n]==0){
                    queue.push(n);
                }
            }
        }
        result.push(currentWave);
    }
    return result;
}

module.exports={topoWaves};