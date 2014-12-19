obj = require("bigfoot-obj")
dom = require("bigfoot-dom")

ATTR_CSS_MAX_WIDTH = "data-poptart-max-width"
ATTR_CSS_MAX_HEIGHT = "data-poptart-max-height"

POSITIONS =
  BOTTOM: "bottom"
  TOP: "top"

registeredSelectors = {}
activePopover = {}
positionPopovers = undefined

triggerPopover = (source, settings) ->
  markup = settings.callback(source)

  div = document.createElement("div")
  div.innerHTML = markup
  popover = div.firstChild

  setTimeout ->
    style = window.getComputedStyle(popover)
    setTimeout ->
      popover.setAttribute(ATTR_CSS_MAX_WIDTH, calculateMaxWidthPixelDimension(style.maxWidth))
      popover.setAttribute(ATTR_CSS_MAX_HEIGHT, calculateMaxWidthPixelDimension(style.maxHeight))

      popover.style.maxWidth = "none"

      positionPopovers = popoverPositioner(settings)
      positionPopovers()

      popover.classList.add(settings.activeClass)
    , 0

    activePopover.popover = popover
    activePopover.source = source
    source.parentNode.appendChild(popover)

    window.addEventListener "resize", positionPopovers
    window.addEventListener "scroll", positionPopovers
  , 0

  popover

removePopovers = (settings) ->
  return unless activePopover.popover

  popover = activePopover.popover
  remove = (event) ->
    popover.parentNode?.removeChild(popover)

  popover.addEventListener "transitionend", remove
  popover.addEventListener "webkitTransitionend", remove
  popover.classList.remove("is-active")

  activePopover = {}

  posititionPopovers = undefined

  window.removeEventListener "resize", positionPopovers
  window.removeEventListener "scroll", positionPopovers

nodeIsDescendantOfNode = (node, ancestorNode) ->
  return false unless ancestorNode

  while node != document.body
    return true if node == ancestorNode
    node = node.parentNode

  false

nodeIsPopoverDescendant = (node) -> nodeIsDescendantOfNode(node, activePopover.popover)
nodeIsSourceDescendant = (node) -> nodeIsDescendantOfNode(node, activePopover.source)

clickHandler = (event) ->
  tryTriggering = !nodeIsSourceDescendant(event.target)
  if activePopover.popover && !nodeIsPopoverDescendant(event.target)
    removePopovers()

  if tryTriggering
    popover = Popover.triggerPopoverFor(event.target)
    !!popover # prevent default if a popover was triggered

availableSpace = (node) ->
  rect = node.getBoundingClientRect()
  [topSpace, leftSpace] = [rect.top + 0.5 * rect.height, rect.left + 0.5 * rect.width]

  source =
    height: rect.height
    width: rect.width

  windowDimensions =
    height: window.innerHeight
    width: window.innerWidth

  top: topSpace
  bottom: windowDimensions.height - topSpace
  left: leftSpace
  leftRelative: leftSpace / windowDimensions.width
  right: windowDimensions.width - leftSpace
  window: windowDimensions
  source: source

#*
# Calculates the base font size for `em`- and `rem`-based sizing.
#
# @author Chris Sauve (lemonmade)
# @since 0.0.1
# @access private
# @returns {Number} - The base font size in pixels.

baseFontSize = ->
  el = document.createElement("div")
  el.style.cssText = "display:inline-block;padding:0;line-height:1;position:absolute;visibility:hidden;font-size:1em;"
  el.appendChild(document.createElement("M"))
  document.body.appendChild(el)
  size = el.offsetHeight
  document.body.removeChild(el)

  size

calculateMaxWidthPixelDimension = (dim, node) ->
  calculatePixelDimension(dim, node) || 10000

calculatePixelDimension = (dim, node, makeFFPercentageAdjustment = true) ->
  # No value set, make it non-restricting
  return 0 if dim == "none"
  return parseFloat(dim) * baseFontSize() if dim.indexOf("rem") >= 0
  return parseFloat(dim) * parseFloat(window.getComputedStyle(node).fontSize) if dim.indexOf("em") >= 0
  return parseFloat(dim) / 100 if dim.indexOf("%") >= 0 || dim.indexOf("vw") >= 0

  # Set in px
  dim = parseFloat(dim)

  # Weird issue in FF where %-based widths would be resolved
  # to px before being reported. Assume that smallest possible
  # expicitly-set max width is 60px, otherwise, it's the result
  # of this calculation.
  dim = dim / parseFloat(node.parentNode.offsetWidth) if dim <= 60 && makeFFPercentageAdjustment
  dim

oppositeOf = (pos) ->
  if pos == POSITIONS.BOTTOM then POSITIONS.TOP else POSITIONS.BOTTOM

setPopoverWidth = (maxWidthRelativeTo, preferredPosition) ->
  maxWidth = parseFloat(activePopover.popover.getAttribute(ATTR_CSS_MAX_WIDTH))
  wrap = dom.find(activePopover.popover, ".bigfoot-footnote__wrapper")

  if maxWidth <= 1
    # Max width in CSS set as a percentage

    # If a relative element has been set for max width, the actual max width
    # by which to multiply the percentage is the lesser of the element's width
    # and the width of the viewport
    relativeToWidth = do ->
      # Width of user-specified element width, set to non-constraining
      # value in case it does not exist
      userSpecifiedRelativeElWidth = 10000

      if maxWidthRelativeTo
        el = dom.one(maxWidthRelativeTo)
        userSpecifiedRelativeElWidth = el.offsetWidth if el

      Math.min(window.innerWidth, userSpecifiedRelativeElWidth)

    # Applicable constraining width times the percentage in CSS
    maxWidth = relativeToWidth * maxWidth

  # Set the max width to the smaller of the calculated width based on the
  # percentage/ other value and the width of the actual content (prevents
  # excess width for small footnotes)
  maxWidth = Math.min(maxWidth, dom.find(activePopover.popover, ".bigfoot-footnote__content").offsetWidth + 1)

  # Set this on the main wrapper. This allows the bigfoot-footnote div
  # to be displayed as inline-block, wrapping it around the content.
  wrap.style.maxWidth = "#{maxWidth}px"

setPopoverHeight = (space, position) ->
  maxHeight = parseFloat(activePopover.popover.getAttribute(ATTR_CSS_MAX_HEIGHT))
  popover = activePopover.popover
  popoverStyles = window.getComputedStyle(popover)

  marginSize = calculatePixelDimension(popoverStyles.marginTop, popover, false) + calculatePixelDimension(popoverStyles.marginBottom, popover, false)
  popoverHeight = popover.offsetHeight + marginSize

  opposite = oppositeOf(position)
  position = opposite if space[position] < popoverHeight && space[position] < space[opposite]
  transformOrigin = "#{space.leftRelative * 100}% top 0"

  if position == POSITIONS.TOP
    popover.classList.add("is-positioned-top")
    popover.classList.remove("is-positioned-bottom")
    maxHeight = Math.min(maxHeight, space.top - marginSize)
    transformOrigin = "#{space.leftRelative * 100}% bottom 0"
  else
    popover.classList.add("is-positioned-bottom")
    popover.classList.remove("is-positioned-top")
    maxHeight = Math.min(maxHeight, space.bottom - marginSize)

  popover.style.transformOrigin = transformOrigin

  content = dom.find(popover, ".bigfoot-footnote__content")
  content.style.maxHeight = "#{maxHeight}px"

positionTooltip = (space, popover) ->
  tooltip = dom.find(activePopover.popover, ".bigfoot-footnote__tooltip")
  tooltip.style.left = "#{popover.offsetWidth * space.leftRelative + 2}px" if tooltip

popoverPositioner = (settings) ->
  (event) ->
    type = event?.type || "resize"
    return unless settings.positionPopovers && activePopover.popover

    [popover, source] = [activePopover.popover, activePopover.source]
    sourceStyles = window.getComputedStyle(source)
    space = availableSpace(source)

    setPopoverHeight(space, settings.preferredPosition)
    setPopoverWidth(settings.maxWidthRelativeTo) if type == "resize"

    positionTooltip(space, popover)
    popover.style.marginLeft = "#{-1 * space.leftRelative * popover.offsetWidth + space.source.width / 2 + calculatePixelDimension(sourceStyles.marginLeft, source)}px"

popoverDefaults =
  preferredPosition: POSITIONS.BOTTOM
  positionPopovers: true
  debounce: false
  preventPageScroll: true
  activeClass: "is-active"
  inactiveClass: "popover--is-inactive"

class Poptart
  @POSITIONS = POSITIONS

  @registerPopover: (selector, options, callback) ->
    if typeof options == "function"
      options =
        callback: options
    else
      options.callback = options

    settings = obj.merge(obj.clone(popoverDefaults), options)
    registeredSelectors[selector] = settings

  @triggerPopoverFor: (node) ->
    settings = undefined
    for selector, setting of registeredSelectors
      if event.target.webkitMatchesSelector(selector)
        settings = setting
        break

    triggerPopover(node, settings) if settings

document.addEventListener "click", clickHandler
document.addEventListener "touchend", clickHandler

module.exports = Poptart
