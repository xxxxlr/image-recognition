var ImgService = require('./imageService');
//Lets require/import the HTTP module
var http = require('http');
var fs = require('fs');
var formidable = require('formidable');
var util = require('util');


//Write to both log file and stdout
//'a':append to previous file.
//'w':truncate the file every time the process starts.
var logFile = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var logStdout = process.stdout;

console.log = function(d) { //
  logFile.write(util.format.apply(null, arguments) + '\n');
  logStdout.write(util.format.apply(null, arguments) + '\n');
};


//Lets define a port we want to listen to
const PORT=4001;

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log(`Server listening on: http://localhost: ${PORT}`);
});

//We need a function which handles requests and send response
function handleRequest(request, response){
    var requestTime = new Date();
    console.log(`Request ${requestTime.getHours()}:${requestTime.getMinutes()}:${requestTime.getSeconds()} -- ${request.connection.remoteAddress}`);
    
    //send 'a' as binary in postman, with/without this encode, it's the same right result
    //but for longer data that ascii can not represent, like image, it's messaged up without it.
    //This tests receiver how to interpret body
    //if the sender side used 'base64', then it should be that
    //request.setEncoding('binary');
    if (request.url == '/connection/test1' && request.method.toLowerCase() == 'post') {
        // parse a file upload
        var form = new formidable.IncomingForm();
        var filePathOnServer = 'upload/' + requestTime.getTime() + '.png';
        form.on('fileBegin', function(name, file) {
            file.path = filePathOnServer;
        });
        form.parse(request, function(err, fields, files) {
            try{
                //Try catch is for checking the chain files.fileUplod.File.path existance.
                //console.log(util.inspect(files));

                //es6 check empty object
                if(Object.keys(files).length === 0 && files.constructor === Object){
                    console.log(`Empty upload!`);
                    response.write('Failed');
                    response.end();
                } else {
                    var imgService = new ImgService({imgPath: filePathOnServer});
                    //==================
                    var ReturnMockAPI = false;
                    if(ReturnMockAPI){
                            response.write("water");
                            response.end();
                            return;
                    }
                    //==================
                    setTimeout(function(){
                        imgService.reqRecogApi(function(result){
                            response.writeHead(200, {'content-type': 'text/plain'});
                            response.write(result);
                            response.end();
                        });
                    }, 3000);
                }
                
            } catch (error){
                console.log(`Upload invalid:`, error);
                response.write('Failed');
                response.end();
            }
            
        }); 

        return;
    }
     
    request.on('error', console.error);
    
    response.write("no more");
    response.end();
}