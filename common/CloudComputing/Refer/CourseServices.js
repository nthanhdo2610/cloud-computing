const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
const tableName = process.env.TABLE_NAME;
const courseNameIdx = "courseName-index";
const teacherNameIdx = "teacherName-index";

module.exports = {
    
    saveCourse: async function (course) {
        const { courseCode, courseName, teacherName, students, monthYear } = course;
        
        const saveParams = {
            TableName: tableName,
            Item: {
                "courseCode": {
                    S: courseCode
                },
                "courseName": {
                    S: courseName
                },
                "teacherName": {
                    S: teacherName
                },
                "students": {
                    SS: students
                },
                "monthYear": {
                    S: monthYear
                }
            }
        };
        
        
        return new Promise((resolve, reject) => {
            dynamodb.putItem(saveParams, (err) => {
                if (err) {
                    console.error(JSON.stringify(err));
                    reject("Error while saving a course.");
                } else
                    resolve(saveParams.Item);
            });
        });
    },
    
    getAllCourses: async function () {
        const scanParams = {
            TableName: tableName
        };
        
        return new Promise((resolve, reject) => {
            dynamodb.scan(scanParams, (err, data) => {
                if (err) {
                    console.error(JSON.stringify(err));
                    reject("Error while getting courses by a course name.");
                } else
                    resolve(data.Items);
            });
        });
    },
    
    getCourseByCompositeId: async function (courseCode, monthYear) {
        const getItemParams = {
            TableName: tableName,
            Key: {
                "courseCode": {
                    S: courseCode
                },
                "monthYear": {
                    S: monthYear
                }
            }
        };
        
        return new Promise((resolve, reject) => {
            dynamodb.getItem(getItemParams, (err, data) => {
                if (err) {
                    console.error(JSON.stringify(err));
                    reject("Error while getting a course by a composite id.");
                } else
                    resolve(data.Item);
            });
        });
    },
    
    getCoursesByCourseName: async function (courseName) {
        const queryParams = {
            TableName: tableName,
            IndexName: courseNameIdx,
            KeyConditionExpression: "courseName = :courseNameValue",
            ExpressionAttributeValues: {
                ":courseNameValue": {'S': courseName}
            }
        };
        
        return new Promise((resolve, reject) => {
            dynamodb.query(queryParams, (err, data) => {
                if (err) {
                    console.error(JSON.stringify(err));
                    reject("Error while getting courses by a course name.");
                } else
                    resolve(data.Items);
            });
        });
    },
    
    getCoursesByTeacherName: async function (teacherName) {
        const queryParams = {
            TableName: tableName,
            IndexName: teacherNameIdx,
            KeyConditionExpression: "teacherName = :teacherNameValue",
            ExpressionAttributeValues: {
                ":teacherNameValue": {'S': teacherName}
            }
        };
        
        return new Promise((resolve, reject) => {
            dynamodb.query(queryParams, (err, data) => {
                if (err) {
                    console.error(JSON.stringify(err));
                    reject("Error while getting courses by a teacher name.");
                } else
                    resolve(data.Items);
            });
        });
    },
    
    /**
    * @param {string} msg
    * @param {number} status
    */
    buildResponse: function(msg, status) {
        const response = {
            headers: {
                "Content-type": "application/json"  
            },
            body: msg,
            statusCode: status
        };
        
        return response;
    }
    
};