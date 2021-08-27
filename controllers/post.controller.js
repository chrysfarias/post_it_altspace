const fs = require('fs');
const path = require('path');

function CreateGuid() {  
    function _p8(s) {  
       var p = (Math.random().toString(16)+"000000000").substr(2,8);  
       return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;  
    }  
    return _p8() + _p8(true) + _p8(true) + _p8();  
}  

exports.create = function (req, res) {
    var post = req.body;
    const id = CreateGuid();
    const path = `postits/${id}.json`

    post.id = id;

    fs.writeFile(path, JSON.stringify(post), function (err) {
        if (err) {
            res.sendStatus(500);
            return console.log(err);
        }
    });
    res.send(post);
};

exports.getAll = function  (req, res) {
    var files = fs.readdirSync("postits");
    let postits = [];
    for(var i=0; i<files.length; i++)
    {
        let dir = "postits\\" + files[i];
        if (fs.existsSync(dir))
        {
            let rawdata = fs.readFileSync();
            let json = JSON.parse(rawdata);
            postits.push(json);
        }
    }
    res.send(postits);
};

exports.delete = function (req, res) {
    const id = req.params.id;
    const path = `postits/${id}.json`

    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
        res.sendStatus(200);
        return;
    }
    res.sendStatus(500);
};

exports.update = function  (req, res) {
    const post = req.body;
    const id = req.params.id;
    const path = `postits/${id}.json`

    if (fs.existsSync(path)) {
        fs.writeFile(path, JSON.stringify(post), function (err) {
            if (err) {
                res.sendStatus(500);
                return console.log(err);
            }
        });
        res.sendStatus(200);
        return;
    }
    res.sendStatus(500);
};
