import * as esgraph from 'esgraph';
import * as escodegen from 'escodegen';

function createCfgFromCode(parsedCode, argsArray){
    let graphNodes = generateNodes(parsedCode.body);
    let env = [];
    addStrArgsToEnv(env, parsedCode.params, argsArray);
    addColorsToGraph(graphNodes, env);
    return graphNodes;
}

function addColorsToGraph(nodes, env){
    addColorToNode(nodes[0], env);
}

function addColorToNode(node, env){
    if(node.type !== 'exit'){ // if it is not the exit node
        node.color = true;
        if(node.normal != null){ // if there is no branching
            let labelLines = node.label.split('\n');
            labelLines.map(line => { // if (env.indexOf(line) < 0) {
                // if (line.charAt(line.length - 1) !== ';') { // }else {env.push(line);}
                env.push(line + ';');
            });
            addColorToNode(node.normal, env);
        }
        else{
            addColorToBranching(node, env);
        }
    }
}

function addColorToBranching(node, env){
    if(eval(env.join('\n') + node.label + ';')){
        addColorToNode(node.true, env);
    }
    else{
        addColorToNode(node.false, env);
    }
}

function addStrArgsToEnv(env, args, argValues){
    for(let i=0; i<args.length; i++){
        env.push('let '+ args[i].name + ' = ' + JSON.stringify(argValues[i]) + ';');
    }
}

function generateNodes(parsedCode){
    let nodes = esgraph(parsedCode)[2];
    nodes = nodes.slice(1, nodes.length - 1);
    nodes.map((node)=>{
        delete node.exception;
        node.label = escodegen.generate(node.astNode).replace(/\n/g, '').replace(/\s/g, ' ');
        if(node.label.charAt(node.label.length - 1) === ';'){
            node.label = node.label.substring(0, node.label.length - 1);
        }
    });
    return unifyNodes(nodes);
}

function unifyNodes(nodes){
    let i = 0;
    while(i<nodes.length){
        let currNormal = nodes[i].normal;
        if(currNormal != null && currNormal.normal != null && currNormal.prev.length === 1){ // if the normal is not "if" or "while" - unify
            nodes[i].label += '\n' + currNormal.label;
            let indexToRemove = nodes.indexOf(currNormal);
            nodes.splice(indexToRemove, 1);
            nodes[i].normal = currNormal.normal;
        }
        else{
            i++;
        }
    }
    return nodes;
}

export {createCfgFromCode,addStrArgsToEnv, generateNodes};
