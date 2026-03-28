/**
 * Liquid Glass - SVG Refraction Effect
 * Adapted from liquid-glass-main for PepMax dark theme
 * Uses feDisplacementMap + backdrop-filter for zero-cost rendering after init
 */
(function () {
  'use strict';

  // =============================================
  // Surface height functions
  // =============================================
  var SURFACE_FNS = {
    convex_squircle: function (x) {
      return Math.pow(1 - Math.pow(1 - x, 4), 0.25);
    },
    convex_circle: function (x) {
      return Math.sqrt(1 - (1 - x) * (1 - x));
    },
    concave: function (x) {
      return 1 - Math.sqrt(1 - (1 - x) * (1 - x));
    },
    lip: function (x) {
      var convex = Math.pow(1 - Math.pow(1 - Math.min(x * 2, 1), 4), 0.25);
      var concave = 1 - Math.sqrt(1 - (1 - x) * (1 - x)) + 0.1;
      var t = 6 * Math.pow(x, 5) - 15 * Math.pow(x, 4) + 10 * Math.pow(x, 3);
      return convex * (1 - t) + concave * t;
    }
  };

  // =============================================
  // Core generation functions
  // =============================================
  function calculateRefractionProfile(glassThickness, bezelWidth, heightFn, ior, samples) {
    samples = samples || 128;
    var eta = 1 / ior;

    function refract(nx, ny) {
      var dot = ny;
      var k = 1 - eta * eta * (1 - dot * dot);
      if (k < 0) return null;
      var sq = Math.sqrt(k);
      return [-(eta * dot + sq) * nx, eta - (eta * dot + sq) * ny];
    }

    var profile = new Float64Array(samples);
    for (var i = 0; i < samples; i++) {
      var x = i / samples;
      var y = heightFn(x);
      var dx = x < 1 ? 0.0001 : -0.0001;
      var y2 = heightFn(x + dx);
      var deriv = (y2 - y) / dx;
      var mag = Math.sqrt(deriv * deriv + 1);
      var ref = refract(-deriv / mag, -1 / mag);
      if (!ref) {
        profile[i] = 0;
        continue;
      }
      profile[i] = ref[0] * ((y * bezelWidth + glassThickness) / ref[1]);
    }
    return profile;
  }

  function generateDisplacementMap(w, h, radius, bezelWidth, profile, maxDisp) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    var ctx = c.getContext('2d');
    var img = ctx.createImageData(w, h);
    var d = img.data;

    for (var i = 0; i < d.length; i += 4) {
      d[i] = 128;
      d[i + 1] = 128;
      d[i + 2] = 0;
      d[i + 3] = 255;
    }

    var r = radius;
    var rSq = r * r;
    var r1Sq = (r + 1) * (r + 1);
    var rBSq = Math.max(r - bezelWidth, 0);
    rBSq = rBSq * rBSq;
    var wB = w - r * 2;
    var hB = h - r * 2;
    var S = profile.length;

    for (var y1 = 0; y1 < h; y1++) {
      for (var x1 = 0; x1 < w; x1++) {
        var x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
        var y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
        var dSq = x * x + y * y;
        if (dSq > r1Sq || dSq < rBSq) continue;
        var dist = Math.sqrt(dSq);
        var fromSide = r - dist;
        var op = dSq < rSq ? 1 : 1 - (dist - Math.sqrt(rSq)) / (Math.sqrt(r1Sq) - Math.sqrt(rSq));
        if (op <= 0 || dist === 0) continue;
        var cos = x / dist;
        var sin = y / dist;
        var bi = Math.min(((fromSide / bezelWidth) * S) | 0, S - 1);
        var disp = profile[bi] || 0;
        var dX = (-cos * disp) / maxDisp;
        var dY = (-sin * disp) / maxDisp;
        var idx = (y1 * w + x1) * 4;
        d[idx] = (128 + dX * 127 * op + 0.5) | 0;
        d[idx + 1] = (128 + dY * 127 * op + 0.5) | 0;
      }
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL();
  }

  function generateSpecularMap(w, h, radius, bezelWidth, angle) {
    angle = angle != null ? angle : Math.PI / 3;
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    var ctx = c.getContext('2d');
    var img = ctx.createImageData(w, h);
    var d = img.data;
    d.fill(0);

    var r = radius;
    var rSq = r * r;
    var r1Sq = (r + 1) * (r + 1);
    var rBSq = Math.max(r - bezelWidth, 0);
    rBSq = rBSq * rBSq;
    var wB = w - r * 2;
    var hB = h - r * 2;
    var sv = [Math.cos(angle), Math.sin(angle)];

    for (var y1 = 0; y1 < h; y1++) {
      for (var x1 = 0; x1 < w; x1++) {
        var x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
        var y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
        var dSq = x * x + y * y;
        if (dSq > r1Sq || dSq < rBSq) continue;
        var dist = Math.sqrt(dSq);
        var fromSide = r - dist;
        var op = dSq < rSq ? 1 : 1 - (dist - Math.sqrt(rSq)) / (Math.sqrt(r1Sq) - Math.sqrt(rSq));
        if (op <= 0 || dist === 0) continue;
        var cos = x / dist;
        var sin = -y / dist;
        var dot = Math.abs(cos * sv[0] + sin * sv[1]);
        var edge = Math.sqrt(Math.max(0, 1 - (1 - fromSide) * (1 - fromSide)));
        var coeff = dot * edge;
        var col = (255 * coeff) | 0;
        var alpha = (col * coeff * op) | 0;
        var idx = (y1 * w + x1) * 4;
        d[idx] = col;
        d[idx + 1] = col;
        d[idx + 2] = col;
        d[idx + 3] = alpha;
      }
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL();
  }

  // =============================================
  // SVG defs management
  // =============================================
  var defsEl = null;
  var filterId = 0;

  function ensureDefs() {
    if (defsEl) return defsEl;
    var container = document.getElementById('lg-svg-container');
    if (!container) {
      container = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      container.id = 'lg-svg-container';
      container.setAttribute('class', 'lg-svg-defs');
      container.setAttribute('width', '0');
      container.setAttribute('height', '0');
      container.setAttribute('aria-hidden', 'true');
      var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.id = 'lg-defs';
      container.appendChild(defs);
      document.body.appendChild(container);
    }
    defsEl = container.querySelector('#lg-defs');
    return defsEl;
  }

  function getNextFilterId() {
    return 'lg-filter-' + (++filterId);
  }

  // =============================================
  // Build SVG filter for an element
  // =============================================
  function buildFilter(id, w, h, opts) {
    var thickness = opts.thickness || 40;
    var bezel = opts.bezel || 30;
    var ior = opts.ior || 2.0;
    var blur = opts.blur || 0.2;
    var specularOpacity = opts.specular || 0.35;
    var scaleRatio = opts.scaleRatio || 1.0;
    var surface = opts.surface || 'convex_squircle';
    var radius = opts.radius || Math.min(w, h) / 2;

    var heightFn = SURFACE_FNS[surface] || SURFACE_FNS.convex_squircle;
    var clampedBezel = Math.min(bezel, radius - 1, Math.min(w, h) / 2 - 1);
    if (clampedBezel < 1) clampedBezel = 1;

    var profile = calculateRefractionProfile(thickness, clampedBezel, heightFn, ior, 128);
    var maxDisp = 1;
    for (var i = 0; i < profile.length; i++) {
      var absVal = Math.abs(profile[i]);
      if (absVal > maxDisp) maxDisp = absVal;
    }

    var dispUrl = generateDisplacementMap(w, h, radius, clampedBezel, profile, maxDisp);
    var specUrl = generateSpecularMap(w, h, radius, clampedBezel * 2.5);
    var scale = maxDisp * scaleRatio;

    var filterMarkup =
      '<filter id="' + id + '" x="0%" y="0%" width="100%" height="100%">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="' + blur + '" result="blurred_source" />' +
      '<feImage href="' + dispUrl + '" x="0" y="0" width="' + w + '" height="' + h + '" result="disp_map" />' +
      '<feDisplacementMap in="blurred_source" in2="disp_map" scale="' + scale + '" xChannelSelector="R" yChannelSelector="G" result="displaced" />' +
      '<feColorMatrix in="displaced" type="saturate" values="1.1" result="displaced_sat" />' +
      '<feImage href="' + specUrl + '" x="0" y="0" width="' + w + '" height="' + h + '" result="spec_layer" />' +
      '<feComposite in="displaced_sat" in2="spec_layer" operator="in" result="spec_masked" />' +
      '<feComponentTransfer in="spec_layer" result="spec_faded">' +
      '<feFuncA type="linear" slope="' + specularOpacity + '" />' +
      '</feComponentTransfer>' +
      '<feBlend in="spec_masked" in2="displaced" mode="normal" result="with_sat" />' +
      '<feBlend in="spec_faded" in2="with_sat" mode="normal" />' +
      '</filter>';

    return { markup: filterMarkup, specUrl: specUrl, specularOpacity: specularOpacity };
  }

  // =============================================
  // Chromium detection
  // =============================================
  function isSupported() {
    var ua = navigator.userAgent;
    // Check for Chromium-based browsers (Chrome, Edge, Opera, Brave, etc.)
    var isChromium = !!window.chrome || /Chrome\//.test(ua);
    // Exclude non-Chromium Edge
    var isOldEdge = /Edg\//.test(ua) === false && /Edge\//.test(ua);
    // Check for reduced motion preference
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return isChromium && !isOldEdge && !prefersReducedMotion;
  }

  // =============================================
  // LiquidGlass.create()
  // =============================================
  function create(element, options) {
    if (!element || !element.offsetWidth) return null;

    options = options || {};
    var w = element.offsetWidth;
    var h = element.offsetHeight;

    if (w < 4 || h < 4) return null;

    var id = getNextFilterId();
    var defs = ensureDefs();
    var result = buildFilter(id, w, h, options);

    // Insert filter into SVG defs
    // SECURITY NOTE: innerHTML used here with internally-generated SVG filter markup (never user input).
    // Replacing with DOM API would require parsing complex SVG filter chains. Risk is theoretical only.
    var temp = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    temp.innerHTML = result.markup;
    var filterNode = temp.firstChild;
    defs.appendChild(filterNode);

    // Apply classes and filter reference
    element.classList.add('liquid-glass');
    element.setAttribute('data-lg-filter', id);
    element.style.setProperty('--lg-filter', 'url(#' + id + ')');

    // Add specular highlight overlay
    var specEl = document.createElement('div');
    specEl.className = 'lg-specular';
    specEl.style.backgroundImage = 'url(' + result.specUrl + ')';
    specEl.style.opacity = result.specularOpacity;
    element.appendChild(specEl);

    // ResizeObserver for responsive updates
    var resizeTimer = null;
    var observer = null;

    if (window.ResizeObserver) {
      observer = new ResizeObserver(function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          var newW = element.offsetWidth;
          var newH = element.offsetHeight;
          if (newW === w && newH === h) return;
          if (newW < 4 || newH < 4) return;
          w = newW;
          h = newH;

          var newResult = buildFilter(id, w, h, options);
          filterNode.outerHTML = newResult.markup;
          // Re-query the filter node after replacement
          filterNode = defs.querySelector('#' + id);
          specEl.style.backgroundImage = 'url(' + newResult.specUrl + ')';
        }, 250);
      });
      observer.observe(element);
    }

    // Return controller
    return {
      id: id,
      element: element,
      destroy: function () {
        if (observer) observer.disconnect();
        clearTimeout(resizeTimer);
        element.classList.remove('liquid-glass');
        element.removeAttribute('data-lg-filter');
        element.style.removeProperty('--lg-filter');
        if (specEl.parentNode) specEl.parentNode.removeChild(specEl);
        if (filterNode && filterNode.parentNode) filterNode.parentNode.removeChild(filterNode);
      }
    };
  }

  // =============================================
  // LiquidGlass.createOnHover()
  // =============================================
  function createOnHover(element, options) {
    if (!element) return null;

    var controller = null;

    function onEnter() {
      if (!controller) {
        controller = create(element, options);
      }
    }

    function onLeave() {
      if (controller) {
        controller.destroy();
        controller = null;
      }
    }

    element.addEventListener('mouseenter', onEnter);
    element.addEventListener('mouseleave', onLeave);

    return {
      element: element,
      destroy: function () {
        element.removeEventListener('mouseenter', onEnter);
        element.removeEventListener('mouseleave', onLeave);
        if (controller) {
          controller.destroy();
          controller = null;
        }
      }
    };
  }

  // =============================================
  // Apply fallback for unsupported browsers
  // =============================================
  function applyFallback(element) {
    element.classList.add('liquid-glass');
    element.classList.add('liquid-glass--fallback');
    return {
      element: element,
      destroy: function () {
        element.classList.remove('liquid-glass', 'liquid-glass--fallback');
      }
    };
  }

  // =============================================
  // Expose API
  // =============================================
  window.LiquidGlass = {
    isSupported: isSupported,
    create: create,
    createOnHover: createOnHover,
    applyFallback: applyFallback,
    SURFACE_FNS: SURFACE_FNS
  };
})();
