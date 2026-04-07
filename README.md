# MCP API Wrapper Server

This project is a Model Context Protocol (MCP) server that wraps external APIs and exposes them as structured tools for AI agents.

## Features

- MCP server over HTTP (`/mcp`)
- JSONPlaceholder API integration
- Tool schemas defined with Zod
- Filtered responses to reduce noise
- JWT-protected secure tool

## Live Demo (Deployed on Render)

🚀 Live: https://mcp-api-wrapper-http.onrender.com

Base URL:
https://mcp-api-wrapper-http.onrender.com

Health Check:

```bash
curl https://mcp-api-wrapper-http.onrender.com/health
```

MCP Endpoint:
POST https://mcp-api-wrapper-http.onrender.com/mcp

### Initialize MCP session (remote)

```bash
curl -i -N -X POST https://mcp-api-wrapper-http.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-03-26",
      "capabilities": {},
      "clientInfo": {
        "name": "curl-client",
        "version": "1.0.0"
      }
    }
  }'
```

Copy `Mcp-Session-Id` from response headers and reuse it below.

### List tools (remote, session required)

```bash
SESSION_ID="<PASTE_SESSION_ID>"

curl -i -N -X POST https://mcp-api-wrapper-http.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list"
  }'
```

### Call `get_user` (remote, session required)

```bash
SESSION_ID="<PASTE_SESSION_ID>"

curl -i -N -X POST https://mcp-api-wrapper-http.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "get_user",
      "arguments": {
        "userId": 1
      }
    }
  }'
```

### Call `get_posts_by_user` (remote, session required)

```bash
SESSION_ID="<PASTE_SESSION_ID>"

curl -i -N -X POST https://mcp-api-wrapper-http.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "get_posts_by_user",
      "arguments": {
        "userId": 1
      }
    }
  }'
```

### Call `get_secure_data` (remote, session required)

Generate a token locally:

```bash
export JWT_SECRET="my-secret-key"
node --input-type=module -e "import jwt from 'jsonwebtoken'; console.log(jwt.sign({ userId: 1, role: 'admin' }, process.env.JWT_SECRET || 'my-secret-key', { expiresIn: '1h' }));"
```

Use the token:

```bash
SESSION_ID="<PASTE_SESSION_ID>"

curl -i -N -X POST https://mcp-api-wrapper-http.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"id\": 5,
    \"method\": \"tools/call\",
    \"params\": {
      \"name\": \"get_secure_data\",
      \"arguments\": {
        \"token\": \"<PASTE_TOKEN>\"
      }
    }
  }"
```

Notes:

- The service may take 10–30 seconds to respond on first request due to free tier cold start.
- Responses are Server-Sent Events (SSE). Use `-N` in curl to disable buffering.
- This server is session-based. Send `initialize` first and include `Mcp-Session-Id` in follow-up requests.

## Available Tools

### `get_user`

Fetch user details by id.

Input:

```json
{
  "userId": 1
}
```

Output:

```json
{
  "id": 1,
  "name": "Leanne Graham",
  "email": "Sincere@april.biz"
}
```

### `get_posts_by_user`

Fetch a limited list of posts for a user.

Input:

```json
{
  "userId": 1
}
```

Output:

```json
[
  {
    "id": 1,
    "title": "Post title"
  }
]
```

### `get_secure_data`

Fetch protected data using a JWT token.

Input:

```json
{
  "token": "<jwt-token>"
}
```

Output (valid token):

```json
{
  "message": "Access granted",
  "user": {
    "userId": 1,
    "role": "admin"
  },
  "data": "Sensitive information here"
}
```

Output (invalid token):

```text
Unauthorized: Invalid or expired token
```

## Setup

Install dependencies:

```bash
npm install
```

Run in development:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run built server:

```bash
npm start
```

## Test Locally (HTTP)

### 1. Start the server

```bash
npm run dev
```

Server should start on:

```
http://localhost:3000
```

---

### 2. Verify health endpoint

```bash
curl http://localhost:3000/health
```

Expected:

```json
{ "status": "ok" }
```

---

### 3. List available MCP tools

```bash
curl -i -N -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-03-26",
      "capabilities": {},
      "clientInfo": {
        "name": "curl-local",
        "version": "1.0.0"
      }
    }
  }'
```

Expected:

- HTTP 200 response
- `content-type: text/event-stream`
- Response header contains `Mcp-Session-Id`

Note:

- Response is in SSE format (`event: message`, `data: ...`)
- Use `-N` flag in curl to disable buffering

---

### 4. Call `get_user`

```bash
SESSION_ID="<PASTE_SESSION_ID>"

curl -i -N -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "get_user",
      "arguments": {
        "userId": 1
      }
    }
  }'
```

Expected:

- Returns user data (id, name, email)

---

### 5. Call `get_posts_by_user`

```bash
SESSION_ID="<PASTE_SESSION_ID>"

curl -i -N -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "get_posts_by_user",
      "arguments": {
        "userId": 1
      }
    }
  }'
```

Expected:

- Returns list of posts (id + title)

---

### 6. Test `get_secure_data` (JWT)

Set secret (optional, defaults to `my-secret-key`):

```bash
export JWT_SECRET="my-secret-key"
```

Generate token:

```bash
node --input-type=module -e "import jwt from 'jsonwebtoken'; console.log(jwt.sign({ userId: 1, role: 'admin' }, process.env.JWT_SECRET || 'my-secret-key', { expiresIn: '1h' }));"
```

Use token:

```bash
SESSION_ID="<PASTE_SESSION_ID>"

curl -i -N -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"id\": 4,
    \"method\": \"tools/call\",
    \"params\": {
      \"name\": \"get_secure_data\",
      \"arguments\": {
        \"token\": \"<PASTE_TOKEN>\"
      }
    }
  }"
```

Expected:

- Valid token → access granted
- Invalid token → unauthorized error

---

### Troubleshooting

- If no response is shown, ensure:
  - server is running
  - correct port (`3000`)
  - `-N` flag is used in curl
- Always include header:
  ```
  Accept: application/json, text/event-stream
  ```
- For tool calls, also include:
  ```
  Mcp-Session-Id: <SESSION_ID_FROM_INITIALIZE>
  ```
- Restart server after code changes

## Test in Cursor

1. Build and reload MCP:
   - Run `npm run build`
   - Reload Cursor MCP servers
2. Ensure your MCP server is connected.

### Test `get_user`

Prompt:

```text
Get user with id 1
```

Expected: returns `id`, `name`, and `email`.

### Test `get_posts_by_user`

Prompt:

```text
Get posts for user 1
```

Expected: returns a limited list with `id` and `title`.

### Test `get_secure_data`

Set secret (optional, defaults to `my-secret-key`):

```bash
export JWT_SECRET="my-secret-key"
```

Generate token:

```bash
node --input-type=module -e "import jwt from 'jsonwebtoken'; console.log(jwt.sign({ userId: 1, role: 'admin' }, process.env.JWT_SECRET || 'my-secret-key', { expiresIn: '1h' }));"
```

Prompt:

```text
Call get_secure_data with token <PASTE_TOKEN>
```

Expected:

- valid token -> access granted with decoded user payload
- invalid/expired token -> unauthorized error

## MCP Configuration (Cursor)

Add this to your MCP config (`mcp.json`):

```json
{
  "api-wrapper-http": {
    "command": "node",
    "args": ["path-to/dist/server.js"]
  }
}
```

### Using remote MCP (HTTP)

Some clients can connect to a remote MCP server over HTTP. Use:

```json
{
  "api-wrapper-http": {
    "url": "https://mcp-api-wrapper-http.onrender.com/mcp"
  }
}
```

## Project Structure

```text
src/
  server.ts
  tools/
  services/
  utils/
```
