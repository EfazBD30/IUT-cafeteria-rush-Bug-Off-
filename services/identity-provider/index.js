// identity provider service - handles student login
// runs on port 3001

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/auth')

const app = express()
const PORT = process.env.PORT || 3001

// middleware setup
app.use(cors())
app.use(express.json())

// simple metrics object - we track requests, errors, and response time
app.locals.metrics = {
    totalRequests: 0,
    errors: 0,
    totalResponseTime: 0,
    requestCount: 0  // used to calculate average
}

// middleware to count every request and measure how long it takes
app.use((req, res, next) => {
    const startTime = Date.now()
    app.locals.metrics.totalRequests++

    // when the response is finished, record how long it took
    res.on('finish', () => {
        const responseTime = Date.now() - startTime
        app.locals.metrics.totalResponseTime += responseTime
        app.locals.metrics.requestCount++
    })

    next()
})

// routes
app.use('/', authRoutes)

// health check - simple endpoint to know if service is alive
app.get('/health', (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "identity-provider",
        port: PORT,
        time: new Date().toISOString()
    })
})

// metrics endpoint - shows how the service is doing
app.get('/metrics', (req, res) => {
    const avgResponseTime = app.locals.metrics.requestCount > 0
        ? Math.round(app.locals.metrics.totalResponseTime / app.locals.metrics.requestCount)
        : 0

    res.status(200).json({
        service: "identity-provider",
        totalRequests: app.locals.metrics.totalRequests,
        totalErrors: app.locals.metrics.errors,
        avgResponseTimeMs: avgResponseTime
    })
})
// chaos engineering endpoint - kills this service when called from admin panel
app.post('/die', (req, res) => {
    console.log('💀 Identity Provider is going down (chaos toggle triggered)')
    console.log('Docker will restart this service automatically')
    
    res.status(200).json({ 
        success: true,
        message: 'Service is shutting down...' 
    })
    
    // kill the process after sending response
    setTimeout(() => {
        process.exit(1)
    }, 100)
})
// chaos engineering endpoint - kills this service when called from admin panel
app.post('/die', (req, res) => {
    console.log('💀 Order Gateway is going down (chaos toggle triggered)')
    console.log('Docker will restart this service automatically')
    
    res.status(200).json({ 
        success: true,
        message: 'Service is shutting down...' 
    })
    
    // kill the process after sending response
    setTimeout(() => {
        process.exit(1)
    }, 100)
})
app.listen(PORT, () => {
    console.log(`Identity Provider running on port ${PORT}`)
})