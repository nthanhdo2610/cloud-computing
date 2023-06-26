const AWS = require("aws-sdk");
const sns = new AWS.SNS({apiVersion: '2010-03-31'});
const dynamodb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
const tableName = process.env.COURSE_TABLE;
const topicArn = process.env.TOPIC_ARN;

exports.handler = async (event) => {
    console.log("New message from a visitor: " + JSON.stringify(event));
    
    const invalidReq = {
	    statusCode: 400,
        headers: {
            "Access-Control-Allow-Origin" : "*",
            "Access-Control-Allow-Credentials" : true
        },
	    body: JSON.stringify('Invalid request')
	};
    
    if (event.httpMethod === "POST") {
        if (event.path === "/contact") {
            try {
                const body = JSON.parse(event.body);
                
                if (!body || !body.Email || !body.GuestName || !body.Message) {
                    console.log("Invalid request - Required params are missing.");
                    return invalidReq;
                }
                
                let emailSubject = `${body.GuestName} messaged you on unubold.com!`;
                
                const snsParams = {
                    Message: JSON.stringify({
                        subject: body.MessageTitle,
                        email: body.Email,
                        phone: body.Phone,
                        message: body.Message
                    }),
                    Subject: emailSubject,
                    TopicArn: topicArn
                };
                
                const res = await sns.publish(snsParams).promise();
                
                console.log("Successfully sent email: " + JSON.stringify(res));
                
                // Saving a message in the DB
                const saveParams = {
                    TableName: tableName,
                    Item: {
                        "MessageTitle": {
                            S: body.MessageTitle
                        },
                        "Email": {
                            S: body.Email
                        },
                        "Phone": {
                            S: body.Phone
                        },
                        "Message": {
                            S: body.Message
                        },
                        "GuestName": {
                            S: body.GuestName
                        }
                    }
                };
                
                await dynamodb.putItem(saveParams).promise();
                
                return {
                    statusCode: 200,
                    headers: {
                        "Access-Control-Allow-Origin" : "*",
                        "Access-Control-Allow-Credentials" : true
                    },
                    body: JSON.stringify('Success')
                };
                
            } catch (err) {
                const msg = "System error while sending SNS or saving DynamoDB";
                
                console.log(msg + ": " + JSON.stringify(err));
                
                return {
                    statusCode: 500,
                    headers: {
                        "Access-Control-Allow-Origin" : "*",
                        "Access-Control-Allow-Credentials" : true
                    },
                    body: JSON.stringify(msg)
                };
            }
            
        } else {
            console.log("Invalid request - Wrong endpoint.");
            return invalidReq;
        }
        
    } else {
        console.log("Invalid request - Wrong http method.");
        return invalidReq;
    }
};
