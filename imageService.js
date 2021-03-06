// Read the file into memory.
var fs = require('fs');
var gm = require('gm');
var Vision = require('@google-cloud/vision');
var vision = Vision();
var _ = require('underscore');


// var imgPath = './img/hololens.jpg';
var resizedImgPath = './img/resize.png';
var resizedCropedImgPath = './img/resize_crop.png';
var imgDir = './img';



var ImgService = function(imgsReqOpts){
    this.imgPath = imgsReqOpts ? imgsReqOpts.imgPath : '';
    this.imgBase64 = imgsReqOpts ? imgsReqOpts.imgBase64 : '';
    this.imgFile = imgsReqOpts ? imgsReqOpts.imgFile : '';
    this.timeFrames = [];
    this.taskFrames = [];
}
function benchmarkTime(task, timeFrames, taskFrames){
    timeFrames.push(new Date().getTime());
    taskFrames.push(task);
    
    var len = timeFrames.length;
    if(len > 1){
        console.log(`${task} time cost-->: ${ timeFrames[timeFrames.length - 1] -  timeFrames[timeFrames.length - 2]} ms` );
    } else {
        console.log(`Start from ${task} on timestamp: ${timeFrames[0]}`);
    }
}

ImgService.prototype = _.extend(ImgService.prototype, {
   
    reqRecogApi: function(callback, recogType){
        var requestUniqueId = new Date().getTime();
        console.log(this);
        benchmarkTime('start reqRecogApi', this.timeFrames, this.taskFrames);
        if(this.imgPath){
            this.imgFile = fs.readFileSync(this.imgPath);
            
        } else {
            console.error('Has to use a file path on local disk for now...');
            return;
        }
        var imgPath = this.imgPath;
        benchmarkTime('fs.readFileSync', this.timeFrames, this.taskFrames);
        // checkImageFileSize(imgFile);
        getSize(this.imgFile).then((value) => {
            benchmarkTime('getSize', this.timeFrames, this.taskFrames);
            console.log(`Original: ${imgPath}:  width:${value.width} x height:${value.height}`);            
            return imgPath;
        })
        .then((imgPath) => {
            benchmarkTime('getSize', this.timeFrames, this.taskFrames);
            return generateResizedImage(imgPath, `./result/${requestUniqueId}resize.png`, 'LABLE_DETECTION');
        })
        .then((resizedImgPath) => {
            benchmarkTime('generateResizedImage', this.timeFrames, this.taskFrames);
            return getSize(resizedImgPath)
                .then(function(value){
                    console.log(`Re-dimentioned: ${resizedImgPath}:  width:${value.width} x height:${value.height}`)
                    var cropOptions = {
                        imageSrc: resizedImgPath,
                        imageOutput: resizedCropedImgPath,
                        x: value.width * 0.25,
                        y: value.height * 0.25,
                        width: value.width * 0.5,
                        height: value.height * 0.5,
                    };
                    return cropOptions;
                })
        })
        .then((cropOptions) => {
            benchmarkTime('getSize', this.timeFrames, this.taskFrames);            
            return cropImage(cropOptions.imageSrc, cropOptions.imageOutput, cropOptions);
        })
        .then((resizedCropedImgPath) => {
            benchmarkTime('cropImage', this.timeFrames, this.taskFrames);
            if(recogType === 'TEXT'){
                return detectTexts(resizedCropedImgPath);
            }
            if(recogType === 'LABEL'){
                return detectLabels(resizedCropedImgPath);
            }

        })
        .then((detectedResults) => {
            benchmarkTime('detectLabels', this.timeFrames, this.taskFrames);      
            responseResult(detectedResults, callback);
        })
        .catch(function(error){
            console.error(error);
        })
    }
});

function responseResult(labels, callback){
    var result = '???';
    if(labels.length){
        var init = '';
        result = labels.reduce(function(acc, cur){
            return cur.desc + ';' + acc;
        }, init)
    }
    console.log('Response to Hololens:',result);
    callback(result);
}

/**
 * Uses the Vision API to detect labels in the given file.
 */
function detectLabels (inputFile, callback) {
    console.log(`Sending ${inputFile} to google vision API...`)
    // Make a call to the Vision API to detect the labels
    //console.log('Moking API return:');
    //return callback('Mock anaylysis results');
    return new Promise((resolve, reject) => {
        vision.detectLabels(inputFile, { verbose: true }, function (err, labels) {
            if (err) {
                console.error('vision API detect lable Error:', err);
                reject(err);
            } else {
                console.log('API results:', JSON.stringify(labels, null, 2));
                resolve(labels)
            }
        }); 
    })
    
}

function detectTexts(inputFile, callback){
    console.log(`Sending ${inputFile} to google vision API...`)
    // Make a call to the Vision API to detect the labels
    //console.log('Moking API return:');
    //return callback('Mock anaylysis results');
    return new Promise((resolve, reject) => {
        vision.detectText(inputFile, { verbose: true }, function (err, labels) {
            if (err) {
                console.error('vision API detect text Error:', err);
                reject(err);
            } else {
                console.log('API results:', JSON.stringify(labels, null, 2));
                resolve(labels)
            }
        });
    })

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

function cropImage(imageSrc, imageOutput, cropOptions){
    return new Promise(function(resolve, reject){
        gm(imageSrc).crop(cropOptions.width, cropOptions.height, cropOptions.x, cropOptions.y)
        .write(imageOutput, function (err) {
            if (!err) {
                console.log(`Re-croped: ${imageOutput}: width:${cropOptions.width} x height: ${cropOptions.height}` )
                resolve(imageOutput);
            } else {
                reject(`write error when calling generateResizedImage(${imageSrc}, ${imageOutput})`);
            }
        });
    });
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

