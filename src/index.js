import Vue from 'vue';
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import Progress from './js/components/progress.vue'
import { Slider } from 'vue-color'
import { defaultColors } from './js/default_colors'
import { canvas_prevent_overfill } from './js/utils/canvas_prevent_overfill'
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
    loading: false,               // { Boolean } - to trigger loading icon
    canvas_height: 135,           // { Number } - canvas height
    canvas_width: 661,            // { Number } - canvas width
    
    // Settings Components
    frame_val: '',                // { String } - value indicating type of frame from select
    frame_color: defaultColors,   // { Object } - hex property primarily used
    frame_color_input: '#B3DAE5', // { String } - hex for input
    
    mesh_val: '',                 // { String } - value indicating type of mesh from select
    mesh_color: defaultColors,    // { Object } - hex property primarily used
    mesh_color_input: '#B3DAE5',  // { String } - hex for input
    
    badge_val: '',                // { String } - value indicating type of badge from select
    badge_color: defaultColors,   // { Object } - hex property primarily used
    badge_color_input: '#B3DAE5', // { String } - hex for input

    server_size: 0,               // { Number } - 0 unassigned, 1 for 1U, 2 for 2U

    // Fabric.js Canvas Objects
    canvas: '',                   // { Object } - canvas Fabric.js obj to be instantiated on mounting Vue.js
    frame: '',                    // { Object } - Fabric.js obj for the frame
    mesh: '',                     // { Object } - Fabric.js obj for the mesh
    mesh_cache: {                 // { Object } - holds rendered fabric svg groups in cache
      '1u-circle': '',
      '1u-hex': '',
      '1u-square': '',
      '2u-circle': '',
      '2u-hex': '',
      '2u-square': ''
    },

    // Logo Uploading
    badge: '',                    // { Object } - Fabric.js obj for the badge
    logo_canvas: '',              // { Object } - For configuring the badge
    badge_photo: '',              // { Object } = SVG object for the photo object
    badge_base: '',               // { Object } - SVG object for the base plate

  },
  watch: { // When these properties from data() change, do the following:
    frame_color() {
      this.frame_color_input = this.frame_color.hex;
    },
    frame_color_input(val) {
      if (val.length == 7 && val[0] == '#') {
        for (var i in this.frame._objects) {
          this.frame.item(i).set('fill', this.frame_color_input);
        }
      }
      this.frame_color.hex = this.frame_color_input;
      this.canvas.renderAll();
    },
    frame_val(val) {
      var app = this;

      app.loading = true;
      new fabric.loadSVGFromURL('dist/fonts/' + val + '.svg', function(objects, options) {
        app.canvas.remove(app.frame);
        app.frame = fabric.util.groupSVGElements(objects, options);

        for (var i in app.frame._objects) {
          app.frame.item(i).set('fill', app.frame_color.hex);
        }

        app.frame.set({
          selectable: false,
          hasControls: false,
          hoverCursor: 'default',
          top: -5,
          left: -5,
          width: app.frame.width,
          scaleX: app.canvas.width / app.frame.width + 0.01,
          scaleY: app.canvas.height / app.frame.height + 0.025
        });

        app.canvas.add(app.frame);
        if (app.badge) {
          app.canvas.remove(app.badge); 
          app.canvas.add(app.badge); 
        }
        app.canvas.renderAll();
        app.loading = false;
      });

      this.server_size = Number(val[0]); // 1 or 2
    },
    mesh_color() {
      this.mesh_color_input = this.mesh_color.hex;
    },
    mesh_color_input(val) {
      if (val.length == 7 && val[0] == '#') {
        for (var i in this.mesh._objects) {
          this.mesh.item(i).set('fill', this.mesh_color_input);
        }
      }
      this.mesh_color.hex = this.mesh_color_input;
      this.canvas.renderAll();
    },
    mesh_val(val) {
      var app = this;

      if (val == 'none') {
        app.canvas.remove(app.mesh);
        return;
      }

      if (app.mesh_cache[val] !== '') {
        // Cache hit, use mesh cache
        app.canvas.remove(app.mesh);
        app.mesh = app.mesh_cache[val];
        app.setup_mesh();
      } else {
        // Cache miss, generate mesh (2-3 seconds)
        app.loading = true;
        new fabric.loadSVGFromURL('dist/fonts/' + val + '.svg', function(objects, options) {
            app.canvas.remove(app.mesh);
            app.mesh_cache[val] = fabric.util.groupSVGElements(objects, options);
            app.mesh = app.mesh_cache[val];
          
            if (app.server_size == '2') {
              app.mesh.set({ height: app.mesh.height - 15 })
            }

            app.setup_mesh();
          }
        );
      } // - else

    },
    badge_color() {
      this.badge_color_input = this.badge_color.hex;
    },
    badge_color_input(val) {
      if (val.length == 7 && val[0] == '#') {
        this.badge_base.set('fill', this.badge_color_input);
      }
      this.badge_color.hex = this.badge_color_input;
      this.logo_canvas.renderAll();
    },
    badge_val(val) {
      // Remove old values from logo canvas
      this.logo_canvas.remove(this.badge_base);
      this.logo_canvas.remove(this.badge_photo);
      this.logo_canvas.remove(this.badge);
      this.badge_photo = '';

      if (val == 'none') {
        app.canvas.remove(app.badge);
        app.badge = '';
        return;
      }

      var custom_props = {
        fill: '#B3DAE6',
        rx: 10
      };
      var default_props = {
        left: 0,
        top: 0,
        width: this.logo_canvas.width,
        height: this.logo_canvas.height,
        selectable: false,
        hasControls: false,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        hasBorders: false,
        hoverCursor: 'default'
      };

      // Build necessary properties for base
      var concat_props = Object.assign({}, default_props, custom_props);
      this.badge_base = new fabric.Rect(concat_props);

      // Add elements back to canvas
      this.logo_canvas.add(this.badge_base);
      
      // A photo exists
      if (this.badge_photo !== '') { 
        this.logo_canvas.add(this.badge_photo); 
        this.save_badge();
      }
    },
  },
  methods: {
    setup_local_canvas() {
      // Image Upload and Badge Selection Canvas
      this.logo_canvas = new fabric.Canvas('logo_canvas');
      this.logo_canvas.backgroundColor="lightgrey";
      this.logo_canvas.setHeight(150);
      this.logo_canvas.setWidth(300);
      this.logo_canvas.preserveObjectStacking = true;
      canvas_prevent_overfill(this.logo_canvas);

    },
    clean_logo_canvas() {
      // Remove old Fabric.js canvas objects and replace with new if needed.

      this.logo_canvas.remove(this.frame);
      this.logo_canvas.remove(this.badge);

      if (this.frame) { this.canvas.add(this.frame); }
      if (this.badge) { this.canvas.add(this.badge); }
    },
    setup_mesh() {
      var app = this;

      for (var i in app.mesh._objects) {
        app.mesh.item(i).set('fill', app.mesh_color.hex);
      }

      app.mesh.set({
        selectable: false,
        hasControls: false,
        hoverCursor: 'default',
        top: -5,
        left: -5,
        width: app.mesh.width,
        scaleX: app.canvas.width / app.mesh.width + 0.01,
        scaleY: app.canvas.height / app.mesh.height + 0.025
      });

      app.canvas.remove(app.frame);
      app.canvas.add(app.mesh);
      app.canvas.add(app.frame);
      if (app.badge) {
        app.canvas.remove(app.badge); 
        app.canvas.add(app.badge); 
      }
      app.canvas.renderAll();
      app.loading = false;
    },
    save_badge() {
      var app = this;
      app.canvas.remove(app.badge);

      if (!this.badge_photo) {
        console.log('No photo, cannot generate badge');
        return;
      }

      var badge_group = new fabric.Group([ this.badge_base, this.badge_photo ]);
      var badge_string = badge_group.toSVG();

      new fabric.loadSVGFromString(badge_string, function(objects, options) {
        app.badge = fabric.util.groupSVGElements(objects, options);

        app.badge.set({
          scaleX: app.canvas.width / app.frame.width + 0.01,
          scaleY: app.canvas.height / app.frame.height + 0.025,
          selectable: true,
          hasControls: false,
          lockRotation: true,
          lockScalingX: true,
          lockScalingY: true,
        })

        app.canvas.add(app.badge).renderAll();
      });
    },
    remove_photo() {
      var app = this;

      app.canvas.remove(app.badge);
      app.logo_canvas.remove(app.badge_photo);

      app.badge = '';
      app.badge_photo = '';

    },
    beforeUpload(file) {
      const isSVG = file.type === 'image/svg+xml';
      if (!isSVG) {
        this.$message.error('Invalid upload. Must be in SVG format.');
        return false;
      }
    },
    handleUpload(res, file) {
      var app = this;

      var reader = new FileReader();
      reader.readAsDataURL(file.raw);
      reader.onload = function (event) {
        var url = URL.createObjectURL(file.raw);

          fabric.loadSVGFromURL(url, function(objects, options) {
            var badge_logo = fabric.util.groupSVGElements(objects, options);
            badge_logo.scaleToWidth(app.logo_canvas.width / 2);
            badge_logo.scaleToHeight(app.logo_canvas.height / 2);

            app.badge_photo = badge_logo;
            app.logo_canvas.add(app.badge_photo);
            app.logo_canvas.renderAll();
         });
      }
    }
  },
  mounted() {
    // Server Preview Canvas
    this.canvas = new fabric.Canvas('c');
    this.canvas.backgroundColor="rgba(0, 0, 0, 0)";
    this.canvas.setHeight(this.canvas_height);
    this.canvas.setWidth(this.canvas_width);
    // this.canvas.preserveObjectStacking = true;

    canvas_prevent_overfill(this.canvas);

    // Image Upload and Badge Selection Canvas
    this.setup_local_canvas();

  },
})