import Vue from 'vue';

var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  },
  mounted() {
    console.log(fabric);

    var canvas = new fabric.Canvas('c');

    console.log(canvas);

    var rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: 'red',
        width: 20,
        height: 20
    });

    canvas.add(rect);
  }
})