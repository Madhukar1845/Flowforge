const {readNodeOutput,writeNodeOutput}=require('./context');
const {resolveTemplate}=require('./templates');
const executors={
    filter:async(node,runId)=>{
        const parentId=node.dependsOn[0];
        const parentData= await readNodeOutput(runId,parentId);
        const operators={
            ">" :(a,b)=> a>b,
            "<" :(a,b)=> a<b,
            ">=":(a,b)=> a>=b,
            '<=':(a,b)=> a<=b,
            '==':(a,b)=> a===b
        }
        const compareFn=operators[node.config.operator];
        const field=node.config.field;
        const filtered=parentData.products.filter(item=>compareFn(item[field],node.config.threshold));
        await writeNodeOutput(runId,node.id,{filteredProducts:filtered});
    },
    http:async(node,runId)=>{
        const fakeProducts=[
            {id:1,name:'WidgetA',price:30},
            {id:2,name:'WidgetB',price:30},
            {id:3,name:'WidgetC',price:30},
        ]
        await writeNodeOutput(runId,node.id,{products:fakeProducts})
    },
    schedule:async(node,runId)=>{
        await writeNodeOutput(runId,node.id,{triggeredAt:new Date().toISOString()});
    },
    slack:async(node,runId)=>{
        const parentId=node.dependsOn[0];
        const parentData=await readNodeOutput(runId,parentId);
        const message=resolveTemplate(node.config.message,parentData);
        const response=await fetch(node.config.webhookUrl,{
            method:'POST',
            headers:{"Content-Type":'application/json'},
            body:JSON.stringify({text:message})
        })
        if(!response.ok){
            throw new Error('Slack webhook failed:',response.status);
        }
        await writeNodeOutput(runId,node.id,{sent:true,message})
    }

};
module.exports={executors};