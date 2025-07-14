import html from "../html.js";

export default function EntityPath({ filename, isDir }) {
  return html`
      <div class="path">
        (<a href="#">project</a>)/
        ${filename.replace(/^\/+/, '').split('/').map((part, index, arr) => {
          if (!isDir && index === arr.length - 1) {
            return part;
          }
          return html`
            <a href=${`#/${arr.slice(0, index + 1).join('/')}`}>${part}</a>/
          `;
        })}
      </div>
  `;
};
