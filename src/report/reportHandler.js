const root = `#${[...document.querySelectorAll('script[type="template"][id]')].map(({ id }) => id).sort()[0]}`;

const goTo = (href) => {
  const template = document.querySelector((href || root).replace(/([\/\.])/g, '\\$1'));
  if (!template) {
    return;
  }
  document.body.innerHTML = template.innerHTML;
};

window.addEventListener('hashchange', (event) => {
  goTo(new URL(event.newURL).hash);
});

goTo(location.hash);