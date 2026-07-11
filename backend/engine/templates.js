function resolveTemplate(templateStr,context){
    return templateStr.replace(/\{\{(.*?)\}\}/g,(match,path)=>{
        const steps=path.split('.');
        let value=context;
        for (const step of steps){
            value=value?.[step];
        }
        if (value===undefined) return "N/A";
        return value;
    })
}

module.exports={resolveTemplate};