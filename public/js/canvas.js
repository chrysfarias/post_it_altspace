const api = "https://postitaltspace.herokuapp.com/api";
//const api = "http://localhost:3000/api";
const colors = ["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e", "#f1c40f", "#e67e22", "#e74c3c"]

var postits = []
var selectedPost = null;
var insertPostInputField = null;

jQuery(document).ready(function($){
    start();
    $("body").click(function(e) {
        if (e.target.nodeName === "BODY")
            cancelAdd();
    });
    $("body").dblclick(addInput);
});
function hex(x) {
  return ("0" + parseInt(x).toString(16)).slice(-2);
}
function rgb2hex(rgb) {
 rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(,\s*\d+\.*\d+)?\)$/);
 return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}
function addInput(e)
{
    var x = e.pageX - this.offsetLeft;
    var y = e.pageY - this.offsetTop;
    cancelAdd();
    insertPostInputField = $('<div/>',{
        class: 'input-post'
    }).appendTo('body')
    insertPostInputField.css({top: y, left: x});
    insertPostInputField.draggable();

    var inputField = $('<textarea/>', {

    }).appendTo(insertPostInputField);
    inputField.focus();

    var addButton = $('<button/>', {
        text: 'Criar'
    }).appendTo(insertPostInputField);
    addButton.click(function(e) {
        var color = rgb2hex(insertPostInputField.css( "background-color" ));
        createPost(inputField.val(), color, x, y);
    })
    var buttons = $('<div/>', {}).appendTo(insertPostInputField);

    colors.forEach(color => {
        var button = $('<button/>', {
            
        }).appendTo(buttons);
        button.css("background-color", color);
        button.click(function(e){
            insertPostInputField.css("background-color", color);
        });
    });
}

function cancelAdd()
{
    insertPostInputField?.remove();
    selectedPost?.element.removeClass('selected')
    selectedPost = null
}

function start()
{
    const params = new URLSearchParams(window.location.search);
    if (!params.has("section"))
    {
        alert("Section not found!!");
        return;
    }
    //load trash image
    loadPosts();
    // get saved post-its
    //setInterval(loadPosts, 5000);
}

async function loadPosts()
{
    clear();
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");

    const rawResponse = await fetch(`${api}/post?section=${section}`, {
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
function clear() {
    postits?.forEach(p => p.element?.remove());
}

// redraw the scene
function draw() {
    // redraw each rect in the rects[] array
    for (var i = 0; i < postits.length; i++) {
        const r = postits[i];
        r.element = $('<div/>',{
            text: r.text,
            class: 'postit'
        }).appendTo('body')
        r.element.attr("tabindex", 0);
        r.element.draggable();
        r.element.css('background-color', r.color);
        r.element.css('width', r.size.x);
        r.element.css('height', r.size.y);
        r.element.css('left', r.position.x);
        r.element.css('top', r.position.y);
        r.element.on('dragstop', function(e) { updatePost(r); })
        r.element.on('click', function(e) {
            cancelAdd();
            selectedPost?.element.removeClass('selected')
            selectedPost = r;
            selectedPost.element.addClass('selected');
            selectedPost.element.focus();
        });
        r.element.on('keydown', function(e) {
            const key = e.which || e.keyCode;
            if (selectedPost != r)
                return;
            if (key === 46) {
                selectedPost = null;
                deletePost(r);
            }
        });
        postits[i] = r;
    }
}


async function createPost(text, color, x, y)
{
    var post = {
        text: text,
        position: {
            x,
            y
        },
        size: {
            x: 85,
            y: 85
        },
        color: color
    }

    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");
    const rawResponse = await fetch(`${api}/post?section=${section}`, {
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
    cancelAdd();
    clear();
    draw();
}
async function updatePost(post) {
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");
    const position = post.element.position();
    post.position = {
        x: position.left,
        y: position.top
    }
    const rawResponse = await fetch(`${api}/post/${post.id}?section=${section}`, {
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
    const rawResponse = await fetch(`${api}/post/${post.id}?section=${section}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
    const index = postits.indexOf(post);
    postits.splice(index, 1);
    post.element.remove();
    console.log("Deletado!");
    clear();
    draw();
}


function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}