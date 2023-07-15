const port = process.env.PORT || 3000,
    http = require('http'),
    fs = require('fs'),
    html = fs.readFileSync('index.html');

const AWS = require('aws-sdk');
const db = new AWS.DynamoDB({
  region: 'us-east-1'
});
const log = function(entry) {
    fs.appendFileSync('/tmp/sample-app.log', new Date().toISOString() + ' - ' + entry + '\n');
};

// import os module
const os = require("os");

// get host name
const hostName = os.hostname();
const server = http.createServer(function (req, res) {
    if (req.method === 'POST') {
        let body = '';

        req.on('data', function(chunk) {
            body += chunk;
        });

        req.on('end', function() {
            if (req.url === '/') {
                log('Received message: ' + body);
            } else if (req.url = '/scheduled') {
                log('Received task ' + req.headers['x-aws-sqsd-taskname'] + ' scheduled at ' + req.headers['x-aws-sqsd-scheduled-at']);
            }

            res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
            res.end();
        });
    } else if(req.method === 'GET' && req.url === '/thanhdonguyen') {
        db.getItem({
            Key: {
                cid: {S: 'lb-counter'},
            },
            TableName: 'Counter'
        }, (err, data) => {
            if (err) {
             console.error('error', err);
            } else {
                let counter = 1;
                console.log('data.Item', data.Item);
                if (data.Item) {
                    counter = data.Item.value.S;
                    if(counter === 'NaN' || counter == undefined){
                        console.log('Counter: ' + counter);  
                        counter = 1;
                    } else {
                        counter = Number(counter) + 1;
                    }  
                }
                db.putItem({
                    Item: {
                      cid: {S: 'lb-counter'},
                      value: {S: counter.toString()}
                    },
                    TableName: 'Counter'
                }, (err) => {
                    if (err) {
                        console.error('error', err);
                    } else {
                        console.log('Counter update with cid lb-counter');
                    }
                }); 
                res.writeHead(200);
                res.write('<h1>Hello from '+hostName+' Counter: '+counter+'</h1>');
                res.end();
            }
        });
        
    } else {
        res.writeHead(200);
        res.write('<h1>Hello from '+hostName+'</h1>');
        res.end();
    }
});

const getCounter = () =>{
    const params = {
        Key: {
            cid: {S: 'lb-counter'},
        },
        TableName: 'Counter'
    };
  db.getItem(params, (err, data) => {
    if (err) {
      console.error('error', err);
    } else {
      if (data.Item) {
        return 1;
        // Number(data.Item.S);
      } else {
        return 0;
      }
    }
  });
}

// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);

// Put a friendly message on the terminal
console.log('Server running at '+hostName+':' + port + '/');
