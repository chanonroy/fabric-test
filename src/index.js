import Vue from 'vue';
import { Chrome } from 'vue-color'
import { defaultColors } from './js/default_colors'
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
      left: 100,
      top: 100,
      fill: 'crimson',
      angle: 0,
      width: 50,
      height: 50
    }),
    cover: new fabric.Rect({
      left: 200,
      top: 200,
      fill: 'red',
      angle: 0,
      width: 400,
      height: 100,
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
      this.canvas.setHeight(800);
    }
  },
  mounted() {
    // Initialize canvas as fabric
    this.canvas = new fabric.Canvas('c');

    this.canvas.backgroundColor="lightgrey";
    this.canvas.setHeight(500);
    this.canvas.setWidth(800);

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