import Vue from 'vue';
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import Progress from './js/components/progress.vue'
import { Slider } from 'vue-color'
import { defaultColors } from './js/default_colors'
import './assets/server-icon.png';
import './assets/server.jpg';
import './scss/main.scss';

Vue.use(ElementUI);

var app = new Vue({
  el: '#app',
  components: {
    'slider-picker': Slider,
    'progress-bar': Progress
  },
  data: {
    step: 1,                    // 1, 2, 3, 4
    
    frame: '',
    mesh: '',
    badge: '',

    canvas: '',
    colors: defaultColors,
    rect: '',
    cover: new fabric.Rect({
      left: 0,
      top: 0,
      fill: 'lightgrey',
      angle: 0,
      width: 555,
      height: 100,
      opacity: 0.8,
      selectable: false,
      hoverCursor: 'default'
    })
  },
  watch: {
    colors() {
      this.cover.set('fill', this.colors.hex);
      this.canvas.renderAll();
    },
    frame(val) {
      this.clean_canvas();
      
    },
    badge(val) {

      // Currently creates a new one every click
      this.rect = new fabric.Rect({
        left: 0,
        top: 0,
        fill: 'red',
        angle: 0,
        width: 50,
        height: 50,
        opacity: 1,
        selectable: true,
        hoverCursor: 'default'
      })
      this.clean_canvas();
    }
  },
  methods: {
    clean_canvas() {
      this.canvas.remove(this.cover);
      this.canvas.remove(this.rect);

      if (this.cover) { this.canvas.add(this.cover); }
      if (this.rect) { this.canvas.add(this.rect); }
    }
  },
  mounted() {
    // Initialize canvas as fabric
    this.canvas = new fabric.Canvas('c');
    this.canvas.backgroundColor="rgba(0, 0, 0, 0)";
    this.canvas.setHeight(100);
    this.canvas.setWidth(555);
    this.canvas.on('object:moving', function (e) {
      // Prevent object from leaving canvas

      var obj = e.target;
       // if object is too big ignore
      if(obj.currentHeight > obj.canvas.height || obj.currentWidth > obj.canvas.width){
          return;
      }        
      obj.setCoords();        
      // top-left  corner
      if(obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0){
          obj.top = Math.max(obj.top, obj.top-obj.getBoundingRect().top);
          obj.left = Math.max(obj.left, obj.left-obj.getBoundingRect().left);
      }
      // bot-right corner
      if(obj.getBoundingRect().top+obj.getBoundingRect().height  > obj.canvas.height || obj.getBoundingRect().left+obj.getBoundingRect().width  > obj.canvas.width){
          obj.top = Math.min(obj.top, obj.canvas.height-obj.getBoundingRect().height+obj.top-obj.getBoundingRect().top);
          obj.left = Math.min(obj.left, obj.canvas.width-obj.getBoundingRect().width+obj.left-obj.getBoundingRect().left);
      }
    });
  },
})