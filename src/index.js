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
    'slider-picker': Slider,      // Color slider from vue-color
    'progress-bar': Progress      // Custom Vue component for showing steps
  },
  data: {
    step: 1,                      // { Number } - for keeping order of app progress (e.g., 1, 2, 3, 4)
    
    // Settings Components
    frame_val: '',                // { String } - value indicating type of frame from select
    frame_color: defaultColors,   // { Object } - hex property primarily used
    
    mesh_val: '',                 // { String } - value indicating type of mesh from select
    mesh_color: defaultColors,    // { Object } - hex property primarily used
    
    badge_val: '',                // { String } - value indicating type of badge from select
    badge_color: defaultColors,   // { Object } - hex property primarily used

    // Fabric.js Canvas Objects
    canvas: '',                   // { Object } - canvas Fabric.js obj to be instantiated on mounting Vue.js
    badge: '',                    // { Object } - hex property primarily used
    frame: new fabric.Rect({      // { Object } - Fabric.js obj for the frame
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
  watch: { // When these properties from data() change, do the following:
    frame_color() {
      this.frame.set('fill', this.frame_color.hex);
      this.canvas.renderAll();
    },
    frame_val(val) {
      this.clean_canvas();
    },
    badge_color() {
      this.badge.set('fill', this.badge_color.hex);
      this.canvas.renderAll();
    },
    badge_val(val) {

      // Currently creates a new one every click
      this.badge = new fabric.Rect({
        left: 0,
        top: 0,
        fill: 'red',
        angle: 0,
        width: 50,
        height: 50,
        opacity: 1,
        selectable: true,
        hasControls: false,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        hoverCursor: 'move'
      })

      this.clean_canvas();
    }
  },
  methods: {
    clean_canvas() {
      // Remove old Fabric.js canvas objects and replace with new if needed.

      this.canvas.remove(this.frame);
      this.canvas.remove(this.badge);

      if (this.frame) { this.canvas.add(this.frame); }
      if (this.badge) { this.canvas.add(this.badge); }
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