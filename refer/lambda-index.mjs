import {
    DynamoDBClient
} from "@aws-sdk/client-dynamodb";

import {
    createNewCourse,
    getCourseByField,
    getCoursesByFilter,
    deleteCourse,
    getCourseItem,
    updateCourse
} from './helpers.mjs';

export const handler = async (event) => {

    const dynamodb = new DynamoDBClient({
        apiVersion: "2012-08-10"
    });

    const resource = event.resource;
    const httpMethod = event.httpMethod;
    const pathParameters = event.pathParameters;
    const body = JSON.parse(event.body);

    if (resource === '/course') {

        if (httpMethod === 'GET') {

            const response = await getCoursesByFilter(event.queryStringParameters, dynamodb);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    response
                })
            };

        } else if (httpMethod === 'POST') {

            const response = await createNewCourse(body, dynamodb);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    response
                })
            };

        } else if (httpMethod === 'DELETE') {

            if (body === null || !body.courseCode || !body.teacherName) {
                return {
                    statusCode: 400,
                    body: JSON.stringify("You must pass 'courseCode' and 'teacherName")
                };
            }

            const response = await deleteCourse(body.courseCode, body.teacherName, dynamodb);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    response
                })
            };

        } else if (httpMethod === 'PATCH') {

            if (body === null || !body.courseCode || !body.teacherName) {
                return {
                    statusCode: 400,
                    body: JSON.stringify("You must pass 'courseCode' and 'teacherName")
                };
            }

            const response = await updateCourse(body, dynamodb);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    response
                })
            };
        }
    }


    if (resource === '/course/item' && httpMethod === 'GET') {

        if (!event.queryStringParameters || !event.queryStringParameters.courseCode || !event.queryStringParameters.teacherName) {
            return {
                statusCode: 400,
                body: JSON.stringify("You must pass 'courseCode' and 'teacherName")
            };
        }

        const response = await getCourseItem(event.queryStringParameters.courseCode, event.queryStringParameters.teacherName, dynamodb);

        return {
            statusCode: 200,
            body: JSON.stringify({
                response
            })
        };
    }

    if (resource === '/course/{courseName}' && httpMethod === 'GET') {

        const response = await getCourseByField('courseName', pathParameters.courseName, dynamodb);
        return {
            statusCode: 200,
            body: JSON.stringify({
                response
            })
        };
    }

    return {
        statusCode: 404,
        body: JSON.stringify({
            response: "Not Found"
        })
    };
};