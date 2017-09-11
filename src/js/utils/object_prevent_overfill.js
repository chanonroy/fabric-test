export function canvas_prevent_overfill (canvas) {

    if(obj.getBoundingRect().top < master.top){ //Top boundary
        obj.top = master.top;
    }
    master.bottom = master.top+master.height;
    if(obj.getBoundingRect().top+obj.getBoundingRect().height > master.top+master.height){  //Bottom boundary
        obj.top = master.bottom-obj.getHeight();   
    }
    if(obj.getBoundingRect().left < master.left){  //Left boundary
        obj.left = master.left;
    }
    master.right = master.left+master.width;
    if(obj.getBoundingRect().left+obj.getBoundingRect().width > master.left+master.width){  //Right boundary
        obj.left = master.right-obj.getWidth();    
    }

}