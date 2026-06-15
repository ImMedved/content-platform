# curl API checks

Runnable commands:

```bash
cd backend
npm run test:curl
npm run test:all
```

Base URL used below:

```bash
export API_BASE_URL="http://localhost:5000/api/v1"
```

PowerShell equivalent:

```powershell
$env:API_BASE_URL = "http://localhost:5000/api/v1"
```

## 1. Register two users

```bash
curl -s -X POST "$API_BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"author","email":"author@test.com","password":"123456"}'
```

```bash
curl -s -X POST "$API_BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"reader","email":"reader@test.com","password":"123456"}'
```

## 2. Login and save tokens

```bash
curl -s -X POST "$API_BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"author@test.com","password":"123456"}'
```

```bash
curl -s -X POST "$API_BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"reader@test.com","password":"123456"}'
```

Save the returned JWTs as `AUTHOR_TOKEN` and `READER_TOKEN`.

## 3. Load current users

```bash
curl -s "$API_BASE_URL/users/me" \
  -H "Authorization: Bearer $AUTHOR_TOKEN"
```

```bash
curl -s "$API_BASE_URL/users/me" \
  -H "Authorization: Bearer $READER_TOKEN"
```

Save the author's id as `AUTHOR_ID`.

## 4. Follow and follower lists

```bash
curl -s -X POST "$API_BASE_URL/follow/$AUTHOR_ID" \
  -H "Authorization: Bearer $READER_TOKEN"
```

```bash
curl -s "$API_BASE_URL/users/me/following" \
  -H "Authorization: Bearer $READER_TOKEN"
```

```bash
curl -s "$API_BASE_URL/users/me/followers" \
  -H "Authorization: Bearer $AUTHOR_TOKEN"
```

```bash
curl -s "$API_BASE_URL/users/$AUTHOR_ID/followers"
```

```bash
curl -s "$API_BASE_URL/users/$AUTHOR_ID/following"
```

## 5. Create post

```bash
curl -s -X POST "$API_BASE_URL/posts" \
  -H "Authorization: Bearer $AUTHOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"First post",
    "description":"Post from curl",
    "content":[{"type":"text","value":"Hello from curl"}],
    "access":{"type":"free"}
  }'
```

Save returned `postId` as `POST_ID`.

## 6. Read posts and post detail

```bash
curl -s "$API_BASE_URL/posts"
```

```bash
curl -s "$API_BASE_URL/posts/$POST_ID"
```

```bash
curl -s "$API_BASE_URL/feed" \
  -H "Authorization: Bearer $READER_TOKEN"
```

## 7. Comments

```bash
curl -s -X POST "$API_BASE_URL/comments" \
  -H "Authorization: Bearer $READER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"postId\":$POST_ID,\"content\":\"Nice post\"}"
```

Save returned `commentId` as `COMMENT_ID`.

```bash
curl -s "$API_BASE_URL/comments/post/$POST_ID"
```

```bash
curl -s -X DELETE "$API_BASE_URL/comments/$COMMENT_ID" \
  -H "Authorization: Bearer $READER_TOKEN"
```

## 8. Reactions

```bash
curl -s -X POST "$API_BASE_URL/reactions" \
  -H "Authorization: Bearer $READER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"postId\":$POST_ID,\"type\":\"like\"}"
```

```bash
curl -s "$API_BASE_URL/reactions/$POST_ID"
```

```bash
curl -s -X DELETE "$API_BASE_URL/reactions/$POST_ID" \
  -H "Authorization: Bearer $READER_TOKEN"
```

## 9. User profile

```bash
curl -s "$API_BASE_URL/users/$AUTHOR_ID"
```

## 10. Unfollow

```bash
curl -s -X DELETE "$API_BASE_URL/follow/$AUTHOR_ID" \
  -H "Authorization: Bearer $READER_TOKEN"
```

## Expected response contract

Every endpoint should answer in the same envelope:

```json
{
  "data": "...",
  "error": null
}
```
