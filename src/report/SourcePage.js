import html from "../html.js";
import { TYPES } from "./consts.js";
import EntityPath from "./EntityPath.js";
import SourceFile from "./SourceFile.js";
import Template from "./Template.js";

const coveredFraction = (covered, total) => html`${(100 * covered / total).toFixed(2)}% (${covered} / ${total})`;

export default function SourcePage({ filename, content, ...report }) {
  return html`
    <${Template} id=${filename}>
      <div class="report">
        <${EntityPath} filename=${filename} />
        <div class="coverage">
          ${TYPES.map((type) => html`
            <div class="coverage-part">
              <div class="title">${type}</div>
              <div>${coveredFraction(report[`covered${type}Count`], report[`total${type}Count`])}</div>
            </div>
          `)}
        </div>
      </div>
      <${SourceFile} report=${report} content=${content} />
    </>
  `;
}
