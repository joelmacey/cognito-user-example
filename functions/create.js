const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

const table = process.env.TABLE; //This is the table set in the env

module.exports.main = (event, context, callback) => {
    if (!event.requestContext.authorizer) {
      errorResponse('Authorization not configured', context.awsRequestId, callback);
      return;
    }

    console.log('Received event ', event);

    const username = event.requestContext.authorizer.claims['cognito:username'];

    const requestBody = JSON.parse(event.body); //The body of the event
    let item = {
      Id: Date.now().toString()
    }

    recordItem(item, username).then(() => {
        callback(null, {
            statusCode: 201,
            body: JSON.stringify(item),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
    }).catch((err) => {
        console.error(err);
        errorResponse(err.message, context.awsRequestId, callback)
    });
};

function recordItem(item,username) {
    return ddb.put({
        TableName: table,
        Item: item,
    }).promise();
}

// Error Handling
function errorResponse(errorMessage, awsRequestId, callback) {
  callback(null, {
    statusCode: 500,
    body: JSON.stringify({
      Error: errorMessage,
      Reference: awsRequestId,
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}
