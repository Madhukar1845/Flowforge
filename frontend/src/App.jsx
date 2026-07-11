import { useState,useCallback } from "react";
import { ReactFlow, addEdge, Background, Controls, applyNodeChanges, applyEdgeChanges, Position } from '@xyflow/react';
import { useReactFlow } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import HttpNode from "./nodes/HttpNode";
import FilterNode from "./nodes/FilterNode";
import SlackNode from "./nodes/SlackNode";
import ScheduleNode from "./nodes/ScheduleNode";
import Sidebar from "./Sidebar";
import ConfigPanel from "./ConfigPanel";
import { ReactFlowProvider } from "@xyflow/react";

const nodeTypes={
  schedule:ScheduleNode,
  http:HttpNode,
  filter:FilterNode,
  slack:SlackNode
};

const initialNodes=[];

function FlowCanvas(){
const {screenToFlowPosition}=useReactFlow();
const [nodes,setNodes]=useState(initialNodes);
const [edges,setEdges]=useState([]);
const [workflowId,setWorkflowId]=useState(null);
const onNodesChange=useCallback((changes)=>setNodes((nds)=>applyNodeChanges(changes,nds)),[]);
const onEdgesChange=useCallback((changes)=>setEdges((eds)=>applyEdgeChanges(changes,eds)),[]);
const onConnect=useCallback((params)=>setEdges((eds)=>addEdge(params,eds)),[]);
const [selectedNode,setSelectedNode]=useState(null);
const [isSaving,setIsSaving]=useState(false);
const [isRunning,setIsRunning]=useState(false);
const [statusMessage,setStatusMessage]=useState(null);

const API_URL='http://localhost:3000';
const onUpdateConfig=useCallback((nodeId,newConfig)=>{
  setNodes((nds)=>
    nds.map((n)=>
      n.id==nodeId?{...n,data:{...n.data,config:newConfig}}:n
  )
);
setSelectedNode((sn)=>sn && sn.id==nodeId?{...sn,data:{...sn.data,config:newConfig}}:sn)
},[]);

const onNodeClick=useCallback((event,node)=>{
  setSelectedNode(node);
},[]);

const onDragOver=useCallback((event)=>{
  event.preventDefault();
  event.dataTransfer.dropEffect='move';
},[]);

const onDrop=useCallback((event)=>{
  event.preventDefault();
  const type=event.dataTransfer.getData('application/reactflow');
  const position=screenToFlowPosition({x:event.clientX,y:event.clientY});
  const newNode={
    id:`${+new Date()}`,
    type,
    position,
    data:{label:type}
  };
  setNodes((nds)=>nds.concat(newNode));
},[screenToFlowPosition])

function buildBackendNodes(nodes,edges){
  return nodes.map((n)=>{
    const dependsOn=edges.filter((e)=>e.target==n.id).map((e)=>e.source);
    return{
      id:n.id,
      type:n.type,
      config:n.data.config || {},
      dependsOn
    };
  })  
}

const onSave=useCallback(async ()=>{
  setIsSaving(true);
  setStatusMessage(null);
  try{
  const backendNodes=buildBackendNodes(nodes,edges);
  const response=await fetch(`${API_URL}/workflows`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({nodes:backendNodes})
  });
  const data=await response.json();
  if(!response.ok){
    setStatusMessage({type:'error',text:`Save failed:${data.error}`});
    return ;
  }
  setWorkflowId(data.workflowId);
  setStatusMessage( {type:'success',text:`Saved! Workflow ID:${data.workflowId}`});
}catch(err){
  setStatusMessage({type:'error',text:`Save failed:${err.message}`})
}finally{
  setIsSaving(false);
}
},[nodes,edges]
);

const onRun=useCallback(async()=>{

  if(!workflowId){
    setStatusMessage({type:'error',text:`Save the Workflow first!`});
    return;
  }
  setIsRunning(true);
  setStatusMessage(null);
  try{
  const response=await fetch(`${API_URL}/workflows/${workflowId}/run`,{
    method:'POST'
  });
  const data=await response.json();
  setStatusMessage({
    type:data.success?'success' : 'error',
    text:`Run complete. Success:${data.success}. Failures:${JSON.stringify(data.failures)}`
  })
}catch(err){
  setStatusMessage({type:'error',text:`Run failed:${err.message}`})
}finally{
  setIsRunning(false);
}
},[workflowId]);


return (
  <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>

    {/* LEFT: fixed width */}
    <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid #333', boxSizing: 'border-box' }}>
      <Sidebar />
      <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid #333' }}>
        <button onClick={onSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>
        <button onClick={onRun} disabled={isRunning}>{isRunning ? 'Running...' : 'Run'}</button>
        {statusMessage && (
          <span style={{ color: statusMessage.type === 'error' ? '#e74c3c' : '#2ecc71', fontSize: 12 }}>
            {statusMessage.text}
          </span>
        )}
      </div>
    </div>

    {/* MIDDLE: fills remaining space */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <ReactFlow
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>

    {/* RIGHT: fixed width */}
    <div style={{ width: 280, flexShrink: 0, borderLeft: '1px solid #333', boxSizing: 'border-box' }}>
      <ConfigPanel node={selectedNode} onUpdateConfig={onUpdateConfig} />
    </div>

  </div>
);
}

function App(){
  return (
    <ReactFlowProvider>
      <FlowCanvas/>
    </ReactFlowProvider>
  )
}

export default App;
