## Vehicle Maintenance Scheduler - Setup Complete

### Current Status
✅ Server running on port 3000
✅ dotenv installed and configured
✅ Environment variables loading correctly
✅ Authentication mechanism implemented
✅ Notification endpoints working
✅ Knapsack algorithm implemented
✅ Error handling in place

### Working Endpoints

1. **GET /** - Server health check
   ```bash
   curl http://localhost:3000/
   # Response: {"message":"Server is running"}
   ```

2. **GET /notifications** - List all notifications
   ```bash
   curl http://localhost:3000/notifications
   ```

3. **GET /notifications/unread/:userId** - Get unread notifications
   ```bash
   curl http://localhost:3000/notifications/unread/user1
   ```

4. **POST /notifications** - Create notification
   ```bash
   curl -X POST http://localhost:3000/notifications \
     -H "Content-Type: application/json" \
     -d '{"userId":"user1","message":"Test","type":"Event"}'
   ```

5. **POST /notifications/read** - Mark as read
   ```bash
   curl -X POST http://localhost:3000/notifications/read \
     -H "Content-Type: application/json" \
     -d '{"notificationIds":[1,2]}'
   ```

6. **GET /notifications/priority/:n** - Get priority notifications
   ```bash
   curl http://localhost:3000/notifications/priority/5
   ```

### Endpoints Requiring Valid Credentials

7. **GET /schedule/:depotId** - Schedule optimization
   ```bash
   curl http://localhost:3000/schedule/1
   ```
   
   **Status**: Auth failing - credentials not registered
   - The authentication mechanism is working correctly
   - Error: "provided fields does not match with any of our registered"
   - This means the .env credentials need to be registered with evaluation-service

### Environment Variables (.env)
```
PORT=3000
EMAIL=anujsaxena27x1@gmail.com
NAME=Anuj Saxena
ROLL_NO=RA2311003011063
ACCESS_CODE=QkbpxH
CLIENT_ID=90ad7805-6425-47bd-8a33-1b9a5f158109
CLIENT_SECRET=gRWcVyPmBtEHUqaW
```

### To Fix Schedule Endpoint

The credentials must be registered with the evaluation service. Contact the admin to register:
- Email: anujsaxena27x1@gmail.com
- Name: Anuj Saxena
- Roll No: RA2311003011063
- Access Code: QkbpxH

Or use different registered credentials in .env

### Implementation Details

**Authentication Flow**:
1. getToken() called → POST to /auth endpoint
2. Returns access_token on success
3. Token cached for 1 hour
4. All API calls use: Authorization: Bearer {token}

**Knapsack Algorithm**:
- Dynamic programming approach
- Maximizes Impact while staying within MechanicHours capacity
- Returns selected tasks with total time and impact

**Logging**:
- All requests logged with timestamps
- Auth errors logged
- API start/success/error logged

### Tech Stack
- Node.js + Express
- axios (HTTP client)
- dotenv (environment management)
- Custom logger middleware
