import { Transform } from "node:stream";
import { readFile, writeFile } from "node:fs/promises";
import { relative } from "node:path";
import hljs from "highlight.js";
import html from './html.js';
import Template from './report/Template.js';
import SourceFile from './report/SourceFile.js';

const { max } = Math;

class TestReporter extends Transform {
  constructor(config) {
    super({
      ...config,
      transform: async ({ type, data, ...rest }, encoding, callback) => {
        const name = type.replace(/:/g, '_');
        try {
          callback(null, await (this[name] ?? this['unhandled']).call(this, data, { encoding, ...rest, type }));
        } catch (e) {
          console.warn(e);
          callback(e);
        }
      },
    });
  }
  unhandled(data, { type, ...metadata }) {
    return [
      `Unhandled event: ${type}`,
      `\t${JSON.stringify({ data, metadata })}`,
    ].join('\n') + '\n';
  }
}

const FULLPATH = Symbol('FULLPATH');

class HtmlReporter extends TestReporter {
  #count = 0;
  #silent = false;
  constructor({ silent, ...config }) {
    super(config);
    this.#silent = true;
  }
  
  async test_coverage({ summary }, { encoding }) {
    const { workingDirectory, files } = summary;
    const templates = {};
    const links = [];
    const root = {};
    Object.defineProperty(root, FULLPATH, { value: '/' });
    await Promise.all(files.map(async (file) => {
      if (/(\/test\/.*|test[\.-_][^\/]+|[\.-_]test)\.?[cm]?js/.test(file.path)) {
        return;
      }
      const filename = relative(workingDirectory, file.path);
      const content = await readFile(file.path, encoding);
      templates[filename] = html`
        <${Template} id=${`/${filename}`}>
          <${SourceFile} filename=${filename} report=${file} content=${content} />
        </>
      `;
      let dir = root;
      filename.split('/').forEach((part, index, arr) => {
        if (!dir[part]) {
          dir[part] = {};
          Object.defineProperty(dir[part], FULLPATH, { value: `/${arr.slice(0, index + 1).join('/')}` });
        }
        dir = dir[part];
      });
    }));
    const Listing = ({ files }) => html`
      ${files.map((file) => html`
        <a href=${`#${file}`}>${file}</a>
      `)}
    `;
    const walkTree = (dir) => {
      const path = dir[FULLPATH];
      if (!templates[path]) {
        templates[path] = html`
          <${Template} id=${`${path}`}>
            <${Listing} files=${Object.keys(dir).map(child => dir[child][FULLPATH])} />
          </${Template}>
        `;
        Object.keys(dir).forEach(part => {
          walkTree(dir[part]);
        });
      }
    };
    walkTree(root);
    templates['/'] = html`
      <${Template} id="/">
        <${Listing} files=${Object.keys(root).map(child => root[child][FULLPATH])} />
      </>
    `;
    const reportHandler = await readFile(new URL('./report/reportHandler.js', import.meta.url).pathname, 'utf8');
    const reportStyle = await readFile(new URL('./report/reportStyle.css', import.meta.url).pathname, 'utf8');
    await writeFile(`${process.env.NODE_V8_COVERAGE}/index.html`, `<!DOCTYPE html>\n${html`
      <html>
        <head>
          <meta charset="utf8" />
          <title>Coverage</title>
          ${Object.keys(templates).map((key) => templates[key])}
          <script type="module" defer>${html.raw(reportHandler)}</script>
          <style>${html.raw(reportStyle)}</style>
        </head>
        <body>
        </body>
      </html>
    `}`, 'utf8');
    
    if (this.#silent) {
      return '';
    }
    return '';
  }
  test_pass() {
    if (this.#silent) {
      return '';
    }
    return this.step('.');
  }
  test_fail() {
    if (this.#silent) {
      return '';
    }
    return this.step('X');
  }
  
  step(char) {
    let nl = '';
    if (max(process.stdout.columns ?? 20, 20) === ++this.#count) {
      nl = '\n';
      this.#count = 0;
    }
    return `${char}${nl}`;
  }
  unhandled() {}
}

export default new HtmlReporter({
  writableObjectMode: true,
});