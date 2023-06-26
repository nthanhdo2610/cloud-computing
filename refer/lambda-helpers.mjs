import {
    DynamoDBClient,
    GetItemCommand,
    PutItemCommand,
    QueryCommand,
    ScanCommand,
    DeleteItemCommand,
    UpdateItemCommand
} from "@aws-sdk/client-dynamodb";

const tableName = ''; // Put your table name.
const indexName = ''; // Put your index name.
const types = {
    courseCode: "S",
    teacherName: "S",
    courseName: "S",
    month: "N",
    students: "SS",
    year: "N",
};

export const createNewCourse = async (body, dynamodb) => {

    const saveParameters = {
        TableName: tableName,
        Item: {
            "courseCode": {
                S: body.courseCode
            },
            "courseName": {
                S: body.courseName
            },
            "teacherName": {
                S: body.teacherName
            },
            "students": {
                SS: body.students
            },
            "month": {
                N: body.month.toString() // It prevents throwing an exception when you send integer data as 5 instead of "5" by the Postman.
            },
            "year": {
                N: body.year.toString() // It prevents throwing an exception when you send integer data as 5 instead of "5" by the Postman.
            }
        }
    };

    const command = new PutItemCommand(saveParameters);

    return await dynamodb.send(command);
};

export const getCourseByField = async (field, value, dynamodb) => {

    let fieldValue = `:${field}Value`;

    const queryParams = {
        TableName: tableName,
        IndexName: indexName,
        KeyConditionExpression: `${field} = ${fieldValue}`,
        ExpressionAttributeValues: {
            [fieldValue]: {
                "S": value.replace("%20", " ") // For the URL encoding it converts %20 a space. (e.g., Postman will change the "My Course" to "My%20Course")
            }
        }
    };

    const command = new QueryCommand(queryParams);
    return await dynamodb.send(command);
};

export const getCoursesByFilter = async (queryStrings, dynamodb) => {

    let filters = {};

    if (queryStrings) { // It creates the filters automatically using the queries.
        for (const key of Object.keys(queryStrings)) {
            filters[key] = {
                "AttributeValueList": [{
                    [types[key]]: queryStrings[key]
                }],
                "ComparisonOperator": "EQ",
            };
        }
    }

    const scanParams = {
        TableName: tableName
    };

    if (Object.keys(filters).length > 0) {
        scanParams.ScanFilter = filters;
    }

    const command = new ScanCommand(scanParams);

    return await dynamodb.send(command);
};

export const deleteCourse = async (courseCode, teacherName, dynamodb) => {

    const deleteParameters = {
        TableName: tableName,
        Key: {
            "courseCode": {
                "S": courseCode
            },
            "teacherName": {
                "S": teacherName
            }
        }
    };

    const command = new DeleteItemCommand(deleteParameters);
    return await dynamodb.send(command);
};

export const getCourseItem = async (courseCode, teacherName, dynamodb) => {

    const getParams = {
        TableName: tableName,
        Key: {
            "courseCode": {
                S: courseCode.replace("%20", " ")  // For the URL encoding it converts %20 a space. (e.g., Postman will change the "My Course" to "My%20Course")
            },
            "teacherName": {
                S: teacherName.replace("%20", " ") // For the URL encoding it converts %20 a space. (e.g., Postman will change the "My Course" to "My%20Course")
            }
        }
    };

    const command = new GetItemCommand(getParams);

    const result = await dynamodb.send(command);

    return result;
};

export const updateCourse = async (body, dynamodb) => {

    let params = {
        TableName: tableName,
        Key: {},
        UpdateExpression: "SET",
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {}
    };

    for (const key of Object.keys(body)) { // It creates the filters automatically using the sended all 'body' data.
        let typeF = types[key] !== undefined ? types[key] : "S"; // If the field is new, it makes its type as a String ("S").

        // It creates the filters automatically using the all 'body' data.
        if (["courseCode", "teacherName"].includes(key)) {
            params.Key[key] = {
                [typeF]: body[key]
            };
        } else {
            params.UpdateExpression += ` #${key.toLowerCase()} = :${key.toLowerCase()},`;
            params.ExpressionAttributeNames[`#${key.toLowerCase()}`] = key;
            params.ExpressionAttributeValues[`:${key.toLowerCase()}`] = {
                [typeF]: (typeF === "N" ? body[key].toString() : body[key]) // If the field is a Number, it sets its type "N"(number).
            };
        }
    }

    params.UpdateExpression = params.UpdateExpression.replace(/,\s*$/, ""); // It removes the last ',' (comma) from the UpdateExpression field.

    const command = new UpdateItemCommand(params);

    const result = await dynamodb.send(command);

    return result;
};