export function server_prevent_overfill (canvas) {
    
        canvas.on('object:moving', function (e) {
            var obj = e.target;
            obj.setCoords();
    
            var boundingRect = obj.getBoundingRect(); // height, width
    
            var max_top = 0;
            var max_bot = canvas.height - boundingRect.height;
            var max_left = 0;
            var max_right = canvas.width - boundingRect.width - 10;
    
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

    }