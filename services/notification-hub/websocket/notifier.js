// this file manages all websocket connections
const WebSocket = require('ws')

// ✅ FIXED: Use Map instead of object
const connectedStudents = new Map()

function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server })

    console.log('✅ WebSocket server is ready on port 3005')

    wss.on('connection', (ws, req) => {
        console.log('🔌 New student connected via WebSocket')
        
        ws.on('message', (data) => {
            try {
                const parsedData = JSON.parse(data.toString())

                if (parsedData.type === 'identify' && parsedData.studentId) {
                    const studentId = parsedData.studentId

                    // if student was already connected, close old connection
                    if (connectedStudents.has(studentId)) {
                        const oldWs = connectedStudents.get(studentId)
                        if (oldWs.readyState === WebSocket.OPEN) {
                            oldWs.close()
                        }
                    }

                    connectedStudents.set(studentId, ws)
                    ws.studentId = studentId

                    console.log(`✅ Student ${studentId} identified and connected`)
                    console.log(`Active connections: ${connectedStudents.size}`)

                    ws.send(JSON.stringify({
                        type: 'connected',
                        message: 'You are connected! Order updates will appear here.'
                    }))
                }

            } catch (err) {
                console.log('❌ Could not parse websocket message:', err.message)
            }
        })

        // ✅ FIXED: Proper cleanup on disconnect
        ws.on('close', () => {
            if (ws.studentId) {
                connectedStudents.delete(ws.studentId)
                console.log(`🔴 Student ${ws.studentId} disconnected`)
                console.log(`Active connections: ${connectedStudents.size}`)
            }
        })

        ws.on('error', (err) => {
            console.log('⚠️ WebSocket error:', err.message)
        })

        // ✅ FIXED: Keep connection alive with ping-pong
        const interval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.ping()
            } else {
                clearInterval(interval)
            }
        }, 30000)
    })

    return wss
}

function sendUpdateToStudent(studentId, updateData) {
    const studentConnection = connectedStudents.get(studentId)

    if (!studentConnection) {
        console.log(`⚠️ Student ${studentId} is not connected, skipping update`)
        return false
    }

    if (studentConnection.readyState !== WebSocket.OPEN) {
        console.log(`⚠️ Student ${studentId} connection is not open`)
        connectedStudents.delete(studentId)
        return false
    }

    try {
        studentConnection.send(JSON.stringify(updateData))
        console.log(`✅ Update sent to student ${studentId}:`, updateData.status)
        return true
    } catch (err) {
        console.log(`❌ Failed to send update to student ${studentId}:`, err.message)
        return false
    }
}

function getActiveConnections() {
    return connectedStudents.size
}

module.exports = { 
    setupWebSocket, 
    sendUpdateToStudent,
    getActiveConnections 
}