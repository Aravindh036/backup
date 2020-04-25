var fs = require('fs');
var AWS = require('aws-sdk');
var path = require('path');
let bodyParser = require('body-parser');
const express = require('express')

const app = express()
const port = 3300
console.log("Initialize indexing....");
console.log("Indexing complete...")
console.log('listening for any new filesystem change...')
var json =[
    {
      device: "\\\\.\\PHYSICALDRIVE1",
      displayName: "C:",
      description: "Generic STORAGE DEVICE",
      size: 7823458304,
      mountpoints: [
        {
          path: "C:/Users/Aravindh/Downloads"
        }
      ],
      raw: "\\\\.\\PHYSICALDRIVE1",
      protected: true,
      system: false
    }
];

getFilesRecursive = (folder, callback) => {
  var fileContents = fs.readdirSync(folder);
  var fileTree = [];
  var index = 0;
  var totalSize = 0;
  fileContents.forEach(function(fileName) {
    var err = false;
    try {
      var stats = fs.lstatSync(folder + "/" + fileName);
    } catch (e) {
      // console.log(e);
      err = true;
    }
    if (!err) {
      if (stats.isDirectory()) {
        // console.log("in der",stats);
        fileTree[index] = {
          name:fileName,
          type: "directory"
        };
        var children = getFilesRecursive(folder + "/" + fileName, function(
          size
        ) {
          fileTree[index].size = size;
          totalSize += size;
        });
        fileTree[index].children = children;
      } else {
        totalSize += stats.size;
        fileTree[index] = {
          name:fileName,
          size: stats.size,
          type: "file"
        };
      }
    }
    index++;
  });
  if (callback) callback(totalSize);
  // console.log(fileTree);
  return fileTree;
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/getJson', (req, res) => {
  for (var i in json) {
    var disk = json[i];
    var drive = {};
    var path = disk.mountpoints[0].path + "/";
    drive.info = disk;
    console.log(path);
    drive.content = getFilesRecursive(path, function() {
    });
    drive.info.used = 0;
    for (var j in drive.content) {
      drive.info.used += drive.content[j].size;
    }
    var fileContent = JSON.stringify(drive, null, 4);
    var filename = disk.displayName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    fs.writeFile("./" + "rootDirectory" + ".json", fileContent, function() {
    });
  }
  res.send(drive);
})

app.post("/uploadFile", (req, res) => {
  console.log(req.body);
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))



AWS.config.update({
  accessKeyId: "<key>",
  secretAccessKey: "<key>"
});


var s3 = new AWS.S3();
var filePath = "but.mkv";

s3.upload({  Bucket: 'remote-file-share',  Body : fs.createReadStream(filePath),  Key : filePath }, function (err, data) {
  //handle error
  if (err) {
    // console.log("Error", err);
  }

  //success
  if (data) {
    // console.log("Uploaded in:", data.Location);
  }
}).on('httpUploadProgress', function(evt) {  
  // console.log('Completed ' +  (evt.loaded * 100 / evt.total).toFixed() +   '% of upload');  
});
