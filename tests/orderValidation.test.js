// tests for order validation logic
// checking if bad requests are properly rejected

const jwt = require('jsonwebtoken')

// the secret key we use to sign tokens - same as in our service
const TEST_SECRET = 'mysecretkey123'

// helper function to create a valid token for testing
function createValidToken(studentId) {
    return jwt.sign(
        { studentId: studentId, role: 'student' },
        TEST_SECRET,
        { expiresIn: '1h' }
    )
}

// helper function to simulate order validation logic
// this is the same logic that runs in order gateway
function validateOrder(orderData, authHeader) {

    // check if auth header exists
    if (!authHeader) {
        return { valid: false, status: 401, message: 'No token provided. Please login first.' }
    }

    // check token format
    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return { valid: false, status: 401, message: 'Token format is wrong.' }
    }

    const token = parts[1]

    // verify the token
    try {
        jwt.verify(token, TEST_SECRET)
    } catch (err) {
        return { valid: false, status: 401, message: 'Token is invalid or expired. Please login again.' }
    }

    // check if food item id is present
    if (!orderData.foodItemId) {
        return { valid: false, status: 400, message: 'Please provide a foodItemId' }
    }

    return { valid: true, status: 200, message: 'Order is valid' }
}

// --- TESTS START HERE ---

// Test 1: order with missing food item id should return error
test('Order with missing foodItemId should return 400 error', () => {
    const validToken = createValidToken('210041101')
    const authHeader = `Bearer ${validToken}`

    // send order without foodItemId
    const result = validateOrder({}, authHeader)

    expect(result.valid).toBe(false)
    expect(result.status).toBe(400)
    expect(result.message).toBe('Please provide a foodItemId')
})

// Test 2: order with invalid token should return 401
test('Order with invalid JWT token should return 401 error', () => {
    // use a fake token that was not signed with our secret
    const fakeToken = 'this.is.a.fake.token'
    const authHeader = `Bearer ${fakeToken}`

    const result = validateOrder({ foodItemId: 'item_1' }, authHeader)

    expect(result.valid).toBe(false)
    expect(result.status).toBe(401)
    expect(result.message).toBe('Token is invalid or expired. Please login again.')
})

// Test 3: valid order with correct token should pass
test('Valid order with correct token should pass validation', () => {
    const validToken = createValidToken('210041101')
    const authHeader = `Bearer ${validToken}`

    const result = validateOrder({ foodItemId: 'item_1', quantity: 1 }, authHeader)

    expect(result.valid).toBe(true)
    expect(result.status).toBe(200)
})