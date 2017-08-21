import Vue from 'vue';
import './scss/main.scss';


var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!',
    canvas: '',
  },
  mounted() {
    this.canvas = new fabric.Canvas('c');

    this.canvas.backgroundColor="lightgrey";
    this.canvas.setHeight(500);
    this.canvas.setWidth(800);

    console.log(this.canvas);

    var rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: 'red',
        width: 50,
        height: 50
    });
      
    this.canvas.add(rect);
  },
  methods: {
    test() {
      this.canvas.setHeight(800);
    }
  }
})