import { argbFromHex, hexFromArgb, Hct, Blend } from '@material/material-color-utilities';

const neutral = '#000';
// Use this to compare to `--token-color-neutral-base: hotpink`
//const neutral = '#ff69b4';
// nice blue
//const neutral = '#000619';

const baseColors: Record<string, string> = {
  blue: '#205eb5',
  purple: '#5e4db2',
  teal: '#abdced',
  green: '#247554',
  magenta: '#c6398f',
  yellow: '#fc3',
  orange: '#ee6d11',
  red: '#d13a2e',
};

const stateColors: Record<string, string> = {
  primary: '#205eb5',
  secondary: '#737373',
  info: '#abdced',
  success: '#247554',
  warning: '#fc3',
  danger: '#d13a2e',
  notice: '#737373',
};


const neutralShades = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100];
const baseShades = [3, 4, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 96, 97];
const stateShades = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 96, 97, 98, 99];


const sheet = new CSSStyleSheet();
document.adoptedStyleSheets.push(sheet);

const calculateProperties = () => {
  const properties: Record<string, string> = {};
  const { accent } = document.documentElement.dataset;

  const accentArgb = accent ? argbFromHex(accent) : null;
  const neutralArgb = accentArgb ?? argbFromHex(neutral);
  for (const shade of neutralShades) {
    const hct = Hct.fromInt(neutralArgb);
    hct.tone = 100 - shade;
    // See https://github.com/material-foundation/material-color-utilities/blob/e88730b697d775be098c6708213ac074979da966/typescript/palettes/core_palette.ts#L127
    hct.chroma = Math.min(hct.chroma / 12, 4);
    // variant with "more" chromacity, probably too much for our neutrals
    //hct.chroma = Math.min(hct.chroma / 6, 8);
    const name = `--token-color-neutral-${shade}`;
    properties[name] = hexFromArgb(hct.toInt());
  }

  for (const [token, state] of Object.entries(stateColors)) {
    const argb = argbFromHex(state);
    const harmonized = accent ? Blend.harmonize(argb, accentArgb) : argb;
    for (const shade of stateShades) {
      const hct = Hct.fromInt(harmonized);
      hct.tone = 100 - shade;
      const name = `--token-color-${token}-${shade}`;
      properties[name] = hexFromArgb(hct.toInt());
    }
  }

  for (const [token, base] of Object.entries(baseColors)) {
    const argb = argbFromHex(base);
    for (const shade of baseShades) {
      const hct = Hct.fromInt(argb);
      hct.tone = 100 - shade;
      const name = `--token-color-${token}-${shade}`;
      properties[name] = hexFromArgb(hct.toInt());
    }
  }

  if (accent) {
    for (const shade of stateShades) {
      // Hack until we have a semantic primary token
      const hct = Hct.fromInt(accentArgb);
      hct.tone = 100 - shade;
      const name = `--token-color-primary-${shade}`;
      properties[name] = hexFromArgb(hct.toInt());
    }
  }

  sheet.replaceSync(`
    @layer color {
      [data-theme=hct] {
        ${Object.entries(properties).map(([key, value]) => `${key}: ${value}`).join(';')}
      }
      /* debug */
      html[data-theme=hct] .scaffold:after {
        content: 'HCT';
        display: block;
        position: fixed;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        padding: 4px 8px;
        background: var(--token-color-teal-10);
        color: var(--token-color-teal-90);
        z-index: 1000;
      }
    }
  `);
};

calculateProperties();

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes') {
      calculateProperties();
    }
  });
});
observer.observe(document.documentElement, {
  attributeFilter: ['data-accent'],
});
