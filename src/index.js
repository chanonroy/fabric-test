import Vue from 'vue';
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import Progress from './js/components/progress.vue'
import { Slider } from 'vue-color'
import { defaultColors } from './js/default_colors'
import './scss/main.scss';
import './assets/_assets.js';

Vue.use(ElementUI);

var app = new Vue({
  el: '#app',
  components: {
    'slider-picker': Slider,      // Color slider from vue-color
    'progress-bar': Progress      // Custom Vue component for showing steps
  },
  data: {
    // General Settings
    step: 1,                      // { Number } - for keeping order of app progress (e.g., 1, 2, 3, 4)
    canvas_height: 120,           // { Number } - canvas height
    canvas_width: 565,            // { Number } - canvas width
    
    // Settings Components
    frame_val: '',                // { String } - value indicating type of frame from select
    frame_color: defaultColors,   // { Object } - hex property primarily used
    
    mesh_val: '',                 // { String } - value indicating type of mesh from select
    mesh_color: defaultColors,    // { Object } - hex property primarily used
    
    badge_val: '',                // { String } - value indicating type of badge from select
    badge_color: defaultColors,   // { Object } - hex property primarily used

    server_size: 0,               // { Number } - 0 unassigned, 1 for 1U, 2 for 2U

    // Fabric.js Canvas Objects
    canvas: '',                   // { Object } - canvas Fabric.js obj to be instantiated on mounting Vue.js
    badge: '',                    // { Object } - hex property primarily used
    frame: ''                     // { Object } - Fabric.js obj for the frame

  },
  watch: { // When these properties from data() change, do the following:
    frame_color() {
      this.frame.set('fill', this.frame_color.hex);
      this.canvas.renderAll();
    },
    frame_val(val) {
      var app = this;

      new fabric.loadSVGFromURL('dist/fonts/' + val + '.svg', function(objects, options) {
        app.canvas.remove(app.frame);
        app.frame = fabric.util.groupSVGElements(objects, options);

        app.frame.set({
          selectable: false,
          hasControls: false,
          hoverCursor: 'default',

          top: -5,
          left: -5,
          width: app.frame.width,

          scaleX: app.canvas.width / app.frame.width,
          scaleY: app.canvas.height / app.frame.height
        });

        app.canvas.add(app.frame);
        app.canvas.renderAll();
      });

      // this.clean_canvas();
      this.server_size = Number(val[0]); // 1 or 2
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
    this.canvas.setHeight(this.canvas_height);
    this.canvas.setWidth(this.canvas_width);

    // this.canvas.on('object:moving', function (e) {
    //   // Prevent object from leaving canvas

    //   var obj = e.target;
    //    // if object is too big ignore
    //   if(obj.currentHeight > obj.canvas.height || obj.currentWidth > obj.canvas.width){
    //       return;
    //   }        
    //   obj.setCoords();        
    //   // top-left  corner
    //   if(obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0){
    //       obj.top = Math.max(obj.top, obj.top-obj.getBoundingRect().top);
    //       obj.left = Math.max(obj.left, obj.left-obj.getBoundingRect().left);
    //   }
    //   // bot-right corner
    //   if(obj.getBoundingRect().top+obj.getBoundingRect().height  > obj.canvas.height || obj.getBoundingRect().left+obj.getBoundingRect().width  > obj.canvas.width){
    //       obj.top = Math.min(obj.top, obj.canvas.height-obj.getBoundingRect().height+obj.top-obj.getBoundingRect().top);
    //       obj.left = Math.min(obj.left, obj.canvas.width-obj.getBoundingRect().width+obj.left-obj.getBoundingRect().left);
    //   }
    // });
  },
})