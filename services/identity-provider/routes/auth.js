// this is where actual login logic lives
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const rateLimiter = require('../middleware/rateLimiter')

// fake student database - in real life this would be a real database
// but for hackathon demo this is fine
const studentDatabase = {
    "240041229": "iutcse229",
    "240041230": "iutcse230",
    "240041210": "iutcse210",
}

// POST /login
// student sends their id and password, we check and give back a token
router.post('/login', rateLimiter, (req, res) => {
    const studentId = req.body.studentId
    const password = req.body.password

    // check if they sent both fields
    if (!studentId || !password) {
        req.app.locals.metrics.errors++
        return res.status(400).json({
            success: false,
            message: "Please provide both studentId and password"
        })
    }

    // check if student id exists in our database
    const correctPassword = studentDatabase[studentId]

    if (!correctPassword) {
        req.app.locals.metrics.errors++
        return res.status(401).json({
            success: false,
            message: "Student ID not found"
        })
    }

    // check if password matches
    if (correctPassword !== password) {
        req.app.locals.metrics.errors++
        return res.status(401).json({
            success: false,
            message: "Wrong password"
        })
    }

    // all good! create a JWT token for this student
    const tokenPayload = {
        studentId: studentId,
        role: "student"
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h"
    })

    res.status(200).json({
        success: true,
        message: "Login successful",
        token: token,
        studentId: studentId
    })
})

module.exports = router