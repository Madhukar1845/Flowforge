import {Handle,Position} from "@xyflow/react";
import './nodeStyles.css';
function SlackNode({data}){
    return (
        <div className="custom-node"
        style={{
            padding: 10,
            borderRadius: 8,
            background: '#e6d9f7',
            border: '2px solid #9b59b6',
            minWidth: 120,
            textAlign: 'center'
        }}>
            <Handle type="target" position={Position.Top}></Handle>
            <div><strong>{data.label}</strong></div>
            <Handle type="source" position={Position.Bottom}></Handle>
        </div>
    )
}
export default SlackNode;