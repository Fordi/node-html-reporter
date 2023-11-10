import vhtml from 'vhtml';
import htm from 'htm';
const html = htm.bind(vhtml);
html.raw = (content) => vhtml(null, { dangerouslySetInnerHTML: { __html: content } });

export default html;