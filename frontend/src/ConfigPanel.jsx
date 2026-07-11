function ConfigPanel({node,onUpdateConfig}){
    if (!node) return null;
    const handleChange=(key,value)=>{
        onUpdateConfig(node.id,{...node.data.config,[key]:value});
    }
    const fieldStyle = { display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#ccc' };
    const inputStyle = { display: 'block', width: '100%', marginBottom: 12, padding: 6, borderRadius: 4, border: '1px solid #ccc', boxSizing: 'border-box' };

    return (
        <div style={{height:'100%',padding:16,borderLeft:'1px solid #ddd', boxSizing:'border-box'}}>
            <div style={{fontWeight:"bold",marginBottom:16,textTransform: 'capitalize' }}>{node.type} config</div>
            {node.type=='filter' && (
                <>
                <label style={fieldStyle}>Field</label>
                <input style={inputStyle} value={node.data.config?.field || ''} onChange={(e)=>handleChange('field',e.target.value)}></input>
                <label style={fieldStyle}>Operator</label>
                <input style={inputStyle} value={node.data.config?.operator || ''} onChange={(e)=>handleChange('operator',e.target.value)}></input>
                <label style={fieldStyle}>Threshold</label>
                <input style={inputStyle} value={node.data.config?.threshold || ''} onChange={(e)=>handleChange('threshold',Number(e.target.value))}></input>
                </>
            )}

            {node.type=='slack' && (
                <>
                <label style={fieldStyle}>Webhook URL</label>
                <input style={inputStyle} value={node.data.config?.webhookUrl || ''} onChange={(e)=>handleChange('webhookUrl',e.target.value)}></input>
                <label style={fieldStyle}>Message</label>
                <input style={inputStyle} value={node.data.config?.message || ''} onChange={(e)=>handleChange('message',e.target.value)}></input>
                </>
            )} 
        </div>
    )
};

export default ConfigPanel;
