import Vue from 'vue';
import ElementUI from 'element-ui'
import { throttle, findIndex } from 'lodash'
import axios from 'axios';
import { Slider, Compact } from 'vue-color'
import { defaultColors } from './js/default_colors'
import { object_prevent_overfill } from './js/utils/object_prevent_overfill'
import { server_prevent_overfill } from './js/utils/server_prevent_overfill'
import './scss/main.scss';

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
    
    // Shit from Django
    static_path: 'https://s3.amazonaws.com/bezel-mbx/assets/',
    post_path: '',

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

    canvas_img: '',

    pk_dict: {
      'frame': {
        '1u-rectangle': 1,
        '2u-rectangle': 2,
        '1u-dogbone': 1,
        '2u-dogbone': 4,
        'none': ''
      },
      'mesh': {
        '1u-circle': 1,
        '1u-square': 2,
        '1u-hex': 3,
        '2u-square': 4,
        '2u-circle': 5,
        '2u-hexagon': 6,
        'none': ''
      },
      'badge': {
        'circle': 2,
        'oval': 4,
        'racetrack': 6,
        'rectangle': 5,
        'square': 3,
        'none': ''
      }
    },
    
    // Settings Components
    frame_val: '',                // { String } - value indicating type of frame from select
    frame_color: defaultColors,   // { Object } - color object used for the vue color sliders
    frame_color_input: '#FFFFFF', // { String } - hex for input
    frame_color_default: '#FFFFFF',
    
    mesh_val: '',                 // { String } - value indicating type of mesh from select
    mesh_color: defaultColors,    // { Object } - color object used for the vue color sliders
    mesh_color_input: '#FFFFFF',  // { String } - hex for input
    mesh_color_default: '#FFFFFF',
    mesh_coverage: 'full',

    badge_val: '',                // { String } - value indicating type of badge from select
    badge_color: defaultColors,   // { Object } - color object used for the vue color sliders
    badge_color_input: '#FFFFFF', // { String } - hex for input
    badge_color_default: '#FFFFFF',

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
      new fabric.loadSVGFromURL(app.static_path + val + '.svg', function(objects, options) {
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
          scaleX: app.canvas.width / app.frame.width,
          scaleY: app.canvas.height / app.frame.height + 0.025
        });

        app.clean_main_canvas();

        if (app.badge) {
          var badge_index = findIndex(app.canvas._objects, [ 'selectable', true ]);
          var current_badge = app.canvas._objects[badge_index];

          app.canvas.centerObject(current_badge);
          current_badge.setCoords();
          app.canvas.setActiveObject(current_badge);
        }

        app.canvas.renderAll();
        app.loading = false;
      },
      null,
      { crossOrigin: 'Anonymous' }
      );
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
        new fabric.loadSVGFromURL(app.static_path + val + '.svg', function(objects, options) {
            app.canvas.remove(app.mesh);
            app.mesh_cache[val] = fabric.util.groupSVGElements(objects, options);
            app.mesh = app.mesh_cache[val];
          
            if (app.server_size == 2) {
              app.mesh.set({ 
              })
            }

            app.setup_mesh();
          },
          null,
          { crossOrigin: 'Anonymous' }
        );
      } // - else

    },
    badge_color() {
      this.badge_color_input = this.badge_color.hex;
    },
    badge_color_input(val) {
      if (val.length == 7 && val[0] == '#') {
        this.save_badge();
      }
    },
    badge_val(val) {

      // initialize custom_props
      var custom_props = {};

      if (val == 'none') {
        app.canvas.remove(app.badge);
        app.badge = '';
        return;
      }

      if (this.logo_canvas) {
        this.logo_canvas.dispose();
      }

      // badge types: 'circle', 'square', 'rectangle', 'racetrack', 'oval', 'none'
      if (val == 'circle') {
        this.setup_logo_canvas(150, 150, 0); // 25
        custom_props = {
          rx: 150
        };
      }
      
      if (val == 'square') {
        this.setup_logo_canvas(150, 150, 0); // 5
        custom_props = {
          rx: 10
        };
      }

      if (val == 'rectangle') {
        this.setup_logo_canvas(150, 300, 0); // 5
        custom_props = {
          rx: 15
        };
      }
      
      if (val == 'racetrack') {
        this.setup_logo_canvas(150, 350, 0); // 15
        custom_props = {
          rx: 75
        };
      }

      if (val == 'oval') {
        this.setup_logo_canvas(150, 350, 0); // 20
        custom_props = {
          rx: 250
        };
      }

      var default_props = {
        fill: this.badge_color_input,
        left: 0,
        top: 0,
        width: this.logo_canvas.width - 2,
        height: this.logo_canvas.height - 2,
        selectable: false,
        hasControls: false,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        hasBorders: false,
        stroke: '#adadad',
        strokeWidth: 2,
        hoverCursor: 'default'
      };

      // Build necessary properties for base
      var concat_props = Object.assign({}, default_props, custom_props);
      this.badge_base = new fabric.Rect(concat_props);

      // Add elements back to canvas
      this.logo_canvas.add(this.badge_base);
      
      // A photo exists
      if (this.badge_photo !== '') { 
        app.logo_canvas.add(app.badge_photo); 
        app.logo_canvas.centerObject(app.badge_photo);
        app.badge_photo.setCoords();
        app.logo_canvas.setActiveObject(app.badge_photo);
        app.logo_canvas.renderAll();
      }
    },
    server_size(val) {
      this.mesh_val = 'none';
      if (val == 1) {
        this.mesh_coverage = 'full';
      }
    },
    step(val) {

      if (val == 1 || val == 2 || val == 4) {
        this.save_badge();
      }

    }
  },
  methods: {
    prepare_payload(type) {
      // type = 'finish' or 'pdf'
      var app = this;

      html2canvas(document.getElementById("preview-container"), {
              useCORS:true,
              onrendered: function (canvas) {
                  app.canvas_img = canvas.toDataURL('image/png', 1.0);

                  if (type == 'finish') {
                    app.finish_order();
                  } else {
                    app.get_pdf();
                  }
              }
          });
    },
    finish_order() {

      if (!this.selections_done) {
        return false;
      } else {

        var payload = {
          'rack_size': this.frame_val ? this.pk_dict.frame[this.frame_val] : '',      // { Number }
          'mesh': this.mesh_val ? this.pk_dict.mesh[this.mesh_val] : '',              // { Number }
          'logo_shape': this.badge ? this.pk_dict.badge[this.badge_val] : '',         // { String }
          'logo': this.badge ? this.badge.toSVG() : '',                               // { String ? } <-- this is a giant SVG string
          'top': this.badge ? this.badge.top : '',                                    // { Float }
          'left': this.badge ? this.badge.left : '',                                  // { Float }
          'canvas_height': this.badge ? this.canvas.height : '',                      // { Number }
          'canvas_width': this.badge ? this.canvas.width : '',                        // { Number }
          'badge_color': this.badge ? this.badge_color_input : '',                     // { String } - #414645
          'mesh_color': this.mesh_color_input,
          'representation': this.canvas_img,                                        // { String } - #414645
          'frame_color': this.frame_color_input,                                       // { String } - #414645
          'mesh_coverage': this.mesh_coverage                                         // { String } - 'full' or 'partial'
        }

        var app = this;

        // AJAX HERE
        axios.post('/shopping-cart/add/', payload).then(function(response) { 
          console.log(response); 
          top.window.location.href='/shopping-cart/show/';
        }).catch(function(error) { 
          app.$message.error('Server error'); 
        });

      }

    },
    get_pdf() {

      if (!this.selections_done) {
        return false;
      } else {

        var payload = {
          'rack_size': this.frame_val ? this.pk_dict.frame[this.frame_val] : '',      // { Number }
          'mesh': this.mesh_val ? this.pk_dict.mesh[this.mesh_val] : '',              // { Number }
          'logo_shape': this.badge ? this.pk_dict.badge[this.badge_val] : '',         // { String }
          'logo': this.badge ? this.badge.toSVG() : '',                               // { String ? } <-- this is a giant SVG string
          'top': this.badge ? this.badge.top : '',                                    // { Float }
          'left': this.badge ? this.badge.left : '',                                  // { Float }
          'canvas_height': this.badge ? this.canvas.height : '',                      // { Number }
          'canvas_width': this.badge ? this.canvas.width : '',                        // { Number }
          'badge_color': this.badge ? this.badge_color_input : '',                     // { String } - #414645
          'mesh_color': this.mesh_color_input,                                        // { String } - #414645
          'frame_color': this.frame_color_input,
          'representation': this.canvas_img,
          'get_pdf': '',
          'mesh_coverage': this.mesh_coverage                                         // { String } - 'full' or 'partial'
          
        }

        var app = this;

        // AJAX HERE
        axios.post('/shopping-cart/add/', payload).then(function(response) { 
          var win = window.open(response.data, '_blank');
            if (win) {
                //Browser has allowed it to be opened
                win.focus();
            } else {
                //Browser has blocked it
                alert('Please allow popups for this website');
            }
        }).catch(function(error) { 
          app.$message.error('Server error'); 
        });

      }

    },
    setup_logo_canvas(height, width, radius) {
      // Image Upload and Badge Selection Canvas
      this.logo_canvas = new fabric.Canvas('logo_canvas');
      this.logo_canvas.backgroundColor="rgba(0, 0, 0, 0)";
      this.logo_canvas.setHeight(height);
      this.logo_canvas.setWidth(width);
      this.logo_canvas.preserveObjectStacking = true;
      object_prevent_overfill(this.logo_canvas, radius);
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

      var scale_height = app.server_size == 2 ? app.canvas.height / app.mesh.height + 0.025 : (app.canvas.height / app.mesh.height) / 1.3;
      var top_value = app.server_size == 2 ? -5 : 5;

      // Set properties of the mesh
      app.mesh.set({
        selectable: false,
        hasControls: false,
        hoverCursor: 'default',
        top: top_value,
        left: -5,
        width: app.mesh.width,
        scaleX: app.canvas.width / app.mesh.width,
        scaleY: scale_height
      });

      app.clean_main_canvas();
      app.canvas.renderAll();
      app.loading = false;
    },
    save_badge: throttle(function() {
      var app = this;

      // If no photo, don't save it
      if (!this.badge_photo) {
        return;
      }

      app.badge_base.set('fill', app.badge_color_input);

      // Create clones to not group the objects together
      var temp_badge_base = fabric.util.object.clone(this.badge_base);
      var temp_badge_photo = fabric.util.object.clone(this.badge_photo);

      var badge_group = new fabric.Group([ temp_badge_base, temp_badge_photo ]);
      var badge_string = badge_group.toSVG();

      app.badge_color.hex = app.badge_color_input;

      // Async load of the badge clone
      new fabric.loadSVGFromString(badge_string, function(objects, options) {
        
        var badge_exists = false;
        var badge_top = 0;
        var badge_left = 0;

        if (app.badge) {
          badge_exists = true;
          var badge_index = findIndex(app.canvas._objects, [ 'selectable', true ]);
          var badge_old = app.canvas._objects[badge_index];
          badge_top = badge_old.top;
          badge_left = badge_old.left;
        }

        app.canvas.remove(app.badge);
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

        app.logo_canvas.renderAll();

        if (badge_exists) {
          app.badge.set({
            top: badge_top,
            left: badge_left
          })
          app.clean_main_canvas();
        } else {
          app.clean_main_canvas();
          app.canvas.centerObject(app.badge);
          app.badge.setCoords();
          app.canvas.setActiveObject(app.badge);
        }

        app.canvas.renderAll();
      });

    }, 100),
    remove_photo() {
      // Removing photo from the button
      var app = this;

      app.canvas.remove(app.badge);

      app.logo_canvas.remove(app.badge_photo);
      app.badge = '';
      app.badge_photo = '';

      app.clean_main_canvas();
      app.canvas.renderAll();
    },
    beforeUpload(file) {
      // Validation for file uploading

      var app = this;

      const isSVG = file.type === 'image/svg+xml';
      if (!isSVG) {
        app.$message.warning('Logo should be in .svg format');
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
              cornerColor: "#adadad",
              borderColor: "#adadad",
            });
            badge_logo.setControlsVisibility({
              mt: false,
              mr: false,
              mb: false,
              ml: false
            });

            app.badge_photo = badge_logo;
            app.logo_canvas.add(app.badge_photo);
            app.logo_canvas.centerObject(app.badge_photo);
            app.badge_photo.setCoords();
            app.logo_canvas.setActiveObject(app.badge_photo);
            app.logo_canvas.renderAll();
         },
         null,
         { crossOrigin: 'Anonymous' }
        );
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
    // Grab inline Django template variables  

    // Server Preview Canvas
    this.canvas = new fabric.Canvas('c');
    this.canvas.backgroundColor="rgba(0, 0, 0, 0)";
    this.canvas.setHeight(this.canvas_size[this.server_size].height);
    this.canvas.setWidth(this.canvas_size[this.server_size].width);
    // this.canvas.preserveObjectStacking = true;

    server_prevent_overfill(this.canvas);
  },
  created() {
        this.static_path = static_path;
        this.post_path = post_path;       // old_post_path
  }
})
