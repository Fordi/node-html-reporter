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

const coveredFraction = (covered, total) => html`${(100 * covered / total).toFixed(2)}% (${covered} / ${total})`

export default ({ filename, report, content }) => html`
  <div class="report">
    <div class="path">
      <a href="#/">(root)</a>/
      ${filename.split('/').map((part, index, arr) => {
        if (index == arr.length - 1) {
          return part;
        }
        const ref = `#${arr.slice(0, index + 1).join('/')}`;
        return html`<a href=${ref}>${part}</a>/`;
      })}
    </div>
    <div class="coverage">
      <div class="coverage-part">
        <div class="title">Lines</div>
        <div>${coveredFraction(report.coveredLineCount, report.totalLineCount)}</div>
      </div>
      <div class="coverage-part">
        <div class="title">Branches</div>
        <div>${coveredFraction(report.coveredBranchCount, report.totalBranchCount)}</div>
      </div>
      <div class="coverage-part">
        <div class="title">Functions</div>
        <div>${coveredFraction(report.coveredFunctionCount, report.totalFunctionCount)}</div>
      </div>
    </div>
  </div>
  <table class="hljs">
    ${hljs.highlightAuto(content.toString('utf-8')).value.split('\n').map((line, index) => {
      const functions = report.functions.filter(({ line }) => line === index + 1);
      const branches = report.functions.filter(({ line }) => line === index + 1);
      return decorateLine(line, report.lines[index], functions, branches);
    })}
  </table>
`;
