function hasCycle(graph){
    let color={};
    function dfs(node){
        color[node]='gray';
        for(const n of graph[node]){
            if (color[n]=='gray'){
                return true;
            }
            if(color[n]==='white' || color[n]==undefined){
               if (dfs(n)) return true;
            }
        }
        color[node]='black';
        return false;        
    }
    for (const d of Object.keys(graph)){
            if (!color[d]){
                if (dfs(d)) return true;
            }
        }
    return false;
}

module.exports={hasCycle};