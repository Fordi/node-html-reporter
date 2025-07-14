import html from "../html.js";
import { TYPES } from "./consts.js";

export default function Listing({ content }) {
  return html`
    ${content.map((file) => {
      const overall = Math.round(TYPES.reduce((min, type) => Math.min(min, file[`covered${type}Percent`] ?? 0), Infinity));
      const rowClass = (overall === 100) ? 'row-ok' : (overall > 50) ? 'row-warn' : 'row-bad';
      return html`
        <tr class=${rowClass} data-overall=${overall}>
          <td><a href=${`#${file.filename}`}>${file.name}</a></td>
          ${TYPES.map((type) => html`
            <td>${Math.round(file[`covered${type}Percent`])}% (${file[`covered${type}Count`]} / ${file[`total${type}Count`]})</td>
          `)}
        </tr>
      `;
    })}
  `;
}