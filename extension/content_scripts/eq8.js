(function () {
  // const _exampleState = {
  //   enabled: true,
  //   filters: [
  //     {
  //       id: 1,
  //       type: 'peaking',
  //       q: 1.0,
  //       frequency: 64,
  //       gain: 5.0,
  //       enabled: true
  //     },
  //     {
  //       id: 2,
  //       type: 'notch',
  //       q: 2.0,
  //       frequency: 640,
  //       gain: -5.0,
  //       enabled: false
  //     }
  //     // ...etc.
  //   ]
  // };

  class EQ8 {
    constructor () {
      this.WebAudioContext = (window.AudioContext || window.webkitAudioContext);
      this.DOMMutationObserver = (window.MutationObserver || window.webkitMutationObserver);
      this.pipelines = new Set();
      this.state = {};
      this.observer = null;
    }

    arrangeFilters (pipeline) {
      const { context, source, filters } = pipeline;
      filters.sort((a, b) => b.filter.frequency - a.filter.frequency);
      const enabledFilters = filters.filter(f => f.enabled);
      enabledFilters.forEach((f, ix, arr) => {
        if (ix > 0) enabledFilters[ix - 1].filter.connect(f.filter);
        if (ix === arr.length - 1) f.filter.connect(context.destination);
      });
      source.connect(this.state.enabled && enabledFilters.length ? enabledFilters[0].filter : context.destination);
    }

    createPipelineForElement (element) {
      const { filters } = this.state;
      const context = new this.WebAudioContext();
      const source = context.createMediaElementSource(element);
      const elFilters = [];
      filters.forEach((filter) => {
        const f = context.createBiquadFilter();
        const { frequency, q, gain, type, enabled, id } = filter;
        f.frequency.value = frequency;
        f.Q.value = q;
        f.gain.value = gain;
        f.type = type;
        elFilters.push({ filter: f, enabled, id });
      });
      const pipeline = { context, source, filters: elFilters };
      this.arrangeFilters(pipeline);
      this.pipelines.add(pipeline);
    }

    updatePipelines () {
      this.pipelines.forEach(({ context, source, filters }) => {
        this.state.filters.forEach(f => {
          const entry = filters.find(i => i.id === f.id);
          const filter = entry.filter;
          filter.frequency.value = f.frequency;
          filter.type = f.type;
          filter.Q.value = f.q;
          filter.gain.value = f.gain;
          entry.enabled = f.enabled;
        });
        source.disconnect();
        filters.forEach(f => f.filter.disconnect());
        this.arrangeFilters({ context, source, filters });
      });
    }

    onMessage (msg) {
      if (msg.type === 'SET::STATE') {
        this.state = msg.state;
        this.updatePipelines();
      }
    }

    domMutated () {
      const mediaElements = ([...document.body.querySelectorAll('video')])
        .concat([...document.body.querySelectorAll('audio')]);

      mediaElements
        .filter(el => !el.eq8)
        .forEach(el => {
          console.log('eq8: new audio source discovered');
          el.eq8 = true;
          this.createPipelineForElement(el);
        });
      // TODO: technically there's a memory leak here because if a media element is removed from the page, we don't stop tracking it
    }

    throttle (func, threshold, context) {
      if (!threshold || threshold < 0) threshold = 250;
      let last;
      let deferred;
      return function () {
        const self = context || this;
        const now = +new Date();
        const args = arguments;
        if (last && now < last + threshold) {
          clearTimeout(deferred);
          deferred = setTimeout(function () {
            last = now;
            func.apply(self, args);
          }, threshold);
        } else {
          last = now;
          func.apply(self, args);
        }
      };
    }

    attach () {
      const port = browser.runtime.connect({ name: 'eq8' });
      const listener = this.onMessage.bind(this);
      port.onMessage.addListener(listener);

      browser.runtime.sendMessage({ type: 'GET::STATE' }).then(initialState => {
        this.state = initialState;
        const domListener = this.throttle(this.domMutated.bind(this));
        this.observer = new this.DOMMutationObserver(domListener);
        this.observer.observe(document.body, { childList: true, subtree: true });
      });
    }
  }

  const eq8 = new EQ8();
  eq8.attach();
})();
