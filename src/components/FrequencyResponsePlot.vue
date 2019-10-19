<template>
    <div class="canvas-wrapper" style="width: 600px; height: 250px;">
      <canvas ref="grid" id="grid" width="600px" height="250px"></canvas>
      <canvas ref="graph" id="graph" width="600px" height="250px" @mouseup="mouseup" @mousedown="mousedown"></canvas>
    </div>
</template>

<script>
import throttle from '../utils/throttle';
import colors from '../styles/_colors.scss';

const TWO_PI = 2.0 * Math.PI;
const HANDLE_RADIUS = 8;
const HANDLE_CIRCUMFERENCE = 2 * HANDLE_RADIUS;
const DB_SCALE = 20.0;
const FREQ_LINES = {
  '100': 100,
  '1k': 1000,
  '10k': 10000
};
const USE_GAIN = {
  highpass: false,
  lowshelf: true,
  peaking: true,
  notch: false,
  highshelf: true,
  lowpass: false
};
const EDITABLE_Q = {
  highpass: false,
  lowshelf: false,
  peaking: true,
  notch: true,
  highshelf: false,
  lowpass: false
};

export default {
  name: 'FrequencyResponsePlot',
  props: {
    activeNode: { type: Number },
    filters: { type: Array },
    context: { type: AudioContext },
    freqStart: { type: Number },
    disabled: { type: Boolean }
  },
  data () {
    return {
      drawing: null,
      filterNodes: {},
      handleLocations: {},
      dragging: false
    };
  },
  created () {
    for (let i = 1; i <= 8; ++i) {
      this.filterNodes[String(i)] = this.context.createBiquadFilter();
      if (i > 1) this.filterNodes[String(i)].connect(this.filterNodes[String(i - 1)]);
      if (i === 7) this.filterNodes[String(i)].connect(this.context.destination);
    }
  },
  mounted () {
    this.drawing = this.$refs.graph.getContext('2d');
    this.gridDrawing = this.$refs.grid.getContext('2d');
    const { width, height } = this.$refs.grid;
    this.drawGrid(width, height);

    this.$refs.graph.addEventListener('mousemove', throttle(this.mousemove.bind(this), 50));
    this.$refs.graph.addEventListener('mousewheel', throttle(this.mousewheel.bind(this), 50));
  },
  methods: {
    drawGrid (width, height) {
      this.gridDrawing.clearRect(0, 0, width, height);

      // draw frequency lines
      this.gridDrawing.font = '8px sans-serif';

      const m = width / Math.log10(this.nyquist / this.freqStart);
      for (let i = 1, j = this.freqStart; j < this.nyquist; ++i, j = Math.pow(10, i)) {
        [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(p => {
          if (i <= 1 && p === 1) return;
          let x = Math.floor(m * Math.log10(p * j / this.freqStart)) + 0.5;
          this.gridDrawing.beginPath();
          this.gridDrawing.lineWidth = 1;
          this.gridDrawing.strokeStyle = p === 1 ? colors.graphLineBright : colors.graphLine;
          this.gridDrawing.moveTo(x, 0);
          this.gridDrawing.lineTo(x, height);
          this.gridDrawing.stroke();
        });
      }

      // draw text for frequency
      Object.entries(FREQ_LINES).forEach(j => {
        let x = m * Math.log10(j[1] / this.freqStart);
        this.gridDrawing.lineWidth = 0.5;
        this.gridDrawing.textAlign = 'center';
        this.gridDrawing.strokeStyle = colors.graphText;
        this.gridDrawing.strokeText(j[0], Math.floor(x) + 10.5, height - 2.5);
      });

      // draw decibel lines
      for (let db = -DB_SCALE + 5; db < DB_SCALE; db += 5) {
        const dbToY = (0.5 * height) - ((0.5 * height) / DB_SCALE) * db;
        const y = Math.floor(dbToY) + 0.5; // adjustment for crisp lines
        this.gridDrawing.strokeStyle = db === 0 ? colors.graphLineBright : colors.graphLine;
        this.gridDrawing.beginPath();
        this.gridDrawing.moveTo(0, y);
        this.gridDrawing.lineTo(width, y);
        this.gridDrawing.stroke();
        this.gridDrawing.strokeStyle = colors.graphText;
        this.gridDrawing.strokeText(db.toFixed(0), 10.5, y + 0.5);
      }
    },
    drawHandles (width, height, m, filters, yVals) {
      const draw = this.drawing;

      this.handleLocations = {}; // reset locations
      filters.forEach(f => {
        const x = Math.floor(m * Math.log10(f.frequency / this.freqStart));
        const y = (USE_GAIN[f.type] ? Math.min(Math.max(10, yVals[x]), height + 10) : height * 0.5) - 10;

        draw.strokeStyle = this.disabled ? colors.disabled : colors.accent;
        draw.lineWidth = 2;
        draw.beginPath();
        draw.arc(x, y, HANDLE_RADIUS, 0, TWO_PI);
        draw.stroke();

        if (f.id === this.activeNode) {
          draw.fillStyle = this.disabled ? colors.disabled : colors.accent;
          draw.fill();
          draw.strokeStyle = 'black';
        }

        draw.lineWidth = 1;
        draw.textAlign = 'center';
        draw.strokeText(f.id, x, y + HANDLE_RADIUS * 0.5);

        this.handleLocations[f.id] = { x, y };
      });
    },
    draw () {
      if (!this.drawing) return;
      const { width, height } = this.$refs.graph;

      this.drawing.clearRect(0, 0, width, height);

      const freqHz = new Float32Array(width);
      const m = width / Math.log10(this.nyquist / this.freqStart);
      for (let x = 0; x < width; ++x) {
        freqHz[x] = Math.pow(10, (x / m)) * this.freqStart;
      }

      const magRes = [];
      const enabledFilters = this.filters.filter(f => f.enabled);
      enabledFilters.forEach(filter => {
        const filterNode = this.filterNodes[filter.id];

        filterNode.frequency.value = filter.frequency;
        filterNode.gain.value = filter.gain;
        filterNode.Q.value = filter.q;
        filterNode.type = filter.type;
        const mr = new Float32Array(width);
        filterNode.getFrequencyResponse(freqHz, mr, new Float32Array(width));

        magRes.push(mr);
      });

      this.drawing.beginPath();
      this.drawing.lineWidth = 2;
      this.drawing.strokeStyle = this.disabled ? colors.disabled : colors.line;
      const yVals = [];
      for (let i = 0; i < width; ++i) {
        let response = magRes.reduce((a, c) => a * c[i], 1);
        let dbResponse = 20.0 * Math.log10(Math.abs(response) || 1);
        const y = (0.5 * height) * (1 - dbResponse / DB_SCALE);
        i === 0 ? this.drawing.moveTo(i, y) : this.drawing.lineTo(i, y);
        yVals.push(y);
      }
      this.drawing.stroke();

      this.drawHandles(width, height, m, enabledFilters, yVals);
    },
    mousedown ($event) {
      if (this.disabled) return;
      const { offsetX, offsetY } = $event;
      const node = Object.entries(this.handleLocations).find(entry => {
        const { x, y } = entry[1];
        const [ xHit, yHit ] = [ x + HANDLE_RADIUS, y + HANDLE_RADIUS ];
        const [ diffX, diffY ] = [ xHit - offsetX, yHit - offsetY ];
        return diffX > 0 && diffY > 0 && diffX < HANDLE_CIRCUMFERENCE && diffY < HANDLE_CIRCUMFERENCE;
      });
      if (node) {
        this.$emit('handle-selected', parseInt(node[0]));
        this.dragging = true;
        document.body.style.cursor = 'grabbing';
      }
    },
    mouseup ($event) {
      this.dragging = false;
      document.body.style.cursor = '';
    },
    mousemove ($event) {
      if (this.disabled) return;
      const { offsetX, offsetY } = $event;
      if (!offsetX && !offsetY) return; // when mouse stops, these are 0
      if (!this.dragging) {
        const hit = Object.values(this.handleLocations).some(({ x, y }) => {
          const [ xHit, yHit ] = [ x + HANDLE_RADIUS, y + HANDLE_RADIUS ];
          const [ diffX, diffY ] = [ xHit - offsetX, yHit - offsetY ];
          return diffX > 0 && diffY > 0 && diffX < HANDLE_CIRCUMFERENCE && diffY < HANDLE_CIRCUMFERENCE;
        });
        document.body.style.cursor = hit ? 'grab' : '';
      } else {
        const active = this.filters.find(f => f.id === this.activeNode);
        if (active) {
          const frequency = this.xToFrequency(offsetX, this.$refs.graph.width);
          if (USE_GAIN[active.type]) {
            this.$emit('filter-changed', { id: active.id, frequency, gain: this.yToGain(offsetY, this.$refs.graph.height) });
          } else {
            this.$emit('filter-changed', { id: active.id, frequency });
          }
        }
      }
    },
    mousewheel ($event) {
      if (this.disabled) return;
      const active = this.filters.find(f => f.id === this.activeNode);
      if (active && EDITABLE_Q[active.type]) {
        const q = Math.max(0, Math.min(active.q - $event.deltaY * 0.01, 10));
        this.$emit('filter-changed', { id: active.id, q });
      }
    },
    xToFrequency (x, width) {
      const m = width / Math.log10(this.nyquist / this.freqStart);
      return Math.pow(10, x / m) * this.freqStart;
    },
    yToGain (y, height) {
      return DB_SCALE * (((-2 * y) / height) + 1);
    }
  },
  computed: {
    nyquist () {
      return this.context.sampleRate * 0.5;
    }
  },
  watch: {
    filters () {
      window.requestAnimationFrame(this.draw);
    },
    activeNode () {
      window.requestAnimationFrame(this.draw);
    },
    disabled () {
      window.requestAnimationFrame(this.draw);
    }
  }
};
</script>

<style lang="scss" scoped>
  @import '../styles/base';

  .canvas-wrapper {
    position: relative;
    margin: 2px;

    #grid,
    #graph {
      position: absolute;
      top: 0;
      left: 0;
      border-radius: 8px;
    }

    #grid {
      background: #21272c;
    }

    #graph {
      background: transparent;
    }
  }

</style>
