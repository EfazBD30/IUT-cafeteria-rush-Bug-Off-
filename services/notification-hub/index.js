// notification hub service - real time updates via websocket
// runs on port 3005

require('dotenv').config()
const express = require('express')
const http = require('http')
const cors = require('cors')
const { setupWebSocket } = require('./websocket/notifier')
const { startListening, closeConnections } = require('./queue/listener')

const app = express()
const PORT = process.env.PORT || 3005

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

app.get('/health', (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "notification-hub",
        port: PORT,
        time: new Date().toISOString()
    })
})

app.get('/metrics', (req, res) => {
    const avgTime = app.locals.metrics.requestCount > 0
        ? Math.round(app.locals.metrics.totalResponseTime / app.locals.metrics.requestCount)
        : 0

    res.status(200).json({
        service: "notification-hub",
        totalRequests: app.locals.metrics.totalRequests,
        totalErrors: app.locals.metrics.errors,
        avgResponseTimeMs: avgTime,
        activeConnections: require('./websocket/notifier').getActiveConnections()
    })
})

// =====================================================
// CHAOS ENGINEERING ENDPOINT - for admin dashboard
// =====================================================
app.post('/die', (req, res) => {
    console.log('💀 Notification Hub is going down (chaos toggle triggered)')
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
// =====================================================

// we need to create an http server manually
// because websocket needs to share the same server
const server = http.createServer(app)

// attach websocket to the http server
setupWebSocket(server)

// start listening to rabbitmq for order updates
startListening()

server.listen(PORT, () => {
    console.log(`✅ Notification Hub running on port ${PORT}`)
    console.log(`✅ WebSocket available at ws://localhost:${PORT}`)
})

// graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing connections...')
    await closeConnections()
    server.close(() => {
        console.log('Server closed')
        process.exit(0)
    })
})

process.on('SIGINT', async () => {
    console.log('SIGINT received, closing connections...')
    await closeConnections()
    server.close(() => {
        console.log('Server closed')
        process.exit(0)
    })
})