import html from "../html.js";

export default ({ children, id }) => html`
  <script type="template" id=${id}>
    ${children}
  </script>
`;
