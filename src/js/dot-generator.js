

function generateDotScript(nodes){
    let nodesScript = generateDotNodes(nodes);
    let edgesScript = generateDotEdges(nodes);
    return nodesScript + '\n' + edgesScript;
}

function generateDotNodes(cfgNodes){
    let script = '';
    for(let i=0; i<cfgNodes.length; i++){
        let currNode = cfgNodes[i];
        let nodeStr = 'n' + i + ' [label= "   -' + (i+1) + '-\n' + (currNode.label) + '"';
        let shape = 'rectangle';
        if(currNode.true && currNode.false){ // maybe ||, what happens when if without else
            shape = 'diamond';
        }
        nodeStr += ', shape=' + shape;
        if(currNode.color != null){
            nodeStr += ' style=filled fillcolor=green';
        }
        nodeStr += ']\n';
        script += nodeStr;
    }
    return script;
}

function generateDotEdges(cfgNodes){
    let script = '';
    for(let i=0; i<cfgNodes.length; i++){
        let currNode = cfgNodes[i];
        if(hasNormalEdge(currNode.normal)){
            script += generateEdgeStr(i,cfgNodes.indexOf(currNode.normal),'[]');
        }
        if(hasTrueEdge(currNode.true)){
            script += generateEdgeStr(i,cfgNodes.indexOf(currNode.true), '[label="T"]');
        }
        if(hasFalseEdge(currNode.false)){
            script += generateEdgeStr(i,cfgNodes.indexOf(currNode.false), '[label="F"]');
        }
    }
    return script;
}

function hasNormalEdge(currNormal){
    return currNormal && currNormal.type !== 'exit';
}

function hasFalseEdge(currFalse){
    return currFalse && currFalse.type !== 'exit';
}

function hasTrueEdge(currTrue){
    return currTrue && currTrue.type !== 'exit';
}

function generateEdgeStr(from, to, label){
    return 'n' + from + ' -> n' + to + ' '+ label +'\n';
}

export {generateDotScript, generateDotNodes, generateDotEdges};