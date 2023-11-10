const goTo = (href) => {
  const template = document.querySelector(href.replace(/([\/\.])/g, '\\$1'));
  if (!template) {
    return;
  }
  document.body.innerHTML = template.innerHTML;
};

document.body.addEventListener('click', (event) => {
  const href = event.target.getAttribute('href');
  if (!href?.startsWith?.('#')) {
    return;
  }
  try {
    goTo(href);
    return true;
  } catch (e) {
  }
});

goTo(location.hash || '#/');