// kitchen queue service - handles cooking pipeline
// runs on port 3004

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const kitchenRoutes = require('./routes/kitchen')
const { connectToRabbitMQ } = require('./queue/rabbitmq')

const app = express()
const PORT = process.env.PORT || 3004

app.use(cors())
app.use(express.json())

// metrics
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

app.use('/', kitchenRoutes)

app.get('/health', (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "kitchen-queue",
        port: PORT,
        time: new Date().toISOString()
    })
})

app.get('/metrics', (req, res) => {
    const avgTime = app.locals.metrics.requestCount > 0
        ? Math.round(app.locals.metrics.totalResponseTime / app.locals.metrics.requestCount)
        : 0

    res.status(200).json({
        service: "kitchen-queue",
        totalRequests: app.locals.metrics.totalRequests,
        totalErrors: app.locals.metrics.errors,
        avgResponseTimeMs: avgTime
    })
})

// chaos engineering endpoint
app.post('/die', (req, res) => {
    console.log('💀 Kitchen Queue is going down (chaos toggle triggered)')
    console.log('Docker will restart this service automatically')
    
    res.status(200).json({ 
        success: true,
        message: 'Service is shutting down...' 
    })
    
    setTimeout(() => {
        process.exit(1)
    }, 100)
})

// connect to rabbitmq
connectToRabbitMQ()

// ✅ FIXED: Single listen with graceful shutdown
const server = app.listen(PORT, () => {
    console.log(`✅ Kitchen Queue running on port ${PORT}`)
})

// graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...')
    server.close(() => {
        console.log('Server closed')
        process.exit(0)
    })
})

process.on('SIGINT', () => {
    console.log('SIGINT received, closing server...')
    server.close(() => {
        console.log('Server closed')
        process.exit(0)
    })
})