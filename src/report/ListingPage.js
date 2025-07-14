import html from "../html.js";
import { TYPES } from "./consts.js";
import Listing from "./Listing.js";
import Template from "./Template.js";

export default function ListingPage({ filename, content }) {
  return html`
    <${Template} id=${filename}>
      <table class="listing">
        <thead>
          <th>Path</th>
          ${TYPES.map((type) => html`<th>${type}</th>`)}
        </thead>
        <tbody>
          <${Listing} content=${content} />
        </tbody>
      </table>
    </${Template}>
  `;
}