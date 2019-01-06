import assert from 'assert';
import {parseCode, analyzeCode} from '../src/js/code-analyzer';
import {generateDotNodes, generateDotEdges} from '../src/js/dot-generator';
import {createCfgFromCode, addStrArgsToEnv, generateNodes} from '../src/js/cfg-creator';

//------------------------------------- Test dot-generator-------------------------------------------------------------

describe('Test dot-generator 1', () => {
    it('Test function generateDotNodes', () => {
        let code = 'function foo(x, y){\n' + 'let a = x + 1;\n' +
        'if (x < y) {\n' + 'return c;\n' + '}\n' +'}';
        assert.deepEqual(generateDotNodes(createCfgFromCode(parseCode(code).body[0], '1,2')), 'n0 [label= "   -1-\n' +
            'let a = x + 1", shape=rectangle style=filled fillcolor=green]\n' +
            'n1 [label= "   -2-\n' + 'x < y", shape=diamond style=filled fillcolor=green]\n' +
            'n2 [label= "   -3-\n' + 'return c", shape=rectangle]\n');
    });
});

describe('Test dot-generator 2', () => {
    it('Test function generateDotEdges', () => {
        let code = 'function foo(x, y){\n' + 'let a = x + 1;\n' +
            'if (x < y) {\n' + 'return c;\n' + '}\n' +'}';
        assert.deepEqual(generateDotEdges(createCfgFromCode(parseCode(code).body[0], '1,2')), 'n0 -> n1 []\nn1 -> n2 [label="T"]\n');
    });
});

describe('Test dot-generator 3', () => {
    it('Test function generateDotEdges2', () => {
        let code = 'function foo(x, y, z){\n' +
            'while (x + 1 > z) {\n' +
            'z = (x + 1 + x + 1 + y) * 2;\n' +
            '}\n' +
            'return z;\n'+
            '}\n';
        assert.deepEqual(generateDotEdges(createCfgFromCode(parseCode(code).body[0], '1,2,3')), 'n0 -> n1 [label="T"]\nn0 -> n2 [label="F"]\nn1 -> n0 []\n');
    });
});



//---------------------------------------- Test cfg-creator ------------------------------------------------------------

describe('Test addStrArgsToEnv', () => {
    it('Test function addStrArgsToEnv - adds array correctly', () => {
        let args = eval('[1,[1,2,7],5]');
        let env = [];
        addStrArgsToEnv(env, [{name:'x'},{name: 'y'},{name: 'z'}], args);
        assert.deepEqual(env, ['let x = 1;', 'let y = [1,2,7];',  'let z = 5;']);
    });
});

describe('Test generateNodes', () => {
    it('Test function generateNodes', () => {
        let code =
            'function foo(x, y, z){\n' +
            'let a = x + 1;\n' +
            'let b = y + m;\n' +
            'if (b == z[2]){\n' +
            'return x + y + z[0];\n' +
            '}else if (b > a * 2){\n' +
            'return x + y + m;\n' +
            '}\n' +
            '}\n';
        assert.deepEqual(generateNodes(parseCode(code).body[0].body).length, 5);
    });
});

describe('Full flow test - sample 1 from the class', () => {
    it('Test while', () => {
        let code = 'function foo(x, y, z){\n' + 'let a = x + 1;\n' + 'let b = a + y;\n' + 'let c = 0;\n' +
            'while (a < z) {\n' + 'c = a + b;\n' + 'a++;\n' + '}\n' +
            'return z;\n' + '}';
        let args = '1,2,3';
        assert.deepEqual(analyzeCode(parseCode(code), args), 'n0 [label= "   -1-\nlet a = x + 1\nlet b = a + y\nlet c = 0", shape=rectangle style=filled fillcolor=green]\nn1 [label= "   -2-\na < z", shape=diamond style=filled fillcolor=green]\nn2 [label= "   -3-\nc = a + b\na++", shape=rectangle style=filled fillcolor=green]\nn3 [label= "   -4-\nreturn z", shape=rectangle style=filled fillcolor=green]\n\nn0 -> n1 []\nn1 -> n2 [label="T"]\nn1 -> n3 [label="F"]\nn2 -> n1 []\n');
    });
});

describe('Full flow test - sample 2 from the class', () => {
    it('Test if-elseIf-else', () => {
        let code = 'function foo(x, y, z){\n' + 'let a = x + 1;\n' + 'let b = a + y;\n' + 'let c = 0;\n' +
            'if (b < z) {\n' + 'c = c + 5;\n' + '} else if(b < z * 2){\n' + 'c = c + x + 5;' +
            '} else {\n' + 'c = c + z + 5;\n' + '}\n' + 'return c;\n' + '}';
        let args = '1,2,3';
        assert.deepEqual(analyzeCode(parseCode(code), args), 'n0 [label= "   -1-\n' +
        'let a = x + 1\n' + 'let b = a + y\n' + 'let c = 0", shape=rectangle style=filled fillcolor=green]\n' +
        'n1 [label= "   -2-\n' + 'b < z", shape=diamond style=filled fillcolor=green]\n' +
        'n2 [label= "   -3-\n' + 'c = c + 5", shape=rectangle]\n' + 'n3 [label= "   -4-\n' + 'return c", shape=rectangle style=filled fillcolor=green]\n' +
        'n4 [label= "   -5-\n' + 'b < z * 2", shape=diamond style=filled fillcolor=green]\n' +
        'n5 [label= "   -6-\n' + 'c = c + x + 5", shape=rectangle style=filled fillcolor=green]\n' +
        'n6 [label= "   -7-\n' + 'c = c + z + 5", shape=rectangle]\n' + '\n' +
        'n0 -> n1 []\n' + 'n1 -> n2 [label="T"]\n' + 'n1 -> n4 [label="F"]\n' + 'n2 -> n3 []\n' +
        'n4 -> n5 [label="T"]\n' + 'n4 -> n6 [label="F"]\n' + 'n5 -> n3 []\n' + 'n6 -> n3 []\n');
    });
});

describe('Full flow test3', () => {
    it('Test with string', () => {
        let code =
            'function foo(x, y, z){\n' +
            'let a = x + 1;\n' +
            'let c = [1,2,3];\n' +
            'if(z + \'b\' == \'ab\'){\n' +
            'a = c + 5;\n' +
            '}\n' +
            'return z;\n' +
            '}\n';
        let args = '1,2,\'a\'';
        assert.deepEqual(analyzeCode(parseCode(code), args), 'n0 [label= "   -1-\nlet a = x + 1\nlet c = [    1,    2,    3]", shape=rectangle style=filled fillcolor=green]\nn1 [label= "   -2-\nz + \'b\' == \'ab\'", shape=diamond style=filled fillcolor=green]\nn2 [label= "   -3-\na = c + 5", shape=rectangle style=filled fillcolor=green]\nn3 [label= "   -4-\nreturn z", shape=rectangle style=filled fillcolor=green]\n\nn0 -> n1 []\nn1 -> n2 [label="T"]\nn1 -> n3 [label="F"]\nn2 -> n3 []\n');
    });
});

describe('Full flow test4', () => {
    it('Test with array', () => {
        let code =
            'function foo(x, y, z){\n' +
            'let a = x + 1;\n' +
            'let c = [1,2,3];\n' +
            'if(c[1] == 2){\n' +
            'a = c + 5;\n' +
            '}\n' +
            'return z;\n' +
            '}\n';
        let args = '1,2,\'z\'';
        assert.deepEqual(analyzeCode(parseCode(code), args),'n0 [label= "   -1-\nlet a = x + 1\nlet c = [    1,    2,    3]", shape=rectangle style=filled fillcolor=green]\nn1 [label= "   -2-\nc[1] == 2", shape=diamond style=filled fillcolor=green]\nn2 [label= "   -3-\na = c + 5", shape=rectangle style=filled fillcolor=green]\nn3 [label= "   -4-\nreturn z", shape=rectangle style=filled fillcolor=green]\n\nn0 -> n1 []\nn1 -> n2 [label="T"]\nn1 -> n3 [label="F"]\nn2 -> n3 []\n');
    });
});

describe('Full flow test4', () => {
    it('Test with array input', () => {
        let code =
            'function foo(x, y, z){\n' +
            'let a = x + 1;\n' +
            'let c = 7;\n' +
            'if(z[1] == 2){\n' +
            'a = c + 5;\n' +
            '}\n' +
            'return z;\n' +
            '}\n';
        let args = '1,2,[1,2,3]';
        assert.deepEqual(analyzeCode(parseCode(code), args), 'n0 [label= "   -1-\nlet a = x + 1\nlet c = 7", shape=rectangle style=filled fillcolor=green]\nn1 [label= "   -2-\nz[1] == 2", shape=diamond style=filled fillcolor=green]\nn2 [label= "   -3-\na = c + 5", shape=rectangle style=filled fillcolor=green]\nn3 [label= "   -4-\nreturn z", shape=rectangle style=filled fillcolor=green]\n\nn0 -> n1 []\nn1 -> n2 [label="T"]\nn1 -> n3 [label="F"]\nn2 -> n3 []\n');
    });
});


