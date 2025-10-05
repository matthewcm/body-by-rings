/**
 * Converts an HSL color value to HEX.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {string}          The HEX representation
 */
function hslToHex(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}


/**
 * Converts a HEX color value to HSL.
 * Assumes hex is a string in the format #RRGGBB.
 * Returns h, s, and l in the set [0, 1].
 *
 * @param   {string}  hex       The hex color value
 * @return  {Array}             The HSL representation
 */
function hexToHsl(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}


/**
 * Generates an array of hex colors that progressively darken from a base color.
 *
 * @param {string} baseColorHex - The starting color in hex format (e.g., '#5D5FEF').
 * @param {number} steps - The total number of colors to generate (e.g., 6).
 * @param {number} endLightnessPercent - The final lightness percentage for the darkest color (e.g., 20).
 * @returns {string[]} An array of hex color strings.
 */
export function generateHexShades(baseColorHex, steps, endLightnessPercent) {
    // 1. Convert the base hex color to HSL values (ranging 0-1).
    const [h, s, startL] = hexToHsl(baseColorHex);
    
    // 2. Define the end lightness as a value between 0 and 1.
    const endL = endLightnessPercent / 100;

    // 3. Calculate the total range and step for lightness decrease.
    const lightnessRange = startL - endL;
    const lightnessStep = lightnessRange / (steps - 1);
    
    const colorArray = [];

    // 4. Loop to generate each color shade.
    for (let i = 0; i < steps; i++) {
        // 5. Calculate the new lightness for the current step.
        const currentL = startL - (i * lightnessStep);

        // 6. Convert the new HSL color back to hex and add it to the array.
        colorArray.push(hslToHex(h, s, currentL));
    }

    return colorArray;
}
