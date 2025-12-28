# Sprint 2 Coding Prompt - Core Community Features

You are implementing Sprint 2 of KapwaNet - the Core Community Features that enable real bayanihan (mutual aid).

## Your Mission

Implement features from `.claude/sprint2_feature_list.json` one at a time. This sprint brings the community platform to life with help requests, item sharing, messaging, and moderation.

## Current Sprint Goal

Enable real bayanihan activity:
- Membership & role management
- Bayanihan help (request/offer matching)
- Item sharing (food, clothing, essentials)
- Messaging between matched users
- Moderation & safety tools

## Key Technical Requirements

### Membership Model

```python
class Membership(models.Model):
    ROLES = [
        ('org_admin', 'Organization Admin'),
        ('moderator', 'Moderator'),
        ('member', 'Member'),
    ]
    STATUS = [
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('left', 'Left'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    org = models.ForeignKey(Organization, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLES)
    status = models.CharField(max_length=20, choices=STATUS, default='active')

    class Meta:
        unique_together = ['org', 'user']
```

### Help Post Model

```python
class HelpPost(models.Model):
    TYPES = [('request', 'Request'), ('offer', 'Offer')]
    URGENCY = [('low', 'Low'), ('normal', 'Normal'), ('high', 'High')]
    STATUS = [
        ('open', 'Open'),
        ('matched', 'Matched'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    org = models.ForeignKey(Organization, on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=TYPES)
    category = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    description = models.TextField()
    urgency = models.CharField(max_length=10, choices=URGENCY, default='normal')
    approx_location = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default='open')
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
```

### Help Match Model

```python
class HelpMatch(models.Model):
    STATUS = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('closed', 'Closed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    org = models.ForeignKey(Organization, on_delete=models.CASCADE)
    help_post = models.ForeignKey(HelpPost, on_delete=models.CASCADE)
    requester_user = models.ForeignKey(User, related_name='help_requests')
    helper_user = models.ForeignKey(User, related_name='help_offers')
    status = models.CharField(max_length=20, choices=STATUS, default='pending')
```

### Item Post Model

```python
class ItemPost(models.Model):
    TYPES = [('offer', 'Offer'), ('request', 'Request')]
    STATUS = [
        ('available', 'Available'),
        ('reserved', 'Reserved'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    org = models.ForeignKey(Organization, on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=TYPES)
    category = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    description = models.TextField()
    quantity = models.IntegerField(null=True, blank=True)
    condition = models.CharField(max_length=100, blank=True)
    photos = models.JSONField(default=list)

    # Food safety fields
    food_expiry = models.DateField(null=True, blank=True)
    food_allergens = models.CharField(max_length=255, blank=True)
    food_storage = models.CharField(max_length=100, blank=True)

    status = models.CharField(max_length=20, choices=STATUS, default='available')
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
```

### Messaging Model

```python
class Thread(models.Model):
    TYPES = [
        ('help_match', 'Help Match'),
        ('item_reservation', 'Item Reservation'),
        ('direct', 'Direct'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    org = models.ForeignKey(Organization, on_delete=models.CASCADE)
    thread_type = models.CharField(max_length=20, choices=TYPES)
    ref_id = models.UUIDField(null=True, blank=True)  # Match or reservation ID

class Message(models.Model):
    TYPES = [('user', 'User'), ('system', 'System')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    org = models.ForeignKey(Organization, on_delete=models.CASCADE)
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE)
    sender_user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    message_type = models.CharField(max_length=10, choices=TYPES, default='user')
    body = models.TextField()
```

### Moderation Model

```python
class Report(models.Model):
    TARGET_TYPES = [
        ('user', 'User'),
        ('help_post', 'Help Post'),
        ('item_post', 'Item Post'),
        ('message', 'Message'),
    ]
    STATUS = [('open', 'Open'), ('reviewed', 'Reviewed'), ('closed', 'Closed')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    org = models.ForeignKey(Organization, on_delete=models.CASCADE)
    reporter_user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    target_type = models.CharField(max_length=20, choices=TARGET_TYPES)
    target_id = models.UUIDField()
    reason_code = models.CharField(max_length=50)
    details = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default='open')

class ModerationAction(models.Model):
    ACTIONS = [
        ('warn', 'Warn'),
        ('remove', 'Remove'),
        ('suspend', 'Suspend'),
        ('ban', 'Ban'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    org = models.ForeignKey(Organization, on_delete=models.CASCADE)
    moderator_user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    action_type = models.CharField(max_length=20, choices=ACTIONS)
    target_type = models.CharField(max_length=20)
    target_id = models.UUIDField()
    notes = models.TextField(blank=True)
```

## API Endpoints

### Help Posts
- `GET /api/help-posts/` - List help posts (filtered by org)
- `POST /api/help-posts/` - Create help post
- `GET /api/help-posts/{id}/` - Get help post
- `PATCH /api/help-posts/{id}/` - Update help post
- `POST /api/help-posts/{id}/express-interest/` - Express interest in post
- `POST /api/help-posts/{id}/accept-match/` - Accept a match

### Item Posts
- `GET /api/item-posts/` - List item posts
- `POST /api/item-posts/` - Create item post
- `POST /api/item-posts/{id}/reserve/` - Reserve item
- `POST /api/item-posts/{id}/confirm-pickup/` - Confirm pickup

### Messaging
- `GET /api/threads/` - List threads for user
- `GET /api/threads/{id}/messages/` - Get messages in thread
- `POST /api/threads/{id}/messages/` - Send message

### Moderation
- `POST /api/reports/` - Create report
- `GET /api/moderation/reports/` - List reports (moderator only)
- `POST /api/moderation/actions/` - Take moderation action

## Help Flow

```
1. User A creates help REQUEST
   └── Status: open

2. User B expresses interest (OFFER)
   └── HelpMatch created (status: pending)
   └── Thread created for messaging

3. User A accepts the match
   └── HelpMatch status: accepted
   └── HelpPost status: matched

4. Users communicate via thread

5. User A marks as complete
   └── HelpMatch status: closed
   └── HelpPost status: completed
```

## Item Sharing Flow

```
1. User A creates item OFFER
   └── Status: available

2. User B requests reservation
   └── ItemReservation created (status: pending)
   └── Thread created

3. User A approves reservation
   └── ItemReservation status: approved
   └── ItemPost status: reserved

4. User B confirms pickup
   └── ItemReservation status: confirmed
   └── ItemPost status: completed
```

## Testing Protocol

After EACH feature, run the full test suite:

```bash
# Run full test suite (includes regression tests from Sprint 0 & 1)
./scripts/run_tests.sh

# Or run tests individually:

# 1. Django migrations and tests
docker compose exec api python manage.py makemigrations
docker compose exec api python manage.py migrate
docker compose exec api python manage.py test --verbosity=2

# 2. Frontend tests
docker compose exec web npm test -- --passWithNoTests

# 3. API integration tests
./scripts/test_api.sh
```

### Sprint 2 Specific Tests

```bash
# Get a test token first
TOKEN=$(curl -s -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}' | jq -r '.access')

# Test help post flow
curl -X POST http://localhost:8000/api/help-posts/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"request","category":"transportation","title":"Need ride to hospital"}'

# Test item sharing flow
curl -X POST http://localhost:8000/api/item-posts/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"offer","category":"food","title":"Fresh vegetables"}'

# Test messaging
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/threads/

# Test moderation (moderator role required)
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/moderation/reports/
```

## Regression Testing

**CRITICAL**: After implementing each feature, you MUST verify all previous features still work.

### Regression Checklist

Before marking any feature as `passes: true`, verify:

1. **Sprint 0 still works**:
   - [ ] `docker compose up` brings all services up
   - [ ] API health endpoint returns healthy
   - [ ] Frontend loads at localhost:3000
   - [ ] Django admin accessible

2. **Sprint 1 still works**:
   - [ ] Organizations API works
   - [ ] Theme API works
   - [ ] All blocks render correctly
   - [ ] Templates can be created from library

3. **Previous Sprint 2 features work**:
   - [ ] All previous S2-* features still pass their acceptance criteria
   - [ ] No permission errors for valid users
   - [ ] org_id filtering working on all endpoints

### Run Regression Tests

```bash
# Quick regression check
./scripts/run_tests.sh health

# Full regression (recommended)
./scripts/run_tests.sh

# Check for errors in logs
docker compose logs api --tail=50
docker compose logs web --tail=50
```

## Permission Checks

Every endpoint must verify:
1. User is authenticated
2. User has membership in the org
3. User has required role (for moderator actions)
4. User is not suspended

```python
class OrgMembershipPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        org_id = request.data.get('org_id') or request.query_params.get('org')
        return Membership.objects.filter(
            org_id=org_id,
            user=request.user,
            status='active'
        ).exists()
```

## Safety Rules

1. **No exact addresses** - Only store approximate location
2. **No pricing** - Bayanihan is free, no money exchanged
3. **Prohibited categories** - Block regulated services (medical, legal, childcare)
4. **Report system** - Any content can be reported
5. **Moderation log** - All actions are audited

## Commit Messages

```
S2-B1: Implement help post models and API

- Created HelpPost and HelpMatch models
- Added CRUD endpoints for help posts
- Implemented express interest and accept match actions
- Added org_id filtering on all queries

Acceptance criteria met:
[x] Help posts create/update correctly
[x] Matching flow works end-to-end
[x] org_id isolation enforced
```

## IMPORTANT REMINDERS

1. **org_id on everything** - All queries filter by organization
2. **Permission checks** - Verify membership before any action
3. **Audit logging** - Log moderation actions
4. **No exact addresses** - Only approximate location
5. **Thread per match** - Create messaging thread on match
6. **Status transitions** - Enforce valid status flows

## Start Working

1. Read `.claude/sprint2_feature_list.json` to see current progress
2. Find the first feature where `"passes": false`
3. Implement it following the steps listed
4. Test against acceptance criteria
5. Mark as passing and commit
6. Continue to next feature

Build the tools for communities to help each other with dignity!
