import { Handle,Position } from "@xyflow/react";
import './nodeStyles.css';
function HttpNode({data}){
    return (
        <div className="custom-node" style={{
            padding: 10,
            borderRadius: 8,
            background: '#d6e9ff',
            border: '2px solid #3498db',
            minWidth: 120,
            textAlign: 'center'
        }}>
            <Handle type="target" position={Position.Top}></Handle>
            <div><strong>{data.label}</strong></div>
            <Handle type="source" position={Position.Bottom}></Handle>
        </div>
    )
}
export default HttpNode;