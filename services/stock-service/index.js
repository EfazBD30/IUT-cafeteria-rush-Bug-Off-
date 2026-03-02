// stock service - manages food inventory
// runs on port 3003

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const stockRoutes = require('./routes/stock')

const app = express()
const PORT = process.env.PORT || 3003

app.use(cors())
app.use(express.json())

// metrics tracking
app.locals.metrics = {
    totalRequests: 0,
    errors: 0,
    totalResponseTime: 0,
    requestCount: 0
}

app.use((req, res, next) => {
    const startTime = Date.now()
    app.locals.metrics.totalRequests++

    res.on('finish', () => {
        const timeTaken = Date.now() - startTime
        app.locals.metrics.totalResponseTime += timeTaken
        app.locals.metrics.requestCount++
    })

    next()
})

app.use('/', stockRoutes)

app.get('/health', (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "stock-service",
        port: PORT,
        time: new Date().toISOString()
    })
})

app.get('/metrics', (req, res) => {
    const avgTime = app.locals.metrics.requestCount > 0
        ? Math.round(app.locals.metrics.totalResponseTime / app.locals.metrics.requestCount)
        : 0

    res.status(200).json({
        service: "stock-service",
        totalRequests: app.locals.metrics.totalRequests,
        totalErrors: app.locals.metrics.errors,
        avgResponseTimeMs: avgTime
    })
})
// chaos engineering endpoint - kills this service when called from admin panel
app.post('/die', (req, res) => {
    console.log('💀 Stock Service is going down (chaos toggle triggered)')
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
    console.log(`Stock Service running on port ${PORT}`)
})