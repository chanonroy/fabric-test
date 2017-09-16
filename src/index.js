import Vue from 'vue';
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import { Slider, Compact } from 'vue-color'
import { defaultColors } from './js/default_colors'
import { canvas_prevent_overfill } from './js/utils/canvas_prevent_overfill'
import './scss/main.scss';
import './assets/_assets.js';

Vue.use(ElementUI);

var app = new Vue({
  el: '#app',
  components: {
    'slider-picker': Slider,      // Color slider from vue-color
    'compact-picker': Compact     // Compact slider
  },
  data: {
    // General Settings
    step: 1,                      // { Number } - for keeping order of app progress (e.g., 1, 2, 3, 4)
    loading: false,               // { Boolean } - to trigger loading icon
    canvas_size: {
      '1': {
        'height': 60,
        'width': 610,
      },
      '2': {
        'height': 110,
        'width': 564,
      }
    },
    
    // Settings Components
    frame_val: '',                // { String } - value indicating type of frame from select
    frame_color: defaultColors,   // { Object } - color object used for the vue color sliders
    frame_color_input: '#808080', // { String } - hex for input
    frame_color_default: '#808080',
    
    mesh_val: '',                 // { String } - value indicating type of mesh from select
    mesh_color: defaultColors,    // { Object } - color object used for the vue color sliders
    mesh_color_input: '#414645',  // { String } - hex for input
    mesh_color_default: '#414645',

    badge_val: '',                // { String } - value indicating type of badge from select
    badge_color: defaultColors,   // { Object } - color object used for the vue color sliders
    badge_color_input: '#AFAFB4', // { String } - hex for input
    badge_color_default: '#AFAFB4',

    server_size: 2,               // { Number } - 0 unassigned, 1 for 1U, 2 for 2U

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
    badge_photo: '',              // { Object } - SVG object for the photo object
    badge_base: '',               // { Object } - SVG object for the base plate

  },
  computed: {
    selections_done() {
      // True = eeverything is finished, False = we still have steps to finish

      if (this.frame_val && this.frame_val !== 'none') {
        if (this.mesh_val.length > 0) {
          if (this.badge_val.length > 0) {
            return 1;
          }
        }
      }

      return 0;
      
    },
    no_selections() {
      return (this.frame_val && this.frame_val !== 'none') && (this.mesh_val && this.mesh_val !== 'none') && (this.badge_val && this.badge_val !== 'none');
    },
    size_label() {
      // CSS label for which server 

      return this.server_size == 2 ? 'two' : 'one';
    }
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

      if (val == 'none') {
        app.canvas.remove(app.frame);
        app.frame = '';
        return;
      }

      app.server_size = Number(val[0]); // 1 or 2

      app.canvas.setHeight(app.canvas_size[app.server_size].height);
      app.canvas.setWidth(app.canvas_size[app.server_size].width);
      app.canvas.renderAll();

      app.loading = true;
      new fabric.loadSVGFromURL('dist/fonts/' + val + '.svg', function(objects, options) {
        app.canvas.remove(app.frame);
        app.frame = fabric.util.groupSVGElements(objects, options);

        for (var i in app.frame._objects) {
          app.frame.item(i).set('fill', app.frame_color_input);
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

        app.clean_main_canvas();

        app.canvas.renderAll();
        app.loading = false;
      });
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
        app.mesh = '';
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
          
            if (app.server_size == 2) {
              app.mesh.set({ 
              })
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

      // badge types: 'circle', 'square', 'rectangle', 'pill shape', 'none'

      var custom_props = {
        rx: 10
      };
      var default_props = {
        fill: "#AFAFB4",
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
    server_size(val) {
      this.mesh_val = 'none';
    }
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
    clean_main_canvas() {
      this.canvas.remove(this.mesh);
      this.canvas.remove(this.frame);
      this.canvas.remove(this.badge);

      if (this.mesh) {
        this.canvas.add(this.mesh);
      }
      if (this.frame) {
        this.canvas.add(this.frame);
      }
      if (this.badge) {
        this.canvas.add(this.badge);
      }
    },
    setup_mesh() {
      var app = this;

      // Set color of mesh object (O(n))
      for (var i in app.mesh._objects) {
        app.mesh.item(i).set('fill', app.mesh_color_input);
      }

      // Set properties of the mesh
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

      app.clean_main_canvas();
      app.canvas.renderAll();
      app.loading = false;
    },
    save_badge() {
      var app = this;

      // If no photo, don't save it
      if (!this.badge_photo) {
        this.$message.warning('Badge should have logo');
        return;
      }

      app.canvas.remove(app.badge);

      // Create clones to not group the objects together
      var temp_badge_base = fabric.util.object.clone(this.badge_base);
      var temp_badge_photo = fabric.util.object.clone(this.badge_photo);

      var badge_group = new fabric.Group([ temp_badge_base, temp_badge_photo ]);
      var badge_string = badge_group.toSVG();

      // Async load of the badge clone
      new fabric.loadSVGFromString(badge_string, function(objects, options) {
        app.badge = fabric.util.groupSVGElements(objects, options);

        app.badge.set({
          scaleX: 0.3,
          scaleY: 0.3,
          selectable: true,
          hasControls: false,
          hasBorders: false,
          lockRotation: true,
          lockScalingX: true,
          lockScalingY: true,
        })

        app.clean_main_canvas();
        app.canvas.renderAll();
      });
    },
    remove_photo() {
      // Removing photo from the button
      var app = this;

      app.logo_canvas.remove(app.badge_photo);
      app.badge = '';
      app.badge_photo = '';

      app.clean_main_canvas();
      app.canvas.renderAll();
    },
    beforeUpload(file) {
      // Validation for file uploading

      const isSVG = file.type === 'image/svg+xml';
      if (!isSVG) {
        this.$message.warning('Logo should be in .svg format');
        return false;
      }
    },
    handleUpload(res, file) {
      // File reader to handle the upload and load into Fabric object

      var app = this;

      var reader = new FileReader();
      reader.readAsDataURL(file.raw);
      reader.onload = function (event) {
        var url = URL.createObjectURL(file.raw);

          fabric.loadSVGFromURL(url, function(objects, options) {
            var badge_logo = fabric.util.groupSVGElements(objects, options);

            badge_logo.scaleToWidth(app.logo_canvas.width / 2);
            badge_logo.scaleToHeight(app.logo_canvas.height / 2);
            badge_logo.set({
              lockRotation: true,
              hasRotatingPoint: false,
              cornerColor: "#CDE6B3",
              borderColor: "#FFFFFF",
            })

            app.badge_photo = badge_logo;
            app.logo_canvas.add(app.badge_photo);
            app.logo_canvas.renderAll();
         });
      }
    },
    reset_color(item) {
      this[item + '_color_input'] = this[item + '_color_default'];
    },
    start_over() {
      // Hitting the reset button

      this.frame_val = 'none';
      this.mesh_val = 'none';
      this.badge_val = 'none';

      // Reset colors
      this.frame_color_input = this.frame_color_default;
      this.mesh_color_input = this.mesh_color_default;
      this.badge_color_input = this.badge_color_default;

      // Go back to step 1
      this.step = 1;

    }
  },
  mounted() {
    // Server Preview Canvas
    this.canvas = new fabric.Canvas('c');
    this.canvas.backgroundColor="rgba(0, 0, 0, 0)";
    this.canvas.setHeight(this.canvas_size[this.server_size].height);
    this.canvas.setWidth(this.canvas_size[this.server_size].width);
    // this.canvas.preserveObjectStacking = true;

    canvas_prevent_overfill(this.canvas);

    // Image Upload and Badge Selection Canvas
    this.setup_local_canvas();

  },
})