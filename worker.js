function calc_row(row_data) {
    var row_pixels = new Array(),
        c_im = row_data.im_max - row_data.y*row_data.im_factor,
        c_re,
        z_re,
        z_im,
        z_re2,
        z_im2,
        n,
        max_iterations = 150,
        is_inside,
        x;

    for (x=0; x<row_data.width; ++x) {
        c_re = row_data.re_min + x*row_data.re_factor;
        z_re = c_re;
        z_im = c_im;
        is_inside = true;
        for (n=0; n<max_iterations; ++n) {
            z_re2 = z_re*z_re;
            z_im2 = z_im*z_im;
            if (z_re2 + z_im2 > 4) {
                is_inside = false;
                break;
            }

            if ('c' in row_data && row_data.c) {
                // Julia
                z_im = 2*z_re*z_im + row_data.c.im;
                z_re = z_re2 - z_im2 + row_data.c.re;
            } else {
                // Mandelbrot
                z_im = 2*z_re*z_im + c_im;
                z_re = z_re2 - z_im2 + c_re;
            }
        }
        row_pixels.push(x);
        row_pixels.push(n);
    }

    self.postMessage({'y': row_data.y, 'pixels': row_pixels, 'type': ('c' in row_data && row_data.c ? 'julia': 'mandelbrot')});
}

self.onmessage = function(e) {
    for (var i=0; i<e.data.y_count; ++i) {
        calc_row({
            y: i+e.data.y_0,
            width: e.data.width,
            im_max: e.data.im_max,
            im_factor: e.data.im_factor,
            re_min: e.data.re_min,
            re_factor: e.data.re_factor,
            c: e.data.c
        });
    }
}
