//initiate canvas
let c = document.getElementById("grid");
let ctx = c.getContext('2d');

c.width = window.innerWidth;
c.height = window.innerHeight;


//dynamic canvas resize (mandatory)
window.addEventListener("resize", function (){
    c.width = window.innerWidth;
    c.height = window.innerHeight;
})

let zoom_value = 1
let min_zoom = 1
let max_zoom = 10000
let grid_size = 2048
let grid_height_by_width_ratio = 1

let anchor_x = 0
let anchor_y = 0

let is_dragging = false

let delta_x, delta_y;
let last_x = 0, last_y = 0;
let mouse_x = 0, mouse_y = 0;

let pixel_color = "255,0 ,255"



class Grid {
    constructor() {
        this.active_tiles = []
    }

    // this function should return the height and width according to the size
    get_scale() {
        let size = 100 * grid_size / zoom_value
        return Math.floor(size / grid_size)
    }
    add_tile(mouse_x, mouse_y) {
        let tile = this.get_scale()
        let block_position_x = Math.ceil(((mouse_x - anchor_x) - (mouse_x - anchor_x) % tile ) / tile)
        let block_position_y = Math.ceil(((mouse_y - anchor_y) - (mouse_y - anchor_y) % tile) / tile)

        console.log("mous_x: " + mouse_x)
        console.log("anchor_x: " + anchor_x)
        console.log("x: " + block_position_x)
        console.log("y: " + block_position_y)
        console.log("tile: " + tile)
        //this.active_tiles.push([block_position_x, block_position_y])
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
            ctx.fillStyle = "rgba("+ pixel_color +"," + 1 + ")";
            ctx.beginPath();git 
            ctx.rect(pixel[0] + anchor_x, pixel[1] + anchor_y, tile, tile);
            ctx.fill();
        }

    }

}

let grid = new Grid()
grid.draw(anchor_x,anchor_y)

function generate_grid() {
    ctx.clearRect(0, 0, c.width, c.height);
    grid.draw(anchor_x,anchor_y)
}

c.addEventListener("wheel", (e) => {
    zoom_value += e.deltaY > 0 ? 0.1 : -0.1;
    if (zoom_value <= min_zoom || zoom_value >= max_zoom) {
        if (zoom_value <= min_zoom)
            zoom_value = min_zoom
        if (zoom_value >= max_zoom)
            zoom_value = max_zoom
    }
    generate_grid()
})

c.addEventListener('mouseup', (e) => {
    if (e.button === 2) {
        is_dragging = false;
        c.style.cursor = 'grab';
    }

});

c.addEventListener("mousedown", (e) => {
    if (e.button === 2) {
        c.style.cursor = "grabbing"
        is_dragging = true;
        delta_x = e.clientX - last_x;
        delta_y = e.clientY - last_y;
    } else {
        grid.add_tile(e.clientX, e.clientY)
        generate_grid()
    }
}, false)

c.addEventListener('mousemove', (e) => {
    mouse_x = e.clientX
    mouse_y = e.clientY
    if (is_dragging) {
        anchor_x = e.clientX - delta_x;
        anchor_y = e.clientY - delta_y;
        last_x = anchor_x;
        last_y = anchor_y;
        generate_grid()
    }
});

c.addEventListener('mouseleave', () => {
    is_dragging = false;
    c.style.cursor = 'grab';
});

c.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});