#!/bin/bash

echo "Testing Login Rate Limiting..."
echo "================================"

# Test login rate limiting - should fail after 5 attempts
for i in {1..7}; do
    echo "Login Attempt $i:"
    response=$(curl -s -w "%{http_code}" -X POST http://localhost:4000/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"name":"testuser","password":"wrongpassword"}' \
        -o response.tmp)
    
    echo "Status Code: $response"
    if [ -f response.tmp ]; then
        echo "Response: $(cat response.tmp)"
        rm response.tmp
    fi
    echo "---"
    sleep 1
done

echo ""
echo "Testing Buy Request Rate Limiting..."
echo "==================================="

# Test buy request rate limiting - should fail after 3 attempts
for i in {1..5}; do
    echo "Buy Request Attempt $i:"
    response=$(curl -s -w "%{http_code}" -X POST http://localhost:4000/api/buy-request \
        -H "Content-Type: application/json" \
        -d '{"name":"Test User","email":"test@example.com","contactNumber":"1234567890","timeToCall":"10:00 AM","description":"Test description"}' \
        -o response.tmp)
    
    echo "Status Code: $response"
    if [ -f response.tmp ]; then
        echo "Response: $(cat response.tmp)"
        rm response.tmp
    fi
    echo "---"
    sleep 1
done

echo "Rate limiting test completed!"
