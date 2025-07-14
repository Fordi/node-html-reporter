import html from '../html.js';
import hljs from 'highlight.js';

const decorateLine = (code, metadata, functions, branches) => {
  if (metadata) {
    const { line, count } = metadata;
    let decoratedCode = code;
    const lineClass = ['hljs-line'];
    const lineAlt = [];
    if (count === 0) {
      lineClass.push('hljs-uncovered-line');
      lineAlt.push("This line is uncovered");
    }

    branches.forEach(({ count }) => {
      if (count === 0) {
        lineClass.push('hljs-uncovered-branch');
        lineAlt.push("This branch is uncovered");
      }
    });

    functions.forEach(({ count, name }) => {
      if (count === 0) {
        if (decoratedCode.includes('>constructor<')) {
          name = 'constructor';
        }
        decoratedCode = decoratedCode.replace(name, `<span title="This function is uncovered" class="hljs-uncovered-function">${name}</span>`);
      }
    })

    return html`
      <tr class=${lineClass.join(' ')} title=${lineAlt.join("\n")}>
        <td class="hljs-line-count">x${String(count)}</td>
        <td class="hljs-line-num">${line}</td>
        <td class="hljs-line-content">${html.raw(decoratedCode)}</td>
      </tr>
    `;
  }
  return code;
};

export default function SourceFile({ content, report }) {
  return html`
    <table class="hljs">
      ${hljs.highlightAuto(content.toString('utf-8')).value.split('\n').map((line, index) => {
        const functions = report.functions.filter(({ line }) => line === index + 1);
        const branches = report.branches.filter(({ line }) => line === index + 1);
        return decorateLine(line, report.lines[index], functions, branches);
      })}
    </table>
  `;
}