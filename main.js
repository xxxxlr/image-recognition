// Read the file into memory.
var fs = require('fs');
var gm = require('gm');
var gcloud = require('google-cloud');
var Vision = gcloud.vision;
var vision = Vision();

var imgPath = './img/six-burgers.JPG';
var resizedImgPath = './img/resize.png';
var imgDir = './img';

var imageFile = fs.readFileSync(imgPath);

// checkImageFileSize(imgPath);
getSize(imgPath).then(function(value){
    console.log(`Original: ${imgPath}:  width:${value.width} x height:${value.height}`)
    return imgPath;
})
.then(function(imgPath){
    return generateResizedImage(imgPath, imgDir + '/resize.png', 'LABLE_DETECTION');
})
.then(function(){
    return getSize(resizedImgPath)
        .then(function(value){
            console.log(`Re-dimentioned: ${resizedImgPath}:  width:${value.width} x height:${value.height}`)
            return resizedImgPath;
        })
})
.then(function(resizedImgPath){
    detectLabels(resizedImgPath, console.log);
})
.catch(function(error){
    console.error(error);
})


/**
 * Uses the Vision API to detect labels in the given file.
 */
function detectLabels (inputFile, callback) {
    console.log(`Sending ${inputFile} to google vision API...`)
    // Make a call to the Vision API to detect the labels
    vision.detectLabels(inputFile, { verbose: true }, function (err, labels) {
        if (err) {
            return callback(err);
        }
        console.log('result:', JSON.stringify(labels, null, 2));
        callback(null, labels);
    });
}
//====================================================
function getSize(imgPath){

    return new Promise((resolve, reject) => {
        gm(imgPath).size(function(err, value){
            if(!err){
                resolve(value);
            } else {
                reject(err);
            }
        })
    });
}
function generateResizedImage(srcImgPath, targetImgPath, type){
    // resize and remove EXIF profile data
    // NOTE: image dimention recommendation: https://cloud.google.com/vision/docs/best-practices
    IDEAL_IMAGE_DIM = {
        LABLE_DETECTION: [640 , 480],
        TEXT_DETECTION:[1024 , 768],
        FACE_DETECTION:[1600 , 1200],
        LANDMARK_DETECTION:[640 , 480],
        LOGO_DETECTION:[640 , 480]
    }
    return new Promise((resolve, reject) => {
        gm(srcImgPath)
        .resize(...IDEAL_IMAGE_DIM[type])
        .noProfile()
        .write(targetImgPath, function (err) {
            if (!err) {
                resolve(targetImgPath);
            } else {
                reject(`write error when calling generateResizedImage(${srcImgPath}, ${targetImgPath})`);
            }
        });
    })
    
}

function checkImageFileSize(imgPath){
    var stats = fs.statSync(imgPath)
    var fileSizeInBytes = stats['size']
    //Convert the file size to megabytes (optional)
    var fileSizeInMegabytes = fileSizeInBytes / 1000000.0

    if(fileSizeInMegabytes >= 4){
        throw Error(`File size, ${fileSizeInMegabytes}MB is too big. Google vision API limit 4MB per image(https://cloud.google.com/vision/limits)`)
    }

    console.log(`Image size: ${fileSizeInMegabytes} MB`);
}