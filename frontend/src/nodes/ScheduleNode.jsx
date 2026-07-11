import {Handle,Position} from '@xyflow/react';
import './nodeStyles.css';
function ScheduleNode({data}){
    return(
        <div className='custom-node'
        style={{
            padding:10,
            borderRadius:8,
            background:'#d1f7e3',
            border:'2px solid #2ecc71',
            width:120,
            textAlign: 'center'
        }}>
            <div><strong>{data.label}</strong></div>
        <Handle type='source' position={Position.Bottom}></Handle>
        </div>
    )
};
export default ScheduleNode;