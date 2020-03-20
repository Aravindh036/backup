var fs = require('fs');
var AWS = require('aws-sdk');
var path = require('path');
var json =[
    {
      device: "\\\\.\\PHYSICALDRIVE1",
      displayName: "D:, F:",
      description: "Generic STORAGE DEVICE USB Device",
      size: 7823458304,
      mountpoints: [
        {
          path: "F:/placement"
        }
      ],
      raw: "\\\\.\\PHYSICALDRIVE1",
      protected: true,
      system: false
    }
  ];

getFilesRecursive = (folder, callback) => {
  var fileContents = fs.readdirSync(folder);
  var fileTree = {};

  var totalSize = 0;
  fileContents.forEach(function(fileName) {
    var err = false;
    try {
      var stats = fs.lstatSync(folder + "/" + fileName);
    } catch (e) {
      console.log(e);
      err = true;
    }
    if (!err) {
      if (stats.isDirectory()) {
        console.log("in der",stats);
        fileTree[fileName] = {
          type: "directory"
        };
        var children = getFilesRecursive(folder + "/" + fileName, function(
          size
        ) {
          fileTree[fileName].size = size;
          totalSize += size;
        });
        fileTree[fileName].children = children;
      } else {
        totalSize += stats.size;
        fileTree[fileName] = {
          size: stats.size,
          type: "file"
        };
      }
    }
  });
  if (callback) callback(totalSize);
  console.log(fileTree);
  return fileTree;
};


for (var i in json) {
  var disk = json[i];
  var drive = {};
  console.log(disk);
  var path = disk.mountpoints[0].path + "/";
  console.log("Processing: " + disk.description + " at " + path);
  drive.info = disk;
  console.log(path);
  drive.content = getFilesRecursive(path, function() {
    console.log("processing");
  });
  drive.info.used = 0;
  for (var j in drive.content) {
    drive.info.used += drive.content[j].size;
  }
  var fileContent = JSON.stringify(drive, null, 4);
  var filename = disk.displayName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  console.log(fileContent);
  fs.writeFile("./partitions/" + drive + ".json", fileContent, function() {
    console.log("processing");
  });
}


AWS.config.update({
  accessKeyId: "AKIAIAIRRUW66NKA563A",
  secretAccessKey: "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"
});


var s3 = new AWS.S3();
var filePath = "but.mkv";

s3.upload({  Bucket: 'remote-file-share',  Body : fs.createReadStream(filePath),  Key : filePath }, function (err, data) {
  //handle error
  if (err) {
    console.log("Error", err);
  }

  //success
  if (data) {
    console.log("Uploaded in:", data.Location);
  }
}).on('httpUploadProgress', function(evt) {  
  console.log('Completed ' +  
     (evt.loaded * 100 / evt.total).toFixed() +  
     '% of upload');  
});