(function() {
    function setup_palette() {
        palette = new Array();
        for (var c=0; c<=max_iterations/6; ++c) {
            palette.push({ r: Math.ceil(255*6*c/max_iterations), g: 0, b: 0 });
        }

        for (var i=0; i+c<=max_iterations/3; ++i) {
            palette.push({ r: 255, g: Math.ceil(255*6*i/max_iterations), b: 0});
        }
        c += i;

        for (var i=0; i+c<=max_iterations*2/3; ++i) {
            palette.push({ r: 255, g: Math.ceil(255*(1-3*i/max_iterations)), b: 0});
        }

        c += i;

        for (var i=0; i+c<=max_iterations; ++i) {
            palette.push({r: Math.ceil(255*(1-3*i/max_iterations)), g: 0, b: 0});
        }
    }

    function draw_row(dest, y, pixels) {
        var i,
            num,
            ctx = (dest == 'julia' ? j_ctx : m_ctx),
            row = ctx.createImageData(canvas_width, 1);
        for (i=0, num=pixels.length; i<num; i+=2) {
            if (pixels[i+1] == max_iterations) continue;

            color = palette[pixels[i+1]];
            row.data[2*i] = color.r;
            row.data[2*i+1] = color.g;
            row.data[2*i+2] = color.b;
            row.data[2*i+3] = 255;
        }
        ctx.putImageData(row, 1, y);
    }

    function zoom(e) {
        var zoom_factor = 10,
            o_im = im_max - e.offsetY*im_factor,
            o_re = re_min + e.offsetX*re_factor,
            im_span = im_max-im_min,
            re_span = re_max-re_min;

        im_max = o_im + (im_span / zoom_factor / 2);
        im_min = o_im - (im_span / zoom_factor / 2);
        re_max = o_re + (re_span / zoom_factor / 2);
        re_min = o_re - (re_span / zoom_factor / 2);

        re_factor = (re_max - re_min) / (canvas_width - 1),
        im_factor = (im_max - im_min) / (canvas_height - 1),

        render_mandelbrot();
        render_julia(e);
    }

    function render_mandelbrot() {
        m_ctx.clearRect(0, 0, canvas_width, canvas_height);

        for (var n=0; n<num_workers; ++n) {
            if (!workers[n]) {
                worker = new Worker('worker.js');
                workers.push(worker);
                worker.onmessage = function(e) {
                    draw_row(e.data.type, e.data.y, e.data.pixels);
                }
                worker.onerror = function(e) {
                    console.log(e);
                }
            } else {
                worker = workers[n];
            }

            worker.postMessage({
                y_0: n*rows_per_worker,
                y_count: (n == num_workers - 1) ? rows_per_worker - (canvas_height % num_workers) : rows_per_worker,
                width: canvas_width,
                im_max: im_max,
                im_factor: im_factor,
                re_min: re_min,
                re_factor: re_factor
            });
        }
    }

    function render_julia(e) {
        var c_im = im_max - e.offsetY*im_factor,
            c_re = re_min + e.offsetX*re_factor;

        j_ctx.clearRect(0, 0, canvas_width, canvas_height);

        for (var n=0; n<num_workers; ++n) {
            if (!workers[n]) {
                worker = new Worker('worker.js');
                workers.push(worker);
                worker.onmessage = function(e) {
                    draw_row(e.data.type, e.data.y, e.data.pixels);
                }
                worker.onerror = function(e) {
                    console.log(e);
                }
            } else {
                worker = workers[n];
            }

            worker.postMessage({
                y_0: n*rows_per_worker,
                y_count: (n == num_workers - 1) ? rows_per_worker - (canvas_height % num_workers) : rows_per_worker,
                width: canvas_width,
                im_max: im_max,
                im_factor: im_factor,
                re_min: re_min,
                re_factor: re_factor,
                c: {
                    re: c_re,
                    im: c_im
                }
            });
        }
    }

    var body = document.body,
        m_canvas_wrapper = document.getElementById("mandelbrot-wrapper"),
        m_canvas = document.getElementById("mandelbrot"),
        m_ctx = m_canvas.getContext("2d"),
        j_canvas_wrapper = document.getElementById("julia-wrapper"),
        j_canvas = document.getElementById("julia"),
        j_ctx = j_canvas.getContext("2d"),

        canvas_max_width = 700,
        canvas_width = Math.min(canvas_max_width, Math.floor(body.offsetWidth*0.4)),
        canvas_height = Math.floor(0.9*canvas_width),
        re_min = -2.0,
        re_max = 1.5,
        im_min = -1.3,
        im_max = im_min + (re_max - re_min) * canvas_height / canvas_width,
        re_factor = (re_max - re_min) / (canvas_width - 1),
        im_factor = (im_max - im_min) / (canvas_height - 1),
        n,
        num_workers = 10,
        rows_per_worker = Math.ceil(canvas_height / num_workers),
        worker,
        worker_data,
        max_iterations = 150,
        workers = new Array();

    m_canvas.width = canvas_width;
    m_canvas.height = canvas_height;
    j_canvas.width = canvas_width;
    j_canvas.height = canvas_height;
    m_canvas.onclick = render_julia;
    m_canvas.onmousewheel = console.log;
    palette = new Array();

    setup_palette();
    render_mandelbrot();
})();
