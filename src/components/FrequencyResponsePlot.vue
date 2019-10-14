<template>
    <div class="canvas-wrapper" style="width: 600px; height: 250px;">
      <canvas ref="grid" id="grid" width="600px" height="250px"></canvas>
      <canvas ref="graph" id="graph" width="600px" height="250px"></canvas>
    </div>
</template>

<script>
import colors from '../styles/_colors.scss';

const FREQ_LINES = {
  '100': 100,
  '1k': 1000,
  '10k': 10000
};

const DB_SCALE = 20.0;

export default {
  name: 'FrequencyResponsePlot',
  props: {
    filters: { type: Array },
    context: { type: AudioContext },
    freqStart: { type: Number }
  },
  data () {
    return {
      drawing: null
    };
  },
  mounted () {
    this.drawing = this.$refs.graph.getContext('2d');
    this.gridDrawing = this.$refs.grid.getContext('2d');
    const { width, height } = this.$refs.grid;
    this.drawGrid(width, height);
    window.requestAnimationFrame(this.draw);
  },
  methods: {
    drawGrid (width, height) {
      this.gridDrawing.clearRect(0, 0, width, height);

      // draw frequency lines
      this.gridDrawing.font = '8px sans-serif';

      const m = width / Math.log10(this.nyquist / this.freqStart);
      for (let i = 1, j = this.freqStart; j < this.nyquist; ++i, j = Math.pow(10, i)) {
        [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(p => {
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
        const y = Math.floor(dbToY) + 0.5; // (tsned) adjustment for crisp lines
        this.gridDrawing.strokeStyle = db === 0 ? colors.graphLineBright : colors.graphLine;
        this.gridDrawing.beginPath();
        this.gridDrawing.moveTo(0, y);
        this.gridDrawing.lineTo(width, y);
        this.gridDrawing.stroke();
        this.gridDrawing.strokeStyle = colors.graphText;
        this.gridDrawing.strokeText(db.toFixed(0), 10.5, y + 0.5);
      }
    },
    draw () {
      if (!this.drawing) return;
      const { width, height } = this.$refs.graph;

      this.drawing.clearRect(0, 0, width, height);

      // test
      const filter1 = this.context.createBiquadFilter();
      const filter2 = this.context.createBiquadFilter();
      filter1.connect(filter2);
      filter2.connect(this.context.destination);

      const freqHz = new Float32Array(width);
      const magResponse1 = new Float32Array(width);
      const magResponse2 = new Float32Array(width);

      filter1.frequency.value = 100;
      filter1.gain.value = -10.0;
      filter1.q = 10.0;
      filter1.type = 'peaking';

      filter2.frequency.value = 10000;
      filter2.gain.value = 12;
      filter2.q = 0.1;
      filter2.type = 'peaking';

      const m = width / Math.log10(this.nyquist / this.freqStart);
      for (let x = 0; x < width; ++x) {
        freqHz[x] = Math.pow(10, (x / m)) * this.freqStart;
      }
      filter1.getFrequencyResponse(freqHz, magResponse1, new Float32Array(width));
      filter2.getFrequencyResponse(freqHz, magResponse2, new Float32Array(width));

      this.drawing.beginPath();
      this.drawing.lineWidth = 2;
      this.drawing.strokeStyle = colors.line;
      this.drawing.moveTo(0, height / 2);
      for (let i = 0; i < width; ++i) {
        let response = magResponse1[i] * magResponse2[i];
        let dbResponse = 20.0 * Math.log10(Math.abs(response));
        const y = (0.5 * height) - ((0.5 * height) / DB_SCALE) * dbResponse;
        this.drawing.lineTo(i, y);
      }
      // this.drawing.lineTo(width, height / 2);
      this.drawing.stroke();
    }
  },
  computed: {
    nyquist () {
      return this.context.sampleRate / 2.0;
    }
  },
  watch: {
    filters () {
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
