const net = require('net');
const createAppInstance = require('./app.js');

const serverPort = 9000;
const appPorts = [3001, 3002, 3003]; // Example app ports


let curr_indx = 0;
const servers = [
    {ip:"localhost:3001", weight: 5},
    {ip:"localhost:3002", weight: 1},
    {ip:"localhost:3003", weight: 3}
]

function findMinServer() {
    const total = servers.reduce((sum, server) => sum + server.weight, 0);
  
    for (let i = 0; i < total; i++) {
      const server = servers[curr_indx];
      curr_indx = (curr_indx + 1) % servers.length;
      const [host, port] = server.ip.split(':');
      return { host, port };
    }
  
    return null;
  }
  

// Create the server instance
const serverInstance = net.createServer(socket => {
  socket.on('data', data => {
    // Request handling logic
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

    // Pass the request to the corresponding appInstance
    const appInstance = getAppInstance();

    appInstance.handle(request, response, () => {
      const responseBody = response._getString();

      const responseHeaders = [
        'HTTP/1.1 200 OK',
        'Content-Type: text/plain',
        `Content-Length: ${Buffer.byteLength(responseBody)}`
      ].join('\r\n');

      socket.write(responseHeaders + '\r\n\r\n' + responseBody);
      prosledi(request);
      socket.end();
    });
  });
});


function prosledi(req){

    console.log("prosledi reqesut",req.body);
    const service = findMinServer();

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

// Start the server
serverInstance.listen(serverPort, () => {
  console.log(`Server listening on port ${serverPort}`);
});

// Create and store multiple app instances
const appInstances = appPorts.map(port => createAppInstance(port));

// Function to get an app instance from the array
function getAppInstance() {
  // Select an app instance randomly or based on your desired logic
  const randomIndex = Math.floor(Math.random() * appInstances.length);
  return appInstances[randomIndex];
}

// Handle server errors
serverInstance.on('error', err => {
  console.error('Server error:', err);
});
