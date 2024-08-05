//initiate canvas
let c = document.getElementById("grid");
let ctx = c.getContext('2d');

c.width = window.innerWidth;
c.height = window.innerHeight;


//dynamic canvas resize (mandatory)
window.addEventListener("resize", function (){
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    generate_grid()
})

let zoom_value = 1
let zoom_inc = 1
let min_zoom = 1
let max_zoom = 50
let grid_size = 3
let max_grid_size = 50
let grid_height_by_width_ratio = 1

let anchor_x;
let anchor_y;
let delta_x, delta_y;
let mouse_x , mouse_y;

let is_drawing = false, is_erasing = false;
let is_dragging = false

let pixel_color = [255,0 ,255]



class Grid {
    constructor() {
        this.active_tiles = []
    }

    // this function should return the height and width according to the size
    get_scale() {
        let size = 100 * grid_size / zoom_value
        return size / grid_size
    }
    serialize(array) {
        return array.join(',');
    }
    has(elem) {
        let set = this.active_tiles.map(this.serialize)
        return set.includes(this.serialize(elem))
    }
    add_tile(mouse_x, mouse_y) {
        let tile = this.get_scale()
        let block_position_x = Math.floor(((mouse_x - anchor_x) - (mouse_x - anchor_x) % tile ) / tile)
        let block_position_y = Math.floor(((mouse_y - anchor_y) - (mouse_y - anchor_y) % tile ) / tile)
        let new_tile = [block_position_x, block_position_y, pixel_color.slice()]
        if (!this.has(new_tile) && (block_position_x >= 0 && block_position_x < grid_size) && (block_position_y >= 0 && block_position_y < grid_size)) {
            this.active_tiles.push(new_tile)

        }
    }
    remove_tile(mouse_x, mouse_y) {
        let tile = this.get_scale()
        let block_position_x = Math.floor(((mouse_x - anchor_x) - (mouse_x - anchor_x) % tile ) / tile)
        let block_position_y = Math.floor(((mouse_y - anchor_y) - (mouse_y - anchor_y) % tile ) / tile)
        let new_tile = [block_position_x, block_position_y]
        if ((block_position_x >= 0 && block_position_x < grid_size) && (block_position_y >= 0 && block_position_y < grid_size)) {
            this.active_tiles = this.active_tiles.filter((elem) => {
                if (new_tile[0] !== elem[0] || new_tile[1] !== elem[1] )
                    return elem

            })
        }
    }
    draw(offset_x, offset_y) {
        let tile = this.get_scale()

        // we start by drawing the background
        ctx.lineJoin = "bevel";
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#000";
        ctx.strokeRect(offset_x, offset_y, tile * grid_size, tile * grid_size * grid_height_by_width_ratio);

        // we draw the lines
        for (let line = 0; line < grid_size; line++) {
            // horizontal lines
            ctx.lineWidth = 0.2;
            ctx.strokeStyle = "#000";
            ctx.strokeRect(offset_x, offset_y + line * tile, tile * grid_size, 0);
            // vertical lines
            ctx.strokeRect(offset_x + line * tile, offset_y , 0, tile * grid_size * grid_height_by_width_ratio);
        }

        // we draw the pixels
        for (let pixel of this.active_tiles) {
            if ((pixel[0] >= 0 && pixel[0] < grid_size) && (pixel[1] >= 0 && pixel[1] < grid_size)) {
                ctx.fillStyle = "rgba("+ pixel[2].join(",") +"," + 1 + ")";
                ctx.beginPath();
                ctx.rect(pixel[0] * tile + anchor_x, pixel[1] * tile + anchor_y, tile, tile);
                ctx.fill();
            }
        }

    }

    center_grid() {
        let tile = this.get_scale();
        anchor_x = (-grid_size * tile + c.width) / 2
        anchor_y = (-grid_size * tile + c.height) / 2
    }

}

let grid = new Grid()
grid.center_grid()
let last_x = anchor_x, last_y = anchor_y;

function generate_grid() {
    ctx.clearRect(0, 0, c.width, c.height);
    grid.draw(anchor_x,anchor_y)
}

generate_grid()

c.addEventListener("wheel", (e) => {
    zoom_value += e.deltaY > 0 ? 0.1 * zoom_inc : -0.1 * zoom_inc;
    if (zoom_value <= min_zoom || zoom_value >= max_zoom) {
        if (zoom_value <= min_zoom)
            zoom_value = min_zoom
        if (zoom_value >= max_zoom)
            zoom_value = max_zoom
    } else {
        zoom_inc /= e.deltaY > 0 ? 0.95 : 1.05;
    }
    generate_grid()
})

c.addEventListener('mouseup', (e) => {
    is_drawing = false;
    is_erasing = false;
    is_dragging = false;
    c.style.cursor = 'crosshair';
});
si

c.addEventListener("mousedown", (e) => {
    let rect = e.target.getBoundingClientRect();
    const scale_x = c.width / rect.width;
    const scale_y = c.height / rect.height;
    if (e.button === 1) {
        c.style.cursor = "grabbing"
        is_dragging = true;
        delta_x = (e.clientX - rect.left) * scale_x - last_x;
        delta_y = (e.clientY - rect.top) * scale_y - last_y;
    } else if (e.button === 0) {
        is_drawing = true
        grid.add_tile((e.clientX - rect.left) * scale_x, (e.clientY - rect.top) * scale_y)
        generate_grid()
    } else if (e.button === 2) {
        is_erasing = true
        grid.remove_tile((e.clientX - rect.left) * scale_x, (e.clientY - rect.top) * scale_y)
        generate_grid()
    }
}, false)

c.addEventListener('mousemove', (e) => {
    let rect = e.target.getBoundingClientRect();
    const scale_x = c.width / rect.width;
    const scale_y = c.height / rect.height;
    mouse_x = (e.clientX - rect.left) * scale_x;
    mouse_y = (e.clientY - rect.top) * scale_y;
    if (is_dragging) {
        anchor_x = mouse_x - delta_x;
        anchor_y = mouse_y - delta_y;
        last_x = anchor_x;
        last_y = anchor_y;
        generate_grid()
    } else if (is_drawing) {
        grid.add_tile((e.clientX - rect.left) * scale_x, (e.clientY - rect.top) * scale_y)
        generate_grid()
    } else if (is_erasing) {
        grid.remove_tile((e.clientX - rect.left) * scale_x, (e.clientY - rect.top) * scale_y)
        generate_grid()
    }
});

c.addEventListener('mouseleave', () => {
    is_dragging = false;
    c.style.cursor = 'crosshair';
});

c.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});


// Paramters


let range_slider = document.getElementById("myRange")
range_slider.value = grid_size
document.getElementById("demo").innerHTML = grid_size
range_slider.oninput = () => {
    grid_size = Math.floor(max_grid_size * range_slider.value / 100)
    document.getElementById("demo").innerHTML = grid_size
    grid.center_grid()
    last_x = anchor_x
    last_y = anchor_y;
    generate_grid()
}

let sliders = document.getElementsByClassName("color_slider")
let color_viewer = document.getElementById("color")

function update_color() {
    color_viewer.style.backgroundColor = "rgba("+ pixel_color.join(",") +"," + 1 + ")";
}
sliders[0].oninput = () => {
    pixel_color[0] = sliders[0].value
    update_color()
}

sliders[1].oninput = () => {
    pixel_color[1] = sliders[1].value
    update_color()
}

sliders[2].oninput = () => {
    pixel_color[2] = sliders[2].value
    update_color()
}
