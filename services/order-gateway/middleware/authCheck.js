// this middleware checks if the student has a valid token
// every order request must pass through here first

const jwt = require('jsonwebtoken')

function authCheck(req, res, next) {
    // get the authorization header from the request
    const authHeader = req.headers['authorization']

    // if no authorization header at all, reject immediately
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "No token provided. Please login first."
        })
    }

    // token usually comes as "Bearer eyJhbGci..."
    // we need to split and get just the token part
    const parts = authHeader.split(' ')

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({
            success: false,
            message: "Token format is wrong. Use: Bearer <token>"
        })
    }

    const token = parts[1]

    // now verify the token is real and not expired
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // save the student info so the next handler can use it
        req.student = decoded

        next()

    } catch (err) {
        // token is either fake or expired
        return res.status(401).json({
            success: false,
            message: "Token is invalid or expired. Please login again."
        })
    }
}

module.exports = authCheck