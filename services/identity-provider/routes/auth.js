// this is where actual login logic lives
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const rateLimiter = require('../middleware/rateLimiter')

// fake student database
const studentDatabase = {
    "240041229": "iutcse229",
    "240041230": "iutcse230",
    "240041210": "iutcse210",
}

// POST /login
router.post('/login', rateLimiter, (req, res) => {
    const studentId = req.body.studentId
    const password = req.body.password

    if (!studentId || !password) {
        req.app.locals.metrics.errors++
        return res.status(400).json({
            success: false,
            message: "Please provide both studentId and password"
        })
    }

    const correctPassword = studentDatabase[studentId]

    if (!correctPassword) {
        req.app.locals.metrics.errors++
        return res.status(401).json({
            success: false,
            message: "Student ID not found"
        })
    }

    if (correctPassword !== password) {
        req.app.locals.metrics.errors++
        return res.status(401).json({
            success: false,
            message: "Wrong password"
        })
    }

    // ✅ FIXED: JWT_SECRET fallback added
    const jwtSecret = process.env.JWT_SECRET || 'mysecretkey123'
    
    const tokenPayload = {
        studentId: studentId,
        role: "student"
    }

    const token = jwt.sign(tokenPayload, jwtSecret, {
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