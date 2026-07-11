import { Handle,Position } from "@xyflow/react";
import './nodeStyles.css';
function FilterNode({data}){
    return (
        <div className="custom-node" style={{
            padding: 10,
            borderRadius: 8,
            background: '#ffe6cc',
            border: '2px solid #e67e22',
            minWidth: 120,
            textAlign: 'center'
        }}>
        <Handle type='target' position={Position.Top}></Handle>
        <div><strong>{data.label}</strong></div>
        <Handle type='source' position={Position.Bottom}></Handle>
        </div>
    )
}

export default FilterNode;