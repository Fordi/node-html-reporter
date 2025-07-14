import { Transform } from "node:stream";
import { readFile, writeFile } from "node:fs/promises";
import { basename, relative } from "node:path";
import CoverageReport from "./report/CoverageReport.js";
import { TYPES } from "./report/consts.js";

const sumMetrics = (entries) => {
  const metrics = {};
  for (const entry of entries) {
    if (entry.type === 'dir') {
      Object.assign(entry, sumMetrics(entry.content));
    }
    for (const type of TYPES) {
      metrics[`total${type}Count`] ??= 0;
      metrics[`covered${type}Count`] ??= 0;
      metrics[`total${type}Count`] = entry[`total${type}Count`];
      metrics[`covered${type}Count`] = entry[`covered${type}Count`];   
    }
  }
  for (const type of TYPES) {
    metrics[`covered${type}Percent`] = 100 * metrics[`covered${type}Count`] / metrics[`total${type}Count`];
  }
  return metrics;
};

const reduceTree = (dir) => {
  if (dir.type !== 'dir') return dir;
  if (dir.content.length === 1) {
    const child = { ...dir.content[0] };
    child.name = `${dir.name}/${child.name}`.replace(/^\/+/, '');
    return reduceTree(child);
  }
  if (dir.type === 'dir' && dir.content.length) {
    return {
      ...dir,
      content: dir.content.map(reduceTree),
    };
  }
  return dir;
};

const walkTree = (tree, onEach) => {
  if (tree.type === 'dir') {
    for (const entry of tree.content) {
      walkTree(entry, onEach);
    }
  }
  onEach(tree);
};

class HtmlReporter extends Transform {
  constructor(config = {}) {
    const transform = async (payload, encoding, callback) => {
      const { type, data, ...rest } = payload;
      if (type === 'test:coverage') {
        try {
          callback(undefined, await this.handleCoverage(data, { encoding, type, ...rest }));
        } catch (e) {
          console.warn(e);
          callback(e);
        }
      } else {
        callback(undefined, undefined);
      }
    };
    super({ ...config, writableObjectMode: true, transform });
  }
  
  async handleCoverage({ summary }, { encoding }) {
    let subjects = {};
    let tree = {
      type: "dir",
      name: '',
      filename: '/',
      content: [],
    };

    await Promise.all(summary.files.map(async (file) => {
      if (/(\/test\/.*|test[\.-_][^\/]+|[\.-_]test)\.?[cm]?js/.test(file.path)) {
        return;
      }
      const filename = `/${relative(summary.workingDirectory, file.path)}`;
      if (!subjects[filename]) {
        subjects[filename] = { type: "file", filename, name: basename(filename) };
      } 
      if (!subjects[filename].content) {
        subjects[filename].content = await readFile(file.path, encoding);
      }
      Object.assign(subjects[filename], file);
      let dir = tree;
      let path = filename.replace(/^\/+/, '').split('/');
      for (let index = 0; index < path.length; index++) {
        const part = path[index];
        const soFar = `/${path.slice(0, index + 1).join('/')}`;
        const dirChild = dir.content?.find?.(({ name }) => name === part);
        let child = subjects[soFar] ?? dirChild ?? {
          type: "dir",
          name: part,
          filename: soFar,
          content: [],
        };
        subjects[soFar] ??= child;
        if (!dirChild) {
          dir.content.push(child);
        }
        dir = child;
      }
    }));
    
    tree = reduceTree(tree);
    subjects = {};
    walkTree(tree, (entry) => subjects[entry.filename] = entry);
    Object.assign(tree, sumMetrics(tree.content));
    await writeFile('temp.json', JSON.stringify(tree, null, 2), 'utf-8');

    const reportHandler = await readFile(new URL('./report/reportHandler.js', import.meta.url).pathname, 'utf-8');
    const reportStyle = await readFile(new URL('./report/reportStyle.css', import.meta.url).pathname, 'utf-8');

    const outputFile = `${process.env.NODE_V8_COVERAGE}/index.html`;
    await writeFile(outputFile, `<!DOCTYPE html>\n${CoverageReport({ reportHandler, reportStyle, subjects })}`, 'utf8');
    console.info(`Coverage written to ./${relative(process.cwd(), outputFile)}`);
  }
}

export default new HtmlReporter();