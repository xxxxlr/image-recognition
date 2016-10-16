// Read the file into memory.
var fs = require('fs');
var gm = require('gm');
var gcloud = require('google-cloud');
var Vision = gcloud.vision;
var vision = Vision();
var _ = require('underscore');


// var imgPath = './img/hololens.jpg';
var resizedImgPath = './img/resize.png';
var imgDir = './img';



var ImgService = function(imgsReqOpts){
    this.imgPath = imgsReqOpts ? imgsReqOpts.imgPath : '';
    this.imgBase64 = imgsReqOpts ? imgsReqOpts.imgBase64 : '';
    this.imgFile = imgsReqOpts ? imgsReqOpts.imgFile : '';
}

ImgService.prototype = _.extend(ImgService.prototype, {
    reqRecogApi: function(callback){
        if(this.imgPath){
            this.imgFile = fs.readFileSync(this.imgPath);
        } else {
            console.error('Has to use a file path on local disk for now...');
            return;
        }
        var imgPath = this.imgPath;
        // checkImageFileSize(imgFile);
        getSize(this.imgFile).then(function(value){
            console.log(`Original: ${imgPath}:  width:${value.width} x height:${value.height}`)
            return imgPath;
        })
        .then(function(imgPath){
            return generateResizedImage(imgPath, './result/resize.png', 'LABLE_DETECTION');
        })
        .then(function(resizedImgPath){
            return getSize(resizedImgPath)
                .then(function(value){
                    console.log(`Re-dimentioned: ${resizedImgPath}:  width:${value.width} x height:${value.height}`)
                    return resizedImgPath;
                })
        })
        .then(function(resizedImgPath){
            detectLabels(resizedImgPath, callback);
        })
        .catch(function(error){
            console.error(error);
        })
    }
});


/**
 * Uses the Vision API to detect labels in the given file.
 */
function detectLabels (inputFile, callback) {
    console.log(`Sending ${inputFile} to google vision API...`)
    // Make a call to the Vision API to detect the labels
    //console.log('Moking API return:');
    //return callback('Mock anaylysis results');
    vision.detectLabels(inputFile, { verbose: true }, function (err, labels) {
        if (err) {
            return callback(err);
        }
        console.log('API results:', JSON.stringify(labels, null, 2));
        var result = labels.length ? labels[0].desc : "???"
        console.log('Response to Hololens:',result);
        callback(result);
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

module.exports = ImgService;
