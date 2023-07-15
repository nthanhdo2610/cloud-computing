const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1'
});

const sns = new AWS.SNS({apiVersion: '2010-03-31'});
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

async function createTopic(topicName) {
  const createTopicParams = {
    Name: topicName
  };

  const createTopicResponse = await sns.createTopic(createTopicParams).promise();
  return createTopicResponse.TopicArn;
}

async function createQueue(queueName) {
  const createQueueParams = {
    QueueName: queueName
  };

  const createQueueResponse = await sqs.createQueue(createQueueParams).promise();
  return createQueueResponse.QueueUrl;
}

async function getQueueArn(queueUrl) {
  const getQueueAttributesParams = {
    QueueUrl: queueUrl,
    AttributeNames: ['QueueArn']
  };

  const getQueueAttributesResponse = await sqs.getQueueAttributes(getQueueAttributesParams).promise();
  return getQueueAttributesResponse.Attributes.QueueArn;
}

async function subscribeQueueToTopic(queueArn, topicArn) {
  const attributes = {
    'RawMessageDelivery': 'true'
  };

  const subscriptionParams = {
    Protocol: 'sqs',
    Endpoint: queueArn,
    TopicArn: topicArn,
    Attributes: attributes
  };

  await sns.subscribe(subscriptionParams).promise();
}

async function publishMessageToTopic(topicArn, message) {
  const publishParams = {
    Message: message,
    TopicArn: topicArn,
    MessageAttributes: {
      'MyCustomAttribute': {
        DataType: 'String',
        StringValue: 'true'
      }
    }
  };

  await sns.publish(publishParams).promise();
}
async function receiveMessagesFromQueue(queueUrl) {
  const receiveMessageParams = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 1,
    VisibilityTimeout: 10,
    WaitTimeSeconds: 20
  };

  const receiveMessageResponse = await sqs.receiveMessage(receiveMessageParams).promise();
  const messages = receiveMessageResponse.Messages;

  if (messages && messages.length > 0) {
    for (const message of messages) {
      // console.log(message.Body);
      if (queueUrl === URL_OF_FIRST_QUEUE) {
        console.log(`Consumer 1: ${message.Body}`);
      } else if (queueUrl === URL_OF_SECOND_QUEUE) {
        console.log(`Consumer 2: ${message.Body}`);
      }

      const deleteMessageParams = {
        QueueUrl: queueUrl,
        ReceiptHandle: message.ReceiptHandle
      };

      await sqs.deleteMessage(deleteMessageParams).promise();
    }
  } else {
    console.log('No messages in the queue.');
  }
}

const NAME_OF_TOPIC = 'my-topic';
let ARN_OF_TOPIC;
const NAME_OF_FIRST_QUEUE = 'my-queue1';
const NAME_OF_SECOND_QUEUE = 'my-queue2';
let URL_OF_FIRST_QUEUE;
let URL_OF_SECOND_QUEUE;
let ARN_OF_FIRST_QUEUE;
let ARN_OF_SECOND_QUEUE;

async function main() {
  // Create the topic
  ARN_OF_TOPIC = await createTopic(NAME_OF_TOPIC);
  console.log('ARN_OF_TOPIC', ARN_OF_TOPIC);

  // Create the first queue
  URL_OF_FIRST_QUEUE = await createQueue(NAME_OF_FIRST_QUEUE);
  ARN_OF_FIRST_QUEUE = await getQueueArn(URL_OF_FIRST_QUEUE);
  console.log('URL_OF_FIRST_QUEUE', URL_OF_FIRST_QUEUE);
  console.log('ARN_OF_FIRST_QUEUE', ARN_OF_FIRST_QUEUE);

  // Create the second queue
  URL_OF_SECOND_QUEUE = await createQueue(NAME_OF_SECOND_QUEUE);
  ARN_OF_SECOND_QUEUE = await getQueueArn(URL_OF_SECOND_QUEUE);
  console.log('URL_OF_SECOND_QUEUE', URL_OF_SECOND_QUEUE);
  console.log('ARN_OF_SECOND_QUEUE', ARN_OF_SECOND_QUEUE);

  // Subscribe the first queue to the topic
  await subscribeQueueToTopic(ARN_OF_FIRST_QUEUE, ARN_OF_TOPIC);

  // Subscribe the second queue to the topic
  await subscribeQueueToTopic(ARN_OF_SECOND_QUEUE, ARN_OF_TOPIC);

  // Publish a message to the topic
  await publishMessageToTopic(ARN_OF_TOPIC, 'hello');

  // // Introduce a delay before consuming messages
  // await new Promise((resolve) => setTimeout(resolve, 5000));

  // Receive and process messages from the first queue
  await receiveMessagesFromQueue(URL_OF_FIRST_QUEUE);

  // Receive and process messages from the second queue
  await receiveMessagesFromQueue(URL_OF_SECOND_QUEUE);
}

main().catch(console.error);
