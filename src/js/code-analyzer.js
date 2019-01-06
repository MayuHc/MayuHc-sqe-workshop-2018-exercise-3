import * as esprima from 'esprima';
import {generateDotScript} from './dot-generator';
import {createCfgFromCode} from './cfg-creator.js';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{ loc: true ,range: true});
};

const analyzeCode = (parsedCode, argsStr) =>{
    let argsArray = eval('[' + argsStr + ']');
    let cfgData = createCfgFromCode(parsedCode.body[0], argsArray);
    return generateDotScript(cfgData);
};

export {parseCode, analyzeCode};
