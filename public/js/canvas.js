const api = "https://postitaltspace.herokuapp.com/api";

var postits = []
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var BB = canvas.getBoundingClientRect();
var offsetX = BB.left;
var offsetY = BB.top;
var WIDTH = canvas.width;
var HEIGHT = canvas.height;
var currentColor = 0;

// drag related variables
var dragok = false;
var startX;
var startY;

const trash = {
    width: 25,
    height: 25,
    posX: WIDTH - 70,
    posY: HEIGHT - 70, 
    image: new Image,
    loaded: false
}
trash.image.addEventListener('load', function(){
    trash.loaded = true;
});

// listen for mouse events
canvas.onmousedown = myDown;
canvas.onmouseup = myUp;
canvas.onmousemove = myMove;

function start()
{
    const params = new URLSearchParams(window.location.search);
    if (!params.has("section"))
    {
        alert("Section not found!!");
        return;
    }
    //load trash image
    trash.image.src = 'bin.png';
    loadPosts();
    // get saved post-its
    setInterval(loadPosts, 5000);
}

async function loadPosts()
{
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");

    if (dragok)
        return;

    const rawResponse = await fetch(`${api}/${section}/post`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
    const content = await rawResponse.json();
    postits = content;
    draw();
}

// draw a single rect
function rect(post) {
    ctx.fillStyle = post.color;
    ctx.beginPath();
    ctx.rect(post.position.x, post.position.y, post.size.x, post.size.y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText(post.text, post.position.x + 5, post.position.y + 25);
}

// clear the canvas
function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

// redraw the scene
function draw() {
    clear();
    ctx.fillStyle = "#FAF7F8";
    ctx.beginPath();
    ctx.rect(0, 0, WIDTH, HEIGHT);
    ctx.closePath();
    ctx.fill();
    // redraw each rect in the rects[] array
    for (var i = 0; i < postits.length; i++) {
        var r = postits[i];
        rect(r);
    }

    //draw trash
    if (trash.loaded)
        ctx.drawImage(trash.image, trash.posX, trash.posY, trash.width, trash.height);
}


async function createPost(text, color)
{
    var post = {
        text: text,
        position: {
            x: 0,
            y: 0
        },
        size: {
            x: 150,
            y: 150
        },
        color: color
    }

    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");
    const rawResponse = await fetch(`${api}/${section}/post`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(post)
    });
    const content = await rawResponse.json();
    postits.push(content);
    console.log("Adicionado!");

    draw();
}

// handle mousedown events
function myDown(e) {

    // tell the browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();

    // get the current mouse position
    var mx = parseInt(e.clientX - offsetX);
    var my = parseInt(e.clientY - offsetY);

    // test each rect to see if mouse is inside
    dragok = false;
    for (var i = postits.length -1; i >= 0; i--) {
        var r = postits[i];
        if (mx > r.position.x && mx < r.position.x + r.size.x && my > r.position.y && my < r.position.y + r.size.y) {
            // if yes, set that rects isDragging=true
            dragok = true;
            r.isDragging = true;
            postits.push(postits.splice(postits.indexOf(i), 1)[0]);
            break;
        }
    }
    // save the current mouse position
    startX = mx;
    startY = my;
}

// handle mouseup events
async function myUp(e) {  
    // tell the browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();

    // clear all the dragging flags
    dragok = false;
    for (var i = 0; i < postits.length; i++) {
        if (postits[i].isDragging)
        {
            postits[i].isDragging = false;
            if (postits[i].position.x > trash.posX && postits[i].position.y > trash.posY) //Delete
            {
                deletePost(postits[i]);
            }
            else //Update
            {
                updatePost(postits[i]);
            }
        }
    }
}

async function updatePost(post) {
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");
    const rawResponse = await fetch(`${api}/${section}/post/${post.id}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(post)
    });
    console.log("Atualizado!");
}

async function deletePost(post) {
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");
    const rawResponse = await fetch(`${api}/${section}/post/${post.id}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
    console.log("Deletado!");
    draw();
}

// handle mouse moves
function myMove(e) {
    // if we're dragging anything...
    if (dragok) {

        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();

        // get the current mouse position
        var mx = parseInt(e.clientX - offsetX);
        var my = parseInt(e.clientY - offsetY);

        // calculate the distance the mouse has moved
        // since the last mousemove
        var dx = mx - startX;
        var dy = my - startY;

        // move each rect that isDragging 
        // by the distance the mouse has moved
        // since the last mousemove
        for (var i = 0; i < postits.length; i++) {
            var r = postits[i];
            if (r.isDragging) {
                r.position.x += dx;
                r.position.y += dy;
            }
        }

        // redraw the scene with the new rect positions
        draw();

        // reset the starting mouse position for the next mousemove
        startX = mx;
        startY = my;

    }
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}