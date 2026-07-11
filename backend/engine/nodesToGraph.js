function nodesToGraph(nodes){
    const graph={};
    const validIds=new Set(nodes.map(n=>n.id));
    for(let node of nodes){
        graph[node.id]=[];
    }
    for (let node of nodes){
        for (let dep of node.dependsOn){
            if(!validIds.has(dep)){
                throw new Error(`Node ${node.id} depends on unknown Node ${dep}`);
            }
            graph[dep].push(node.id);
        }
    }
    return graph;
};

module.exports={nodesToGraph};