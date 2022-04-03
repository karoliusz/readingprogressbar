'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var rxjs = require('rxjs');
var operators = require('rxjs/operators');

const DEFAULT_OPTIONS = {
  contentContainerClassName: "blogPost",
  cssClass: "readingProgressBar",
  throttleTimeMs: 0
};
const CLASS_NAMES = {
  progressBarElement: "readingProgressBar",
  trackElement: "readingProgressBar__track"
};

class Viewport {
  viewportChange$;
  scroll$ = null;
  resize$ = null;
  activeContainer$ = null;
  lastActiveContainer$ = null;
  viewportHeight = null;
  trackedContainers = /* @__PURE__ */ new Set();
  constructor(throttleTimeMs, trackedContainers = []) {
    let activeContainer = null;
    this.updateViewportHeight();
    if (trackedContainers) {
      this.addTrackedContainers(trackedContainers);
      activeContainer = this.getActiveContainer();
    }
    this.viewportChange$ = new rxjs.BehaviorSubject({
      activeContainerId: activeContainer ? activeContainer.id : null,
      scrollPercentage: activeContainer ? this.calculateScrollPercentage(activeContainer) : 0
    });
    this.scroll$ = rxjs.fromEvent(window, "scroll");
    this.resize$ = rxjs.fromEvent(window, "resize").pipe(operators.debounceTime(300), operators.tap(() => this.updateViewportHeight()));
    this.activeContainer$ = rxjs.merge(this.scroll$, this.resize$).pipe(operators.throttleTime(throttleTimeMs, null, {
      trailing: true,
      leading: false
    }), operators.map(() => this.getActiveContainer()));
    this.lastActiveContainer$ = this.activeContainer$.pipe(operators.filter((container) => !!container), operators.distinctUntilKeyChanged("id"));
    rxjs.combineLatest([this.activeContainer$, this.lastActiveContainer$]).pipe(operators.map((data) => this.getViewportState(...data))).subscribe((data) => this.viewportChange$.next(data));
  }
  addTrackedContainer(container) {
    const trackedContainer = {
      ...container,
      position: this.getContainerPosition(container.element)
    };
    this.trackedContainers.add(trackedContainer);
    return Array.from(this.trackedContainers);
  }
  addTrackedContainers(containers) {
    containers.forEach((container) => this.addTrackedContainer(container));
    return Array.from(this.trackedContainers);
  }
  removeTrackedContainer(containerId) {
    const trackedContainers = this.trackedContainers;
    const containerToRemove = Array.from(trackedContainers).find(({ id }) => id === containerId);
    if (containerToRemove) {
      return this.trackedContainers.delete(containerToRemove);
    }
    return false;
  }
  clearTrackedContainers() {
    this.trackedContainers.clear();
  }
  getActiveContainer() {
    const trackedContainers = Array.from(this.trackedContainers);
    return trackedContainers.find((container) => this.isActive(container));
  }
  getViewportState(activeContainer, lastActiveContainer) {
    let scrollPercentage = activeContainer ? this.calculateScrollPercentage(activeContainer) : 0;
    if (lastActiveContainer && !activeContainer) {
      scrollPercentage = this.scrolledPast(lastActiveContainer) ? 100 : 0;
    }
    return {
      activeContainerId: activeContainer ? activeContainer.id : null,
      scrollPercentage
    };
  }
  calculateScrollPercentage(container) {
    const viewportTopPos = this.getScrollY();
    const viewportBottomPos = viewportTopPos + this.viewportHeight;
    const isActive = this.isActive(container);
    const isInInitialView = container.position.top < this.viewportHeight;
    if (isActive && isInInitialView) {
      const totalScrollDistance = container.position.bottom - this.viewportHeight;
      const scrolledDistance = totalScrollDistance - (container.position.bottom - viewportBottomPos);
      return Math.round(scrolledDistance / totalScrollDistance * 1e3) / 10;
    } else if (isActive) {
      const containerHeight = container.position.bottom - container.position.top;
      const remainingDistance = container.position.bottom - viewportBottomPos;
      const scrolledDistance = containerHeight - remainingDistance;
      return Math.round(scrolledDistance / containerHeight * 1e3) / 10;
    }
    return null;
  }
  isActive({ position }) {
    const viewportTopPos = this.getScrollY();
    const viewportBottomPos = viewportTopPos + this.viewportHeight;
    const containerTopEdgeBelowViewport = position.top > viewportBottomPos;
    const containerBottomEdgeBelowViewport = position.bottom > viewportBottomPos;
    return !containerTopEdgeBelowViewport && containerBottomEdgeBelowViewport;
  }
  scrolledPast(container) {
    const viewportTopPos = this.getScrollY();
    const viewportBottomPos = viewportTopPos + this.viewportHeight;
    const containerBottomAboveViewportBottom = container.position.bottom < viewportBottomPos;
    return containerBottomAboveViewportBottom;
  }
  getContainerPosition(element) {
    const rect = element.getBoundingClientRect();
    const scrollY = this.getScrollY();
    return {
      top: rect.top + scrollY,
      bottom: rect.bottom + scrollY
    };
  }
  updateViewportHeight() {
    const documentElement = document.documentElement;
    this.viewportHeight = documentElement.clientHeight;
  }
  getScrollY() {
    return window.scrollY;
  }
}

class ProgressBar {
  constructor(element, options) {
    this.element = element;
    this.options = options;
    this.initialize();
  }
  progressBarTrack;
  value = 0;
  setStatePercentage(value) {
    let newValue = value;
    if (value > 100) {
      newValue = 100;
    } else if (newValue < 0) {
      newValue = 0;
    }
    this.applyState(newValue);
  }
  dispose() {
    this.progressBarTrack.remove();
    this.progressBarTrack = null;
    this.element.classList.remove(CLASS_NAMES.progressBarElement);
    if (this.options.cssClass) {
      this.element.classList.remove(this.options.cssClass);
    }
    this.element = null;
  }
  applyState(value) {
    this.value = value;
    requestAnimationFrame(() => {
      this.progressBarTrack.style.width = `${value}%`;
    });
  }
  initialize() {
    const progressBarTrack = document.createElement("div");
    progressBarTrack.classList.add(CLASS_NAMES.trackElement);
    this.element.classList.add(this.options.cssClass);
    this.element.classList.add(CLASS_NAMES.progressBarElement);
    this.element.appendChild(progressBarTrack);
    this.progressBarTrack = progressBarTrack;
  }
}

class ReadingProgressBar {
  viewport;
  progressBar;
  options;
  constructor(element, options = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.progressBar = new ProgressBar(element, this.options);
    this.viewport = new Viewport(this.options.throttleTimeMs, this.getTrackedContainers(this.options.contentContainerClassName));
    this.reset();
    this.viewport.viewportChange$.subscribe(({ scrollPercentage }) => {
      this.progressBar.setStatePercentage(scrollPercentage);
    });
  }
  reset() {
    this.redetectContentContainers();
  }
  redetectContentContainers() {
    const { contentContainerClassName } = this.options;
    this.viewport.addTrackedContainers(this.getTrackedContainers(contentContainerClassName));
  }
  getTrackedContainers(contentContainerClassName) {
    const containers = document.getElementsByClassName(contentContainerClassName);
    const containersToTrack = Array.from(containers).map((element, index) => ({
      id: index,
      element
    }));
    return containersToTrack;
  }
}

exports.ReadingProgressBar = ReadingProgressBar;
//# sourceMappingURL=readingprogressbar.js.map
