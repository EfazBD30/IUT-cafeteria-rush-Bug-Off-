// this file manages all websocket connections
// when a student opens the page, they connect here
// and we keep track of who is connected

const WebSocket = require('ws')

// store all connected students here
// key = studentId, value = websocket connection
const connectedStudents = {}

function setupWebSocket(server) {
    // create websocket server using the same http server
    const wss = new WebSocket.Server({ server })

    console.log('WebSocket server is ready')

    // when a new student connects
    wss.on('connection', (ws, req) => {
        console.log('New student connected via WebSocket')

        // when student sends their student id to identify themselves
        ws.on('message', (data) => {
            try {
                const parsedData = JSON.parse(data.toString())

                // student should send { type: "identify", studentId: "210041101" }
                if (parsedData.type === 'identify' && parsedData.studentId) {
                    const studentId = parsedData.studentId

                    // save this connection so we can send them updates later
                    connectedStudents[studentId] = ws

                    console.log(`Student ${studentId} identified and connected`)

                    // send confirmation back to student
                    ws.send(JSON.stringify({
                        type: 'connected',
                        message: 'You are connected! Order updates will appear here.'
                    }))
                }

            } catch (err) {
                console.log('Could not parse websocket message:', err.message)
            }
        })

        // when student disconnects (closes browser tab)
        ws.on('close', () => {
            // find and remove this student from our list
            for (const studentId in connectedStudents) {
                if (connectedStudents[studentId] === ws) {
                    delete connectedStudents[studentId]
                    console.log(`Student ${studentId} disconnected`)
                    break
                }
            }
        })

        // handle any websocket errors
        ws.on('error', (err) => {
            console.log('WebSocket error:', err.message)
        })
    })

    return wss
}

// send an update to a specific student
function sendUpdateToStudent(studentId, updateData) {
    const studentConnection = connectedStudents[studentId]

    // check if student is still connected
    if (!studentConnection) {
        console.log(`Student ${studentId} is not connected, skipping update`)
        return
    }

    // check if connection is still open
    if (studentConnection.readyState !== WebSocket.OPEN) {
        console.log(`Student ${studentId} connection is not open`)
        return
    }

    try {
        studentConnection.send(JSON.stringify(updateData))
        console.log(`Update sent to student ${studentId}:`, updateData.status)
    } catch (err) {
        console.log(`Failed to send update to student ${studentId}:`, err.message)
    }
}

module.exports = { setupWebSocket, sendUpdateToStudent }