var ImgService = require('./imageService');
//Lets require/import the HTTP module
var http = require('http');
var fs = require('fs');
//Lets define a port we want to listen to
const PORT=4001;

//We need a function which handles requests and send response
function handleRequest(request, response){
        var requestTime = new Date();
    const HARD_CODE_PATH = `/connection/test1`;
    //   var uri = url.parse(request.url).pathname
    // , filename = path.join(process.cwd(), uri);


    console.log(`Request ${requestTime.getHours()}:${requestTime.getMinutes()}:${requestTime.getSeconds()} 
        -- ${request.connection.remoteAddress}
        -- ${request.url}`);

    if(request.url !== HARD_CODE_PATH){
        console.log(`Warning: random access to server!`);
        response.write(`You do not have permission!`);
        response.end();
    }

    //console.log(request);
    response.writeHead(200, {'Content-Type': 'application/json'});


    //send 'a' as binary in postman, with/without this encode, it's the same right result
    //but for longer data that ascii can not represent, like image, it's messaged up without it.
    //This tests receiver how to interpret body
    //if the sender side used 'base64', then it should be that
    request.setEncoding('binary');
    var content = '';
    request.on('data', function(chuck){
        content += chuck;
    })
 
    request.on('error', console.error);
    
    request.on('end', function(req, res){
        var outDir= './output/';
        console.log('base 64 raw content:');
        console.log(content.length > 0 ? content.slice(0,4): content = "");
        

        var bufferedContent = new Buffer(content, 'binary');
        console.log('buffered content:');
        var len = bufferedContent.length;
        console.log(bufferedContent.slice(0,4));

//==================
var ReturnMockAPI = false;
if(ReturnMockAPI){
        response.write("mock return");
        response.end();
        return;
}
//==================

        fs.writeFile(outDir + 'bufferedContent.png', bufferedContent, 'binary', function(err){
            //==============
            var imgService = new ImgService({imgPath: outDir + 'bufferedContent.png'});
            imgService.reqRecogApi(function(result){
                response.write(result);
                response.end();
            });
           //==============
            console.log('bufferedContent error:', err);
        })   

        /*==================base64==================
        fs.writeFile(outDir + 'content.png', content, 'base64', function(err){
            console.log('content error:', err);
            console.log('Calling ImgService:');
            
            //==============
            var imgService = new ImgService({imgPath: outDir + 'content.png'});
            imgService.reqRecogApi(function(result){
                response.write(result);
                response.end();
            });
           //==============
            
        })
    */


        /*
         
        Examples for encode, buffer:
        https://nodejs.org/api/buffer.html
NOTE:
content = '我';

http://graphemica.com/%E6%88%91

Encodings：
    URL Escape Code	
        %E6%88%91
    UTF-8 (hex)	
        0xE6 0x88 0x91 (e68891)
    console.log:
        <Buffer e6 88 91>
        
        */
        

/*
NTOE:!!!
var bufferedContent = new Buffer(content, 'base64');
The second param tells buffer, what encoding state the string is at. so it can correctly decode it back to bits and bits.

How file transfer work between client and server with encode and decode and save to local.
e.g.
    :client: ------------------------------------> network ------->------------------------- :server:
string -> base64 encode it ->64ed_string  -------> network -------> recognized the bits stream(64ed_string) as 'base64'ed, and reverse it to get binary then save to fileName.

you can use other encode, just let the receiving side understand how to interperate


*/
/*
'abc'
-> console.log                                                                                                               
<Buffer 61 62 63> 
Note: 
    1.console.log print out byte by byte with space
*/

/*
How do you know if a binary string is image? First few bytes:
Some Extra info about other file format with jpeg: initial of file contains these bytes

BMP : 42 4D
JPG : FF D8 FF EO
PNG : 89 50 4E 47
GIF : 47 49 46 38

when console.log(bufferedContent);
- in buffered content:   
=====                                                                                                           
<Buffer 89 50 4e 47 .. .. .. ..>
=====                                                                                                            

- in raw content:    
=====                                                                                                            
PNG                                                                                                                        
                                                                                                                            
IHDR,y}ud IDATxíwÕ·ßS&(Ì(
.....
====
*/
      


        // var writeStream = fs.createWriteStream(outDir + 'stream.png');
        // writeStream.write(content);
        // writeStream.end();


/*
Good:
    : no need to create a buffer to decode the base64, just write to file as 'baes64'!!!

fs.writeFile("out.png", content, 'base64', function(err) {
  console.log(err);
});

*/

        // This pipes the POST data to the file
        //req.pipe();
    })
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});