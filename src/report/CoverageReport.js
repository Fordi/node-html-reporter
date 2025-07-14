import SourcePage from "./SourcePage.js";
import ListingPage from "./ListingPage.js";
import html from "../html.js";

export default function CoverageReport({ reportHandler, reportStyle, subjects }) {
  return html`
    <html>
      <head>
        <meta charset="utf8" />
        <title>Coverage</title>
        ${Object.entries(subjects).map(([filename, entry]) => 
          entry.type === 'file'
            ? html`<${SourcePage} ...${subjects[filename]} />`
            : html`<${ListingPage} ...${subjects[filename]} />`
        )}
        <script type="module" defer>${html.raw(reportHandler)}</script>
        <style>${html.raw(reportStyle)}</style>
      </head>
      <body>
      </body>
    </html>
  `;
}