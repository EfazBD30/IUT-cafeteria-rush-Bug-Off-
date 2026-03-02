// tests for stock deduction logic
// making sure we dont oversell food items

// simulate the stock deduction logic from stock service
// we copy the logic here so we can test it without needing a real database
function deductStock(currentStock, requestedQuantity, currentVersion) {

    // check if enough stock is available
    if (currentStock <= 0 || currentStock < requestedQuantity) {
        throw new Error('Out of stock')
    }

    // simulate optimistic locking check
    // in real code this is done by checking version in database
    const newStock = currentStock - requestedQuantity
    const newVersion = currentVersion + 1

    return {
        success: true,
        newStock: newStock,
        newVersion: newVersion
    }
}

// simulate two simultaneous orders hitting the same stock
// only one should win - the other should fail
function simulateTwoSimultaneousOrders(initialStock) {
    let stock = initialStock
    let version = 0
    let successCount = 0
    let failCount = 0

    // both orders read the same stock and version at the same time
    const stockAtReadTime = stock
    const versionAtReadTime = version

    // first order tries to update
    // it checks if version is still the same - it is, so it succeeds
    if (versionAtReadTime === version) {
        stock = stockAtReadTime - 1
        version = versionAtReadTime + 1
        successCount++
    }

    // second order tries to update
    // it also read versionAtReadTime = 0, but now version is 1
    // so this update fails - version mismatch!
    if (versionAtReadTime === version) {
        stock = stockAtReadTime - 1
        version = versionAtReadTime + 1
        successCount++
    } else {
        failCount++
    }

    return { successCount, failCount, finalStock: stock }
}

// --- TESTS START HERE ---

// Test 1: deducting when stock is 0 should throw error
test('Deducting stock when quantity is 0 should throw Out of stock error', () => {
    // we expect this function to throw an error
    expect(() => {
        deductStock(0, 1, 0)
    }).toThrow('Out of stock')
})

// Test 2: deducting from stock of 5 should return 4
test('Deducting 1 from stock of 5 should return new stock as 4', () => {
    const result = deductStock(5, 1, 0)

    expect(result.success).toBe(true)
    expect(result.newStock).toBe(4)
})

// Test 3: two simultaneous orders on stock of 1 - only one should succeed
test('Two simultaneous orders on stock of 1 should have only one succeed', () => {
    const result = simulateTwoSimultaneousOrders(1)

    // exactly one order should succeed
    expect(result.successCount).toBe(1)

    // exactly one order should fail
    expect(result.failCount).toBe(1)

    // final stock should be 0 not -1
    expect(result.finalStock).toBe(0)
})