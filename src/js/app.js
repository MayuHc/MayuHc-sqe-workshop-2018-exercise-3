import $ from 'jquery';
import {parseCode, analyzeCode} from './code-analyzer';
import Viz from 'viz.js';
import {Module, render} from 'viz.js/full.render.js';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        let args = $('#inputPlaceholder').val();
        let dotScript = analyzeCode(parsedCode, args);
        let viz = new Viz({Module, render});
        let dot = 'digraph{' + dotScript + '}';
        let placeHolder = document.getElementById('resultGraph');
        viz.renderSVGElement(dot)
            .then(function (element) {
                placeHolder.innerHTML = '';
                placeHolder.append(element);
            });
    });
});
