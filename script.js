let radius = 200;

var red = 0, blue = 0, green = 0;
var cred = 0, cblue = 0, cgreen = 0;
let lastx = 0, lasty = 0;
let px = 0, py = 0;

var colors = [], coord = [];

// ON LOAD FUNCTION
function init() {
  draw();
}

function draw() {

  var ctx = document.getElementById("quad").getContext('2d');

  let image = ctx.createImageData(2 * radius, 2 * radius);
  let data = image.data;

  for (let x = -radius; x < radius; x++) {
    for (let y = -radius; y < radius; y++) {

      let radian = xy2plr(x, y);
      let rad = Math.sqrt(x * x + y * y);

      if (rad > radius) {
        continue;
      }

      let deg = rad2deg(radian);

      let rowLength = 2 * radius;
      let adjustedX = x + radius;
      let adjustedY = y + radius;
      let pixelWidth = 4;
      let index = (adjustedX + (adjustedY * rowLength)) * pixelWidth;

      let slider = document.getElementById('slider');
      let pos = slider.value;

      let [red, green, blue] = hsv2rgb(deg, rad / radius, pos / 100);
      data[index] = red;
      data[index + 1] = green;
      data[index + 2] = blue;
      data[index + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
}

// END! - LOAD FUNCTIONS

// CONVERSION FUNCTIONS
function xy2plr(x, y) {
  let radians = Math.atan2(y, x);
  return radians;
}

function rad2deg(rad) {
  return ((rad + Math.PI) / (2 * Math.PI)) * 360;
}

function hsv2rgb(hue, saturation, value) {
  let chroma = value * saturation;
  let hue1 = hue / 60;
  let x = chroma * (1 - Math.abs((hue1 % 2) - 1));
  let r1, g1, b1;
  if (hue1 >= 0 && hue1 <= 1) {
    ([r1, g1, b1] = [chroma, x, 0]);
  } else if (hue1 >= 1 && hue1 <= 2) {
    ([r1, g1, b1] = [x, chroma, 0]);
  } else if (hue1 >= 2 && hue1 <= 3) {
    ([r1, g1, b1] = [0, chroma, x]);
  } else if (hue1 >= 3 && hue1 <= 4) {
    ([r1, g1, b1] = [0, x, chroma]);
  } else if (hue1 >= 4 && hue1 <= 5) {
    ([r1, g1, b1] = [x, 0, chroma]);
  } else if (hue1 >= 5 && hue1 <= 6) {
    ([r1, g1, b1] = [chroma, 0, x]);
  }

  let m = value - chroma;
  let [r, g, b] = [r1 + m, g1 + m, b1 + m];

  // Change r,g,b values from [0,1] to [0,255]
  return [255 * r, 255 * g, 255 * b];
}

function rgb2hsv(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
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
// END! - CONVERSION FUNCTIONS

// tests that our function tracks all slider value changes.
function logslider() {
  draw();
}

function getAlpha() {
  let slider = document.getElementById('slider');
  return slider.value;
}

function movecursor() {
  let canv = document.getElementById('quad');
  document.body.style.cursor = 'none';
  canv.addEventListener('mousemove', getcord);
}

function stopmovement() {
  let canv = document.getElementById('quad');
  document.body.style.cursor = 'default';

  updatedisplay(50);
  document.querySelector('.valuecontrol').value = 50;

  canv.removeEventListener('mousemove', getcord);
}

function updatecontainers() {
  let hub = document.getElementById('testingsite');
  hub.innerHTML = '';
  var ctx;
  let back = 'linear-gradient(45deg, ';
  for (let i = 0; i < colors.length; i++) {
    var box = document.createElement('div');
    box.classList.add('containerdisp');
    box.classList.add('col');

    var canvcont = document.createElement('div');
    canvcont.classList.add('inner');

    var canv = document.createElement('canvas');
    canv.classList.add('minidisplay');
    ctx = canv.getContext('2d');
    canv.width = 200;
    canv.height = 200;
    ctx.fillStyle = colors[i];
    ctx.fillRect(0, 0, 200, 200);

    canvcont.append(canv);
    back += colors[i];
    if (i + 1 < colors.length) {
      back += ',';
    } else back += ')';

    box.append(canvcont);

    // info div

    let elem = document.createElement('div');
    let label = document.createElement('p');

    elem.classList.add('inner');

    label.textContent = RGBToHex(colors[i]);
    label.classList.add('hexlabel');

    elem.append(label);

    box.append(elem);
    hub.appendChild(box);
  }

  document.body.style.background = back;

  let holder = document.getElementById('pointercont');

  holder.innerHTML = '';

  for (var i = 0; i < coord.length; i++) {
    // elems = block.getElementsByClassName('point');
    // if (elems.length > 2) break;
    var newdiv = document.createElement('div');
    newdiv.classList = "inner point";
    var pointer = document.createElement('div');
    pointer.classList = "pointer";
    newdiv.appendChild(pointer);

    newdiv.style.width = coord[i][0] + '%';
    newdiv.style.height = coord[i][1] + '%';

    holder.appendChild(newdiv);
    // console.log(block.innerHTML);
  }
}

function changestate() {
  coord = [];
  updatecontainers();
}

function getcord(e) {
  let elem = document.getElementById('quad');
  let rect = elem.getBoundingClientRect();
  let x = e.clientX - (rect.left+radius);
  let y = e.clientY - (rect.top+radius);

  if (isvalid(x,y)) {
    sendcard(x,y);
  }
}

function random() {
  let x = (Math.random() * 400) - 200;
  let y = (Math.random() * 400) - 200;

  while (!isvalid(x, y)) {
    x = (Math.random() * 400) - 200;
    y = (Math.random() * 400) - 200;
  }

  sendcard(x, y);
}

function isvalid(x, y) {

  if (Math.sqrt(x * x + y * y) <= radius) return true;
  return false;

}

function sendcard(x, y) {

  let canv = document.getElementById('quad');
  let rect = canv.getBoundingClientRect();
  let leftbound = rect.left, topbound = rect.top; // border positions.

  let xcomp = x;
  let ycomp = y;

  let palettetype = document.getElementById('palettebox').value;

  if (isvalid(x, y)) {


    let ctx = canv.getContext('2d');
    let pixel = ctx.getImageData(Math.abs(x + 200), Math.abs(y + 200), 1, 1);

    let data = pixel.data;

    let color = 'rgb(' + data[0] + ',' + data[1] + ',' + data[2] + ')';

    fill(color);

    red = data[0];
    green = data[1];
    blue = data[2];

    colors = [];
    colors.push(color);

    coord = [];
    let pair = [(x + 200) / 400 * 100, (y + 200) / 400 * 100];
    coord.push(pair);

    var p1x, p1y, p2x, p2y, p1, p2, pixel1, pixel2, data1, data2, c1, c2;

    switch (palettetype) {
      case 'Complementary':
        let compx = -x;
        let compy = -y;


        let pixel = ctx.getImageData(Math.abs(compx+200), Math.abs(compy+200), 1, 1);

        let data = pixel.data;

        let complement = 'rgb(' + data[0] + ',' + data[1] + ',' + data[2] + ')';

        cred = data[0];
        cgreen = data[1];
        cblue = data[2];

        p1 = [(compx + 200) / 400 * 100, (compy + 200) / 400 * 100];

        colors.push(complement);
        coord.push(p1);

        break;
      case 'Monochromatic':

        let mono = getmono([red, green, blue]);
        colors.push(mono);

        p1 = [(xcomp + radius) / 400 * 100, (ycomp + radius) / 400 * 100];
        coord.push(p1);

        break;
      case 'Triadic':

        [p1x, p1y] = gettriadic(xcomp, ycomp, leftbound + radius, topbound + radius, 120);
        [p2x, p2y] = gettriadic(xcomp, ycomp, leftbound + radius, topbound + radius, 240);

        pixel1 = ctx.getImageData(p1x - leftbound, p1y - topbound, 1, 1);
        pixel2 = ctx.getImageData(p2x - leftbound, p2y - topbound, 1, 1);

        data1 = pixel1.data;
        data2 = pixel2.data;

        c1 = `rgb(${data1[0]},${data1[1]},${data1[2]})`;
        c2 = `rgb(${data2[0]},${data2[1]},${data2[2]})`;

        p1 = [(p1x - leftbound) / 400 * 100, (p1y - topbound) / 400 * 100];
        p2 = [(p2x - leftbound) / 400 * 100, (p2y - topbound) / 400 * 100];

        colors.push(c1);
        colors.push(c2);

        coord.push(p1);
        coord.push(p2);

        break;
      case 'Analogous':

        [p1x, p1y] = getanalgous(xcomp, ycomp, leftbound + radius, topbound + radius, 30);
        [p2x, p2y] = getanalgous(xcomp, ycomp, leftbound + radius, topbound + radius, 330);

        pixel1 = ctx.getImageData(p1x - leftbound, p1y - topbound, 1, 1);
        pixel2 = ctx.getImageData(p2x - leftbound, p2y - topbound, 1, 1);

        data1 = pixel1.data;
        data2 = pixel2.data;

        c1 = `rgb(${data1[0]},${data1[1]},${data1[2]})`;
        c2 = `rgb(${data2[0]},${data2[1]},${data2[2]})`;

        p1 = [(p1x - leftbound) / 400 * 100, (p1y - topbound) / 400 * 100];
        p2 = [(p2x - leftbound) / 400 * 100, (p2y - topbound) / 400 * 100];

        colors.push(c1);
        colors.push(c2);

        coord.push(p1);
        coord.push(p2);

        break;
      default:
        break;
    }

    lastx = x + 200;
    lasty = y + 200;

    updatecontainers();
  } else {
    stopmovement();
  }
}

function getCompFromAngle(theta) {
  if (theta == 90 || theta == 270) return 0;
  else if (theta == 0 || theta == 180) return 5;
  return Math.floor((theta / 90) + 1);
}

function getQuad(x, y) {
  if (x > 0) {
    if (y > 0) return 1;
    else return 2;
  } else {
    if (y > 0) return 4;
    return 3;
  }
}

function getanalgous(x, y, cx, cy, translated) {
  cx += Math.cos(translated * Math.PI / 180) * x - Math.sin(translated * Math.PI / 180) * y;
  cy += Math.cos(translated * Math.PI / 180) * y + Math.sin(translated * Math.PI / 180) * x;

  return [cx, cy];
}

function gettriadic(x, y, cx, cy, translated) {

  cx += Math.cos(translated * Math.PI / 180) * x - Math.sin(translated * Math.PI / 180) * y;
  cy += Math.cos(translated * Math.PI / 180) * y + Math.sin(translated * Math.PI / 180) * x;

  return [cx, cy];
}

function relativetox(ang, comp) {

  switch (comp) {
    case 1:
      ang = 90 - ang;
      break;
    case 2:
      ang -= 90;
      break;
    case 3:
      ang = 270 - ang;
      break;
    case 4:
      ang -= 270;
      break;

  }

  return ang;
}

function getmono(color) {

  let lum = document.querySelector('.valuecontrol').value;

  var mono;
  if (lum <= 50) {
    mono = offset(Number(lum) + 5, color);
  } else {
    mono = offset(Number(lum) - 5, color);
  }

  return mono;
}

function offset(val, data) {
  var pair;
  if (val > 50) {
    pair = darken(val - 50, data);
  } else pair = lighten(50 - val, data);
  return pair;
}

function fill(color) {
  let ctx = document.querySelector('.valuecontrol');
  ctx.style.background = 'linear-gradient(to right, rgb(255,255,255), ' + color + ', rgb(0,0,0))';
}

function effectElement(color) {
  document.body.style.backgroundColor = color;
}

function updatedisplay(val) {
  var color;
  let canvcont = document.getElementById('testingsite').children;
  let type = document.getElementById('palettebox').value;
  
  let text = document.querySelectorAll('.hexlabel');

  for (let i = 0; i < text.length; i++) {
    let label = text[i];
    if (val >= 50) {
      label.style.color = 'white';
    } else {
      label.style.color = 'black';
    }
  }


  for (let i = 0; i < colors.length; i++) {
    let canv = canvcont[i].querySelector('.minidisplay');
    let data = colors[i].replace('rgb(', '').replace(')', '').split(',');

    let ctx = canv.getContext('2d');

    switch (type) {
      case 'Complementary':
      case 'Triadic':
      case 'Analogous':


        if (val < 50) {
          color = lighten(50 - val, data);
        } else if (val > 50) {
          color = darken(val - 50, data);
        } else {
          color = 'rgb(' + data[0] + ',' + data[2] + ',' + data[3] + ')';
        }
        ctx.fillStyle = color;
        break;

      case 'Monochromatic':

        if (i == 1) {
          let mono = getmono(data);
          ctx.fillStyle = mono;
          break;
        } else {
          if (val < 50) {
            color = lighten(50 - val, data);
          } else if (val > 50) {
            color = darken(val - 50, data);
          } else {
            color = 'rgb(' + data[0] + ',' + data[1] + ',' + data[2] + ')';
          }
          ctx.fillStyle = color;
          break;
        }


      default:
        break;
    }

    canvcont[i].querySelector('.hexlabel').textContent = RGBToHex(color);
    ctx.fillRect(0, 0, 200, 200);
  }
}

function getSortedIndices(data) {
  let color = [
    [Number(data[0]), 0],
    [Number(data[1]), 1],
    [Number(data[2]), 2]
  ];

  color.sort(function (a, b) {
    return a[0] - b[0];
  });

  return color;
}

function RGBToHex(rgb) {
  // Choose correct separator
  let sep = rgb.indexOf(",") > -1 ? "," : " ";
  // Turn "rgb(r,g,b)" into [r,g,b]
  rgb = rgb.substr(4).split(")")[0].split(sep);

  let r = (+rgb[0]).toString(16),
    g = (+rgb[1]).toString(16),
    b = (+rgb[2]).toString(16);

  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;

  return "#" + r + g + b;
}

function lighten(val, color) {
  let [lowest, middle, highest] = getSortedIndices(color);

  if (lowest[0] === 255) {
    // console.log('The light is too bright my friend.');
    return;
  }

  let returnarr = [];

  returnarr[lowest[1]] = Math.round(lowest[0] + Math.min(255 - lowest[0], (5.1) * val));

  var incfrac = (returnarr[lowest[1]] - lowest[0]) / (255 - lowest[0]);
  returnarr[middle[1]] = Math.round(middle[0] + (255 - middle[0]) * incfrac);
  returnarr[highest[1]] = Math.round(highest[0] + (255 - highest[0]) * incfrac);

  return `rgb(${returnarr.join()})`;
}

function darken(val, color) {
  let [lowest, middle, highest] = getSortedIndices(color);

  if (highest[0] === 0) {
    // console.log('Black hole');
    return;
  }

  let returnarr = [];

  returnarr[highest[1]] = Math.round(highest[0] - Math.min(highest[0], (5.1) * val));

  var incfrac = (highest[0] - returnarr[highest[1]]) / highest[0];
  returnarr[middle[1]] = Math.round(middle[0] - middle[0] * incfrac);
  returnarr[lowest[1]] = Math.round(lowest[0] - lowest[0] * incfrac);

  return `rgb(${returnarr.join()})`;
}

function getLinear() {
  let out = 'linear-gradient(';

  for (let i = 0; i < colors.length-1; i++) {
    out += colors[i] + ', ';
  }

  out += colors[colors.length-1] + ')';

  let modalmessage = document.querySelector('.modal-body');

  modalmessage.textContent = out;
}

function copytoclipboard() {
  var r = document.createRange();
  r.selectNode(document.querySelector('.modal-body'));
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(r);
  document.execCommand('copy');
  window.getSelection().removeAllRanges();
}
