## Error format: 
{
  "data": {},
  "error": null
}
{
  "data": null,
  "error": "message"
}

## DDD-lite: 
auth
user
post
social
feed
payment
admin

## API Contracts
### Auth

POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout

register:
req:
{
  "username": "string",
  "email": "string",
  "password": "string"
}

res:
{
  "data": {
    "userId": 1
  }
}

### USER:
GET /api/v1/users/me
GET /api/v1/users/:id
PUT /api/v1/users/me

### POST
POST /api/v1/posts
GET /api/v1/posts/:id
PUT /api/v1/posts/:id
DELETE /api/v1/posts/:id

create post
{
  "title": "string",
  "description": "string",
  "content": [
    {
      "type": "text | image | video",
      "value": "string"
    }
  ],
  "access": {
    "type": "free | paid",
    "price": 10.00
  }
}

### COMMENTS
POST /api/v1/comments
GET /api/v1/posts/:id/comments
DELETE /api/v1/comments/:id

### REACTIONS
POST /api/v1/reactions
DELETE /api/v1/reactions

### FOLLOW
POST /api/v1/follow/:userId
DELETE /api/v1/follow/:userId
GET /api/v1/users/:id/followers
GET /api/v1/users/:id/following

### FEED
GET /api/v1/feed
query: ?page=1&limit=20

### PAYMENT
POST /api/v1/wallet/deposit
GET /api/v1/wallet

POST /api/v1/purchase/:postId
GET /api/v1/purchases

### ADMIN
POST /api/v1/admin/users/:id/block
POST /api/v1/admin/posts/:id/delete

