const net = require('net');
const app = require("./app.js");
//const { json } = require('body-parser');

let curr_indx = 0;
const servers = [
    {ip:"localhost:3000", weight: 5},
    {ip:"localhost:3001", weight: 1},
    {ip:"localhost:3002", weight: 3}
]

function findMinServer(){
    const total = server.reduce((sum,server) =>sum+server.weight,0);

    for(let i= 0;i<total;i++){
        const server = servers[curr_indx];
        curr_indx = (curr_indx+1)%servers.length;
        return server.ip;
    }

    return null;
}

const server = net.createServer(socket => {
  socket.on('data', data => {
    
    const [requestHeader, ...bodyContent] = data.toString().split('\r\n\r\n');

    const [firstLine, ...otherLines] = requestHeader.split('\n');
    const [method, path, httpVersion] = firstLine.trim().split(' ');
    const headers = Object.fromEntries(
      otherLines
        .filter(_ => _)
        .map(line => line.split(':').map(part => part.trim()))
        .map(([name, ...rest]) => [name, rest.join(' ')])
    );
    const host_data = headers['Host'];
    const host = host_data.split(' ').at[0];
    const port= host_data.split(' ').at[1];

    var body;
    try {
      body = JSON.parse(bodyContent);
    } catch (err) {
      console.log("No body");
    }

    const request = {
      method,
      path,
      httpVersion,
      headers,
      body
    };
    //console.log(request);
   
   // const appInstance = createAppInstance(port);

    const response = {
        _response: '',
        _getString() {
          return this._response;
        },
        write(content) {
          this._response += content;
        },
        end() {
          socket.write(`HTTP/1.1 200 OK\r\n\r\n${this._response}`);
          socket.end();
        }
       
      };
    //console.log(response);
    // Pass the request to your router
    app.handle(request, response, () => {
    const responseBody = response._getString();
      
    const responseHeaders = [
        'HTTP/1.1 200 OK',
        'Content-Type: text/plain',
        `Content-Length: ${Buffer.byteLength(responseBody)}`
       // '\r\n'
      ].join('\r\n');



      socket.write(responseHeaders+ '\r\n\r\n' + responseBody);
     
      console.log(request);
      prosledi(request);
      socket.end();
      
    });
  });



});

function prosledi(req){

    console.log("prosledi reqesut",req.body);
    const service = {ip:"localhost",port:2000};
    let r = `${req.method} ${req.path} HTTP/1.1\r\nHost: ${service.ip}:${service.port}}\r\n`;
   

    //ako ima body
    if(req.body===undefined){
        const tmp = r +"\r\n";
        const client = net.createConnection(service,() =>{
            client.write(tmp);
          })
          client.on("data", data=>{
            const re = data.toString();
            const endIndex = re.indexOf("\r\n\r\n")+4;
            const responseData = re.substring(endIndex);
            console.log(responseData);
            client.end();
          })
      
     
        
    }else{
        const headers = {
            'Content-Type':'application/json',
            'Content-Length': `${Buffer.byteLength(JSON.stringify(req.body))}`
          }
          for(const[key,value] of Object.entries(headers)){
            r+=`${key}: ${value}\r\n`;
          }
          r += `\r\n${JSON.stringify(req.body)}`;

          const client = net.createConnection(service,() =>{
            client.write(r);
          })
          client.on("data", data=>{
            const re = data.toString();
            const endIndex = re.indexOf("\r\n\r\n")+4;
            const responseData = re.substring(endIndex);
            console.log(responseData);
            client.end();
          })
            
    }   

}
module.exports = server;

server.listen(9000, () => {
  console.log('Server listening on port 9000');
});
