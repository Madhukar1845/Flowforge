const {hasCycle}=require('./hasCycle');
const {topoWaves}=require('./topoWaves');

function compile(graph){
    if(hasCycle(graph)){
        return {valid:false,error:'Workflow contains a cycle'};
    }
    return {valid:true,waves:topoWaves(graph)};
}

module.exports={compile};
