(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var dom;

dom = {
  matches: function(node, selector) {
    return node.webkitMatchesSelector(selector);
  },
  all: function(selector, scope) {
    if (scope == null) {
      scope = document;
    }
    return Array.prototype.slice.apply(scope.querySelectorAll(selector));
  },
  one: function(selector, scope) {
    if (scope == null) {
      scope = document;
    }
    return scope.querySelector(selector);
  },
  closest: function(node, selector) {
    while (node !== document) {
      if (node.webkitMatchesSelector(selector)) {
        return node;
      }
      node = node.parentNode;
    }
  },
  children: function(node, selector) {
    if (selector == null) {
      selector = '*';
    }
    return Array.prototype.slice.apply(node.children).filter(function(child) {
      return child.webkitMatchesSelector(selector);
    });
  },
  find: function(node, selector) {
    return this.one(selector, node);
  },
  docDefer: function(selector, eventName, handler) {
    return document.addEventListener(eventName, function(event) {
      if (event.target.webkitMatchesSelector(selector)) {
        return handler(event);
      }
    });
  },
  trigger: function(eventName, node) {
    var event;
    event = new Event(eventName);
    return node.dispatchEvent(event);
  }
};

if (typeof module !== "undefined" && module !== null) {
  module.exports = dom;
} else {
  window.dom = dom;
}



},{}]},{},[1]);

},{}],2:[function(require,module,exports){
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var obj;

obj = {
  merge: function(dest, source) {
    var key, value;
    for (key in source) {
      value = source[key];
      Object.defineProperty(dest, key, {
        value: value,
        writable: true,
        enumerable: true,
        configurable: true
      });
    }
    return dest;
  },
  clone: function(obj) {
    var key, newObj, val;
    if ((typeof obj !== "object") || (obj instanceof RegExp)) {
      return obj;
    }
    newObj = {};
    for (key in obj) {
      val = obj[key];
      newObj[key] = this.clone(val);
    }
    return newObj;
  }
};

if (typeof module !== "undefined" && module !== null) {
  module.exports = obj;
} else {
  window.obj = obj;
}



},{}]},{},[1]);

},{}],3:[function(require,module,exports){
var ATTR_CSS_MAX_HEIGHT, ATTR_CSS_MAX_WIDTH, POSITIONS, Poptart, activePopover, availableSpace, baseFontSize, calculateMaxWidthPixelDimension, calculatePixelDimension, clickHandler, dom, nodeIsDescendantOfNode, nodeIsPopoverDescendant, nodeIsSourceDescendant, obj, oppositeOf, popoverDefaults, popoverPositioner, positionPopovers, positionTooltip, registeredSelectors, removePopovers, setPopoverHeight, setPopoverWidth, triggerPopover;

obj = require("bigfoot-obj");

dom = require("bigfoot-dom");

ATTR_CSS_MAX_WIDTH = "data-poptart-max-width";

ATTR_CSS_MAX_HEIGHT = "data-poptart-max-height";

POSITIONS = {
  BOTTOM: "bottom",
  TOP: "top"
};

registeredSelectors = {};

activePopover = {};

positionPopovers = void 0;

triggerPopover = function(source, settings) {
  var div, markup, popover;
  markup = settings.callback(source);
  div = document.createElement("div");
  div.innerHTML = markup;
  popover = div.firstChild;
  setTimeout(function() {
    var style;
    style = window.getComputedStyle(popover);
    setTimeout(function() {
      popover.setAttribute(ATTR_CSS_MAX_WIDTH, calculateMaxWidthPixelDimension(style.maxWidth));
      popover.setAttribute(ATTR_CSS_MAX_HEIGHT, calculateMaxWidthPixelDimension(style.maxHeight));
      popover.style.maxWidth = "none";
      positionPopovers = popoverPositioner(settings);
      positionPopovers();
      return popover.classList.add(settings.activeClass);
    }, 0);
    activePopover.popover = popover;
    activePopover.source = source;
    source.parentNode.appendChild(popover);
    window.addEventListener("resize", positionPopovers);
    return window.addEventListener("scroll", positionPopovers);
  }, 0);
  return popover;
};

removePopovers = function(settings) {
  var popover, posititionPopovers, remove;
  if (!activePopover.popover) {
    return;
  }
  popover = activePopover.popover;
  remove = function(event) {
    var _ref;
    return (_ref = popover.parentNode) != null ? _ref.removeChild(popover) : void 0;
  };
  popover.addEventListener("transitionend", remove);
  popover.addEventListener("webkitTransitionend", remove);
  popover.classList.remove("is-active");
  activePopover = {};
  posititionPopovers = void 0;
  window.removeEventListener("resize", positionPopovers);
  return window.removeEventListener("scroll", positionPopovers);
};

nodeIsDescendantOfNode = function(node, ancestorNode) {
  if (!ancestorNode) {
    return false;
  }
  while (node !== document.body) {
    if (node === ancestorNode) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
};

nodeIsPopoverDescendant = function(node) {
  return nodeIsDescendantOfNode(node, activePopover.popover);
};

nodeIsSourceDescendant = function(node) {
  return nodeIsDescendantOfNode(node, activePopover.source);
};

clickHandler = function(event) {
  var popover, tryTriggering;
  tryTriggering = !nodeIsSourceDescendant(event.target);
  if (activePopover.popover && !nodeIsPopoverDescendant(event.target)) {
    removePopovers();
  }
  if (tryTriggering) {
    popover = Popover.triggerPopoverFor(event.target);
    return !!popover;
  }
};

availableSpace = function(node) {
  var leftSpace, rect, source, topSpace, windowDimensions, _ref;
  rect = node.getBoundingClientRect();
  _ref = [rect.top + 0.5 * rect.height, rect.left + 0.5 * rect.width], topSpace = _ref[0], leftSpace = _ref[1];
  source = {
    height: rect.height,
    width: rect.width
  };
  windowDimensions = {
    height: window.innerHeight,
    width: window.innerWidth
  };
  return {
    top: topSpace,
    bottom: windowDimensions.height - topSpace,
    left: leftSpace,
    leftRelative: leftSpace / windowDimensions.width,
    right: windowDimensions.width - leftSpace,
    window: windowDimensions,
    source: source
  };
};

baseFontSize = function() {
  var el, size;
  el = document.createElement("div");
  el.style.cssText = "display:inline-block;padding:0;line-height:1;position:absolute;visibility:hidden;font-size:1em;";
  el.appendChild(document.createElement("M"));
  document.body.appendChild(el);
  size = el.offsetHeight;
  document.body.removeChild(el);
  return size;
};

calculateMaxWidthPixelDimension = function(dim, node) {
  return calculatePixelDimension(dim, node) || 10000;
};

calculatePixelDimension = function(dim, node, makeFFPercentageAdjustment) {
  if (makeFFPercentageAdjustment == null) {
    makeFFPercentageAdjustment = true;
  }
  if (dim === "none") {
    return 0;
  }
  if (dim.indexOf("rem") >= 0) {
    return parseFloat(dim) * baseFontSize();
  }
  if (dim.indexOf("em") >= 0) {
    return parseFloat(dim) * parseFloat(window.getComputedStyle(node).fontSize);
  }
  if (dim.indexOf("%") >= 0 || dim.indexOf("vw") >= 0) {
    return parseFloat(dim) / 100;
  }
  dim = parseFloat(dim);
  if (dim <= 60 && makeFFPercentageAdjustment) {
    dim = dim / parseFloat(node.parentNode.offsetWidth);
  }
  return dim;
};

oppositeOf = function(pos) {
  if (pos === POSITIONS.BOTTOM) {
    return POSITIONS.TOP;
  } else {
    return POSITIONS.BOTTOM;
  }
};

setPopoverWidth = function(maxWidthRelativeTo, preferredPosition) {
  var maxWidth, relativeToWidth, wrap;
  maxWidth = parseFloat(activePopover.popover.getAttribute(ATTR_CSS_MAX_WIDTH));
  wrap = dom.find(activePopover.popover, ".bigfoot-footnote__wrapper");
  if (maxWidth <= 1) {
    relativeToWidth = (function() {
      var el, userSpecifiedRelativeElWidth;
      userSpecifiedRelativeElWidth = 10000;
      if (maxWidthRelativeTo) {
        el = dom.one(maxWidthRelativeTo);
        if (el) {
          userSpecifiedRelativeElWidth = el.offsetWidth;
        }
      }
      return Math.min(window.innerWidth, userSpecifiedRelativeElWidth);
    })();
    maxWidth = relativeToWidth * maxWidth;
  }
  maxWidth = Math.min(maxWidth, dom.find(activePopover.popover, ".bigfoot-footnote__content").offsetWidth + 1);
  return wrap.style.maxWidth = "" + maxWidth + "px";
};

setPopoverHeight = function(space, position) {
  var content, marginSize, maxHeight, opposite, popover, popoverHeight, popoverStyles, transformOrigin;
  maxHeight = parseFloat(activePopover.popover.getAttribute(ATTR_CSS_MAX_HEIGHT));
  popover = activePopover.popover;
  popoverStyles = window.getComputedStyle(popover);
  marginSize = calculatePixelDimension(popoverStyles.marginTop, popover, false) + calculatePixelDimension(popoverStyles.marginBottom, popover, false);
  popoverHeight = popover.offsetHeight + marginSize;
  opposite = oppositeOf(position);
  if (space[position] < popoverHeight && space[position] < space[opposite]) {
    position = opposite;
  }
  transformOrigin = "" + (space.leftRelative * 100) + "% top 0";
  if (position === POSITIONS.TOP) {
    popover.classList.add("is-positioned-top");
    popover.classList.remove("is-positioned-bottom");
    maxHeight = Math.min(maxHeight, space.top - marginSize);
    transformOrigin = "" + (space.leftRelative * 100) + "% bottom 0";
  } else {
    popover.classList.add("is-positioned-bottom");
    popover.classList.remove("is-positioned-top");
    maxHeight = Math.min(maxHeight, space.bottom - marginSize);
  }
  popover.style.transformOrigin = transformOrigin;
  content = dom.find(popover, ".bigfoot-footnote__content");
  return content.style.maxHeight = "" + maxHeight + "px";
};

positionTooltip = function(space, popover) {
  var tooltip;
  tooltip = dom.find(activePopover.popover, ".bigfoot-footnote__tooltip");
  if (tooltip) {
    return tooltip.style.left = "" + (popover.offsetWidth * space.leftRelative + 2) + "px";
  }
};

popoverPositioner = function(settings) {
  return function(event) {
    var popover, source, sourceStyles, space, type, _ref;
    type = (event != null ? event.type : void 0) || "resize";
    if (!(settings.positionPopovers && activePopover.popover)) {
      return;
    }
    _ref = [activePopover.popover, activePopover.source], popover = _ref[0], source = _ref[1];
    sourceStyles = window.getComputedStyle(source);
    space = availableSpace(source);
    setPopoverHeight(space, settings.preferredPosition);
    if (type === "resize") {
      setPopoverWidth(settings.maxWidthRelativeTo);
    }
    positionTooltip(space, popover);
    return popover.style.marginLeft = "" + (-1 * space.leftRelative * popover.offsetWidth + space.source.width / 2 + calculatePixelDimension(sourceStyles.marginLeft, source)) + "px";
  };
};

popoverDefaults = {
  preferredPosition: POSITIONS.BOTTOM,
  positionPopovers: true,
  debounce: false,
  preventPageScroll: true,
  activeClass: "is-active",
  inactiveClass: "popover--is-inactive"
};

Poptart = (function() {
  function Poptart() {}

  Poptart.POSITIONS = POSITIONS;

  Poptart.registerPopover = function(selector, options, callback) {
    var settings;
    if (typeof options === "function") {
      options = {
        callback: options
      };
    } else {
      options.callback = options;
    }
    settings = obj.merge(obj.clone(popoverDefaults), options);
    return registeredSelectors[selector] = settings;
  };

  Poptart.triggerPopoverFor = function(node) {
    var selector, setting, settings;
    settings = void 0;
    for (selector in registeredSelectors) {
      setting = registeredSelectors[selector];
      if (event.target.webkitMatchesSelector(selector)) {
        settings = setting;
        break;
      }
    }
    if (settings) {
      return triggerPopover(node, settings);
    }
  };

  return Poptart;

})();

document.addEventListener("click", clickHandler);

document.addEventListener("touchend", clickHandler);

if (typeof module !== "undefined" && module !== null) {
  module.exports = Poptart;
}

if (typeof window !== "undefined" && window !== null) {
  window.Poptart = Poptart;
}



},{"bigfoot-dom":1,"bigfoot-obj":2}],4:[function(require,module,exports){




},{}]},{},[3,4]);
