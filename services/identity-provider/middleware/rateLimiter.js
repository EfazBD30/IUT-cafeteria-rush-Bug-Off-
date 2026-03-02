// this file handles rate limiting for login attempts
// we don't want students to spam the login button

// store how many times each student tried to login
// key = studentId, value = { count, firstAttemptTime }
const loginAttempts = {}

function rateLimiter(req, res, next) {
    // get the student id from the request body
    const studentId = req.body.studentId

    // if no student id provided, just let it pass (auth.js will handle the error)
    if (!studentId) {
        return next()
    }

    const now = Date.now()
    const oneMinute = 60 * 1000 // 60 seconds in milliseconds

    // check if this student has tried before
    if (loginAttempts[studentId]) {
        const attemptInfo = loginAttempts[studentId]

        // check if one minute has passed since their first attempt
        const timePassed = now - attemptInfo.firstAttemptTime

        if (timePassed > oneMinute) {
            // reset the counter since one minute has passed
            loginAttempts[studentId] = {
                count: 1,
                firstAttemptTime: now
            }
            return next()
        }

        // still within one minute window
        if (attemptInfo.count >= 3) {
            // they have tried 3 times already, block them
            return res.status(429).json({
                success: false,
                message: "Too many attempts, wait 1 minute"
            })
        }

        // increment the count
        loginAttempts[studentId].count = attemptInfo.count + 1

    } else {
        // first time this student is trying
        loginAttempts[studentId] = {
            count: 1,
            firstAttemptTime: now
        }
    }

    next()
}

module.exports = rateLimiter