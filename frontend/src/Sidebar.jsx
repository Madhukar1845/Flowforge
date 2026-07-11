const nodeTypeList=[
    {type:'schedule', label:'Schedule', color:'#2ecc71'},
    {type:'http', label:'HTTP', color:'#3498db'},
    {type:'filter', label:'Filter', color:'#e67e22'},
    {type:'slack', label:'Slack', color:'#9b59b6'}
];

function Sidebar() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div style={{ padding: '10px', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 10, fontWeight: 'bold', color: '#ccc' }}>Node types</div>
      {nodeTypeList.map((n) => (
        <div
          key={n.type}
          draggable
          onDragStart={(event) => onDragStart(event, n.type)}
          style={{
            padding: 8,
            marginBottom: 8,
            borderRadius: 6,
            border: `2px solid ${n.color}`,
            cursor: 'grab',
            textAlign: 'center',
            color: '#ccc',
            boxSizing: 'border-box',
          }}
        >
          {n.label}
        </div>
      ))}
    </div>
  );
}

export default Sidebar;