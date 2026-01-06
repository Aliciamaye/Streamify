# Integration Guide - New Improvements

This guide helps you integrate the new improvements into your existing Streamify codebase.

## Quick Start Checklist

### Backend Integration

#### 1. Update User Creation/Registration
When creating new users, assign default role and permissions:

```typescript
import { UserRole, getDefaultPermissionsForRole } from './models/User';

// In your registration handler
const newUser: User = {
  // ... existing fields
  role: UserRole.USER, // Default to USER role
  permissions: getDefaultPermissionsForRole(UserRole.USER),
  isBanned: false,
  // ... other fields
};
```

#### 2. Apply Middleware to Routes
Update your route files to use new middleware:

```typescript
// Example: src/backend/routes/adminRoutes.ts
import { authenticateToken, adminOnly } from '../middleware/authMiddleware';

// Before
router.get('/users', authenticateToken, getAllUsers);

// After  
router.get('/users', authenticateToken, adminOnly, getAllUsers);
```

#### 3. Update JWT Payload
Include role in JWT tokens:

```typescript
// In AuthService.ts
const payload = {
  id: user.id,
  email: user.email,
  username: user.username,
  role: user.role, // ADD THIS
};
```

#### 4. Attach Role to Request
In `authenticateToken` middleware:

```typescript
// After verifying token
(req as any).userId = decoded.id;
(req as any).userEmail = decoded.email;
(req as any).username = decoded.username;
(req as any).userRole = decoded.role; // ADD THIS
```

### Frontend Integration

#### 1. Replace Error Handling
Update components to use new ErrorDisplay:

```typescript
// Before
{error && <div className="errortext-red-500">{error}</div>}

// After
import { ErrorDisplay } from './components/UI/Feedback';

{error && <ErrorDisplay error={error} onRetry={handleRetry} />}
```

#### 2. Add Loading States
Use new loading components:

```typescript
// Before
{isLoading && <div>Loading...</div>}

// After
import { LoadingState } from './components/UI/Feedback';

{isLoading && <LoadingState message="Loading your music..." />}
```

#### 3. Add Debouncing to Search
Update search components:

```typescript
import { useDebounce } from './utils/hooks';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    }
  }, [debouncedQuery]);
  
  return <input onChange={(e) => setQuery(e.target.value)} />;
}
```

#### 4. Use PlayerContext States
Components using PlayerContext now have access to loading  and error states:

```typescript
const { currentTrack, isPlaying, isLoading, error } = usePlayer();

return (
  <div>
    {isLoading && <Spinner />}
    {error && <ErrorDisplay error={error} variant="toast" />}
    {currentTrack && !isLoading && <NowPlaying track={currentTrack} />}
  </div>
);
```

## Migration Examples

### Example 1: Protected Route

**Before:**
```typescript
router.get('/api/admin/stats', authenticateToken, getStats);
```

**After:**
```typescript
import { authenticateToken, adminOnly } from '../middleware/authMiddleware';

router.get('/api/admin/stats', authenticateToken, adminOnly, getStats);
```

### Example 2: Permission-Based Feature

**Add to your component:**
```typescript
import { usePlayer } from './contexts/PlayerContext';

function PlaylistActions() {
  const userPermissions = useLocalStorage('userPermissions', []);
  const canEdit = userPermissions.includes('EDIT_PLAYLIST');
  
  return (
    <div>
      {canEdit && <button>Edit Playlist</button>}
      <button>View Playlist</button>
    </div>
  );
}
```

### Example 3: Enhanced Search

**Before:**
```typescript
const [query, setQuery] = useState('');

const handleSearch = async () => {
  const results = await apiClient.searchMusic(query);
  setResults(results);
};

return <input onChange={(e) => {
  setQuery(e.target.value);
  handleSearch(); // Called on every keystroke!
}} />;
```

**After:**
```typescript
import { useDebounce } from './utils/hooks';

const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 500);

useEffect(() => {
  if (debouncedQuery) {
    apiClient.searchMusic(debouncedQuery)
      .then(setResults);
  }
}, [debouncedQuery]);

return <input onChange={(e) => setQuery(e.target.value)} />;
// API call only happens 500ms after user stops typing!
```

### Example 4: Better Error Handling

**Before:**
```typescript
try {
  const data = await apiClient.getTrendingMusic();
  setTracks(data);
} catch (err) {
  console.error(err);
  alert('Failed to load music');
}
```

**After:**
```typescript
import { ErrorDisplay } from './components/UI/Feedback';

const [error, setError] = useState(null);

const loadTrending = async () => {
  try {
    const response = await apiClient.getTrendingMusic();
    if (response.success) {
      setTracks(response.data.results);
      setError(null);
    } else {
      setError(response.message);
    }
  } catch (err) {
    setError(err.message || 'Failed to load music');
  }
};

return (
  <>
    {error && (
      <ErrorDisplay 
        error={error}
        onRetry={loadTrending}
        variant="inline"
      />
    )}
    {/* ... rest of component */}
  </>
);
```

## Testing New Features

### Test RBAC System
```bash
# 1. Create test users with different roles
POST /api/auth/register
{
  "email": "admin@test.com",
  "username": "admin",
  "password": "test123",
  "role": "admin"  # You'll need to add this in registration
}

# 2. Try accessing admin route
GET /api/admin/users
Authorization: Bearer {token}

# Should work for admin, fail for regular user
```

### Test Retry Logic
```bash
# 1. Disconnect from internet
# 2. Try to play a track
# 3. Watch console - should see retry attempt logs
# 4. Reconnect
# 5. Should  succeed or show user-friendly error
```

### Test Debouncing
```bash
# 1. Go to search page
# 2. Type quickly: "beatles"
# 3. Check network tab - should only see 1-2 requests, not 7
```

## Common Issues & Solutions

### Issue 1: "Cannot find module './models/User'"
**Solution:** Make sure imports are correct. The User module exports enums:
```typescript
import { UserRole, UserPermission, isAdmin } from '../models/User';
```

### Issue 2: "Property 'role' does not exist on type 'User'"
**Solution:** Your existing User interfaces need updating. Check `src/backend/models/User.ts` for the new interface.

### Issue 3: "useDebounce is not a function"
**Solution:** Import correctly:
```typescript
import { useDebounce } from './utils/hooks';
// NOT from 'react' or other libraries
```

### Issue 4: API still retries even when it shouldn't
**Solution:** The retry logic skips 401, 403, 404 errors. Check if your error handling is correct:
```typescript
// In apiClient.ts, errors are already handled
// Just use the response:
const response = await apiClient.searchMusic(query);
if (!response.success) {
  // Handle error - won't retry on these statuses
}
```

## Performance Tips

1. **Use React.memo** with components that receive frequent prop updates
2. **Combine useDebounce with useMemo** for expensive computations
3. **Use useIntersectionObserver** for lazy-loading images/components
4. **Use virtual scrolling** for long lists (implement with existing hooks)

##Rollback Plan

If you need  to rollback changes:

1. **Backend**: Remove role checks from middleware, users can still have roles but they won't be enforced
2. **Frontend**: Old components still work, new components are additive
3. **TypeScript**: The type definitions are strict but won't break existing JavaScript code

## Support

For issues or questions:
1. Check `docs/IMPROVEMENTS_SUMMARY.md` for detailed explanations
2. Review this integration guide
3. Check code comments in new files

## Next Meeting Agenda

Discuss:
1. Which routes need admin protection?
2. Which features should require premium?
3. Database choice for production
4. Testing strategy
5. Deployment plan

---

**Remember**: All changes are backward compatible. Integrate incrementally!

**Last Updated**: 2026-01-06
