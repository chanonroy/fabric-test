import Vue from 'vue';
import { Chrome } from 'vue-color'
import { defaultColors } from './js/default_colors'
import './assets/server.jpg';
import './scss/main.scss';


var app = new Vue({
  el: '#app',
  components: {
    'chrome-picker': Chrome
  },
  data: {
    message: 'Hello Vue!',
    canvas: '',
    colors: defaultColors,
    rect: new fabric.Rect({
      left: 0,
      top: 0,
      fill: 'crimson',
      angle: 0,
      width: 50,
      height: 50
    }),
    cover: new fabric.Rect({
      left: 0,
      top: 0,
      fill: 'lightblue',
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
    }
  },
  methods: {
    test() {
      this.canvas.setHeight(400);
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
    this.canvas.add(this.cover);
    this.canvas.add(this.rect);
  },
})