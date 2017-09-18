export function object_prevent_overfill (canvas, radius) {
    
        canvas.on('object:moving', function (e) {
            var obj = e.target;
            obj.setCoords();
    
            var boundingRect = obj.getBoundingRect(); // height, width
    
            var max_top = radius;
            var max_bot = canvas.height - boundingRect.height - radius;
            var max_left = radius;
            var max_right = canvas.width - boundingRect.width - radius;
    
            if(boundingRect.top < max_top) {
                obj.top = max_top;
            }
    
            if(boundingRect.left < max_left){
                obj.left = max_left;
            }
    
            if(boundingRect.top > max_bot) {
                obj.top = max_bot;
            }
    
            if(boundingRect.left > max_right) {
                obj.left = max_right;
            }
        });

        canvas.on('object:scaling', function (options) {
            let obj = options.target;
            let boundingRect = obj.getBoundingRect(true);
            if (boundingRect.left < 0 || boundingRect.top < 0 || boundingRect.left + boundingRect.width > canvas.width || boundingRect.top + boundingRect.height > canvas.height) {

                obj.scaleX = 0.2;
                obj.scaleY = 0.2;
                canvas.centerObject(obj);
                obj.setCoords();
                canvas.setActiveObject(obj);
                canvas.renderAll();

            }
        });

    }