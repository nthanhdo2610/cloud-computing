const coursesServices = require("./coursesServices");
const { buildResponse } = require("./coursesServices");

exports.handler = async (event) => {
    console.log("Request received: " + JSON.stringify(event));
    
    const method = event.httpMethod;
    const path = event.path;
    
    try {
        if (!path.includes("/courses"))
            return buildResponse("Bad request - Requested resource is not available", 400);
        
        switch (method) {
            case 'POST': {
                console.log("POST a course");
                
                const body = JSON.parse(event.body);
                
                if (!body || !body.courseCode || !body.courseName || !body.teacherName || !body.students || !body.monthYear)
                    return buildResponse("Bad request - Required params are missing", 400);
                
                const res = await coursesServices.saveCourse(body);
                
                return buildResponse(JSON.stringify(res), 201);
            }
            
            case 'GET': {
                const queryParams = event.queryStringParameters;
                if (!queryParams) {
                    console.log("GET all courses");
                
                    const courses = await coursesServices.getAllCourses();
                    
                    return buildResponse(JSON.stringify(courses), 200);   
                }
                
                const { courseCode, monthYear, courseName, teacherName } = queryParams;
                
                if (courseCode && monthYear) {
                    console.log(`GET a course by course code [${courseCode}] and block [${monthYear}]`);
                    
                    const courseCodeRegex = new RegExp(/^[A-Z]{2}[0-9]{3}$/);
                    
                    if (!courseCodeRegex.test(courseCode)) {
                        return buildResponse("Bad request - course code is invalid", 400);
                    }
                    
                    const course = await coursesServices.getCourseByCompositeId(courseCode, monthYear);
                    
                    return (course) ? buildResponse(JSON.stringify(course), 200) : buildResponse("no data", 404);
                }
                
                if (courseName) {
                    console.log(`GET courses by a course name [${courseName}]`);
                    
                    const courses = await coursesServices.getCoursesByCourseName(courseName);
                    
                    return buildResponse(JSON.stringify(courses), 200);
                    
                }
                
                if (teacherName) {
                    console.log(`GET courses by a teacher name [${teacherName}]`);
                    
                    const courses = await coursesServices.getCoursesByTeacherName(teacherName);
                    
                    return buildResponse(JSON.stringify(courses), 200);
                }
                
                return buildResponse("Bad request - Invalid parameters", 400);
            }
                
            default:
                return buildResponse("Bad request - Requested resource is not available", 400);
        }
        
    } catch (ex) {
        return buildResponse(JSON.stringify(ex), 500);
    }
    
};

