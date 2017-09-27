function get_canvas() {
            html2canvas(
                document.getElementById("preview-container"), {
                    onrendered: function (canvas) {
                        //document.body.appendChild(canvas);
                        var imageData = canvas.toDataURL('image/png', 1.0);
                        console.log(imageData);
                    }
                });
        }
