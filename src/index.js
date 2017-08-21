import Vue from 'vue';
import './scss/main.scss';


var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!',
    canvas: '',
    rect: new fabric.Rect({
      left: 100,
      top: 100,
      fill: 'red',
      angle: 0,
      width: 50,
      height: 50
    }),
    rect2: new fabric.Rect({
      left: 200,
      top: 200,
      fil: 'mediumseagreen',
      angle: 0,
      width: 60,
      height: 60,
      selectable: false,
      hoverCursor: 'default'
    })
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
    this.canvas.add(this.rect2);
    this.canvas.add(this.rect);
  },
  methods: {
    test() {
      this.canvas.setHeight(800);
    }
  }
})