# Search Implementation Summary

## What's Available

### 1. User Search
- **Endpoint**: `GET /api/users/search/`
- **Search fields**: name, email, job_title, bio_text
- **Sorting**: name, creation_date, email
- **Filtering**: active status (true/false)
- **Discovery**: `GET /api/users/search/filters_and_sorting/`

### 2. Team Search  
- **Endpoint**: `GET /api/teams/search/`
- **Search fields**: name
- **Sorting**: name, creation_date
- **Filtering**: none
- **Discovery**: `GET /api/teams/search/filters_and_sorting/`

### 3. Achievement (Post) Search
- **Endpoint**: `GET /api/achievements/search/`
- **Search fields**: title, body, user.name
- **Sorting**: creation_date, title
- **Filtering**: confirmed status, min_confirmations
- **Discovery**: `GET /api/achievements/search/filters_and_sorting/`

## All Search Features

**Pagination**
- Default: 20 items per page
- Customizable via `page_size` parameter (max 100)
- Includes count, next, previous URLs

**Sorting**  
- Multiple fields per endpoint
- Ascending/descending via `order` parameter
- Defaults vary by endpoint (see docs)

**Filtering**
- Endpoint-specific filters
- Boolean and integer filters supported
- Extensible design

**Metadata Discovery**
- `/filters_and_sorting/` action on each viewset
- Frontend can dynamically build UI
- No hardcoding required on frontend

**Global Search**
- All searches are global (not limited to user's teams)
- Public access (no authentication required)

## Query Parameter Syntax

All search queries require the `q` parameter:

```
GET /api/users/search/?q=search_term
GET /api/users/search/?q=search_term&sort_by=name&order=asc
GET /api/users/search/?q=search_term&sort_by=name&order=asc&page=2&page_size=50
GET /api/users/search/?q=search_term&active=true
```

## How to Use This

### For Frontend Development

1. **Get available options**:
   ```javascript
   // This tells you what sort/filter options are available
   const metadata = await fetch('/api/users/search/filters_and_sorting/').then(r => r.json());
   console.log(metadata.sort_options); // ['name', 'creation_date', 'email']
   console.log(metadata.filter_options); // ['active']
   ```

2. **Perform searches**:
   ```javascript
   const response = await fetch(
     `/api/users/search/?q=${encodeURIComponent(query)}&sort_by=name&page_size=20`
   ).then(r => r.json());
   
   console.log(response.count); // total results
   console.log(response.results); // array of matching users
   console.log(response.next); // URL to next page (or null)
   ```

3. **Build dynamic UI**:
   ```javascript
   // Since you can get available options from the backend,
   // you don't need to hardcode them. This makes it easier
   // to add new sort options in the future without touching frontend code!
   ```

### For Backend Maintenance

To add new sort options or filters:

1. **User search** - Edit `UserSearchViewSet` in `apps/users/views.py`
   - Add to `SORT_OPTIONS` list
   - Add logic to `get_queryset()`

2. **Team search** - Edit `TeamSearchViewSet` in `apps/teams/views.py`
   - Add to `SORT_OPTIONS` list
   - Add logic to `get_queryset()`

3. **Achievement search** - Edit `AchievementSearchViewSet` in `apps/achievements/views.py`
   - Add to `SORT_OPTIONS` list
   - Add logic to `get_queryset()`

## Testing the Endpoints

```bash
# Test basic search
curl "http://localhost:8000/api/users/search/?q=john"

# Test with sorting
curl "http://localhost:8000/api/users/search/?q=john&sort_by=creation_date&order=desc"

# Test with filtering (users)
curl "http://localhost:8000/api/users/search/?q=john&active=true"

# Test with filtering (achievements)
curl "http://localhost:8000/api/achievements/search/?q=python&confirmed=true&min_confirmations=5"

# Get available options
curl "http://localhost:8000/api/users/search/filters_and_sorting/"
curl "http://localhost:8000/api/teams/search/filters_and_sorting/"
curl "http://localhost:8000/api/achievements/search/filters_and_sorting/"
```

## Search Results Format

### User Search Result
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "job_title": "Software Engineer",
  "bio_text": "Passionate about...",
  "profile_picture": "https://...",
  "creation_date": "2024-01-15T10:30:00Z",
  "active": true
}
```

### Team Search Result
```json
{
  "id": 1,
  "name": "Engineering Team",
  "creation_date": "2024-01-15T10:30:00Z"
}
```

### Achievement Search Result
```json
{
  "id": 1,
  "user": {
    "id": 1,
    "name": "John Doe",
    "profile_picture": "https://..."
  },
  "title": "Deployed feature X",
  "body": "Successfully deployed...",
  "creation_date": "2024-01-15T10:30:00Z",
  "confirmation_count": 5
}
```

## Documentation Files

I've created two detailed documentation files in backend/:

1. **SEARCH_ENDPOINTS.md** - Complete API reference with all parameters and examples
2. **SEARCH_IMPLEMENTATION_GUIDE.md** - Integration guide for frontend developers

## Key Implementation Details

- **Framework**: Django REST Framework with ViewSets
- **Pagination**: DRF's PageNumberPagination class
- **Serializers**: Custom serializers for each search type
- **Search**: Case-insensitive `icontains` lookups via Django ORM
- **Extensibility**: Easy to add new sort/filter options
- **Auth**: Currently public (no authentication required)

## What's NOT Included (Future Enhancements)

These could be added later if needed:
- Full-text search (PostgreSQL FTS)
- Elasticsearch integration
- Search autocomplete/suggestions
- Search analytics
- Search result ranking/relevance
- Advanced boolean search operators (AND, OR, NOT)

---

For questions or modifications, refer to:
- SEARCH_ENDPOINTS.md for API details
- SEARCH_IMPLEMENTATION_GUIDE.md for integration examples
- Individual ViewSet docstrings in the code

