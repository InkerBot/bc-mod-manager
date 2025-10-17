import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js"

// https://vite.dev/config/
const bmmInitialization = `
if(window.bmm){
console.warn('BMM already initialized');
}else{
window.bmm={};
window.bmm.root=document.createElement('div');
window.bmm.root.id='root';
if(document.body){
window.bmm.shadowRoot=document.body.attachShadow({mode: 'closed'});
window.bmm.shadowRoot.appendChild(window.bmm.root);
}else{
document.addEventListener('DOMContentLoaded', function() {
window.bmm.shadowRoot=document.body.attachShadow({mode: 'closed'});
window.bmm.shadowRoot.appendChild(window.bmm.root);
});
}
`;

const styleContainer = `window.bmm.shadowRoot`

function isCSSRequest(request: string): boolean {
  const CSS_LANGS_RE = /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/;

  return CSS_LANGS_RE.test(request);
}

export default defineConfig({
  plugins: [
    preact(),
    tailwindcss(),
    cssInjectedByJsPlugin({
      injectCode(cssCode, { styleId, useStrictCSP, attributes }) {
        let attributesInjection = '';

        for (const attribute in attributes) {
          attributesInjection += `elementStyle.setAttribute('${attribute}', '${attributes[attribute]}');`;
        }

        return `if(typeof document != 'undefined'){var elementStyle = document.createElement('style');${
          typeof styleId == 'string' && styleId.length > 0 ? `elementStyle.id = '${styleId}';` : ''
        }${
          useStrictCSP ? `elementStyle.nonce = ${styleContainer}.querySelector('meta[property=csp-nonce]')?.content;` : ''
        }${attributesInjection}elementStyle.appendChild(document.createTextNode(${cssCode}));${styleContainer}.appendChild(elementStyle);}`;
      },
      dev: {
        enableDev: true,
        removeStyleCode(devId: string) {
          return `{
              (function removeStyleInjected() {
                  const elementsToRemove = ${styleContainer}.querySelectorAll("style[data-vite-dev-id='${devId}']");
                  elementsToRemove.forEach(element => {
                      element.remove();
                  });
              })()
          }`
        },
      }
    }),
    {
      name: 'initial-bmm',
      enforce: 'post',
      generateBundle(_, bundle) {
        for (const file in bundle) {
          if (file.endsWith('.js')) {
            const chunk = bundle[file]
            if (chunk.type === 'chunk' && chunk.isEntry) {
              chunk.code = '(()=>{' + bmmInitialization.replace(/[\n\t]+/g, '')
                + chunk.code + '}})()'
            }
          }
        }
      },
      transform(src, id) {
        if (isCSSRequest(id)) {
          return {
            code: bmmInitialization + '}' + src,
            map: null,
          }
        }
      }
    },
  ],
  build: {
    modulePreload: false,
    sourcemap: 'hidden',
    rolldownOptions: {
      input: 'src/main.tsx',
      output: {
        entryFileNames: '[name].js',
      },
    }
  }
})
