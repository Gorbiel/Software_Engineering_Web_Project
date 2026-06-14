# Search Implementation - Integration Guide

## What Was Implemented

A comprehensive search system for your GlazedIn backend with search functionality for:
- **Users** - search by name, email, job title, bio
- **Teams** - search by name  
- **Achievements (Posts)** - search by title, body, user name

## Key Features

**Pagination** - Configurable page size (20 default, max 100 per page)
**Sorting** - Multiple sort options per entity type
**Filtering** - Entity-specific filters (user status, confirmation status, etc.)
**Metadata API** - Frontend can discover available filters/sorting via dedicated endpoints
**Global Search** - Not limited to user's teams - truly global search
**Public Access** - No authentication required (can be changed if needed)

## API Endpoints

### Users
```
GET /api/users/search/?q=<query>&sort_by=<field>&order=<dir>&active=<true|false>&page_size=<n>&page=<n>
GET /api/users/search/filters_and_sorting/  # Get available options
```

**Sort Options**: `name`, `creation_date`, `email`  
**Filters**: `active` (true/false)

### Teams
```
GET /api/teams/search/?q=<query>&sort_by=<field>&order=<dir>&page_size=<n>&page=<n>
GET /api/teams/search/filters_and_sorting/  # Get available options
```

**Sort Options**: `name`, `creation_date`  
**Filters**: (none currently)

### Achievements
```
GET /api/achievements/search/?q=<query>&sort_by=<field>&order=<dir>&confirmed=<true|false>&min_confirmations=<n>&page_size=<n>&page=<n>
GET /api/achievements/search/filters_and_sorting/  # Get available options
```

**Sort Options**: `creation_date`, `title`  
**Filters**: `confirmed` (true/false), `min_confirmations` (integer)

## Quick Examples

```bash
# Search for users named "john", sorted by name, active only
curl "http://localhost:8000/api/users/search/?q=john&active=true&sort_by=name"

# Search for teams, newest first
curl "http://localhost:8000/api/teams/search/?q=engineering&sort_by=creation_date&order=desc"

# Search achievements titled "deployment", only confirmed ones, with pagination
curl "http://localhost:8000/api/achievements/search/?q=deployment&confirmed=true&sort_by=creation_date&page=1&page_size=20"

# Get available filters and sorting options
curl "http://localhost:8000/api/users/search/filters_and_sorting/"
```

## How to Test

1. **Start your backend**: `python manage.py runserver`

2. **Test user search**:
   ```bash
   curl http://localhost:8000/api/users/search/?q=test
   ```

3. **Test team search**:
   ```bash
   curl http://localhost:8000/api/teams/search/?q=team
   ```

4. **Test achievement search**:
   ```bash
   curl http://localhost:8000/api/achievements/search/?q=achievement
   ```

5. **Get metadata** (for frontend):
   ```bash
   curl http://localhost:8000/api/users/search/filters_and_sorting/
   curl http://localhost:8000/api/teams/search/filters_and_sorting/
   curl http://localhost:8000/api/achievements/search/filters_and_sorting/
   ```

## Frontend Integration

The frontend can:

1. **Discover available options** before rendering search UI:
   ```javascript
   const options = await fetch('/api/users/search/filters_and_sorting/').then(r => r.json());
   // Build dropdown options from options.sort_options
   // Build filter options from options.filter_options
   ```

2. **Perform search** with dynamic query parameters:
   ```javascript
   const params = new URLSearchParams({
     q: searchTerm,
     sort_by: selectedSort,
     order: selectedOrder,
     page_size: pageSize,
     page: currentPage,
     // optional filters:
     active: 'true',
     confirmed: 'true',
     min_confirmations: 5
   });
   
   const results = await fetch(`/api/users/search/?${params}`).then(r => r.json());
   ```

3. **Handle pagination**:
   ```javascript
   // Response includes:
   // - count: total results
   // - next: URL for next page (or null)
   // - previous: URL for previous page (or null)
   // - results: array of items
   ```

## Architecture Notes

- **No authentication required** - Search is public. To lock it down, add this to viewsets:
  ```python
  permission_classes = [IsAuthenticated]
  ```

- **Pagination** - Uses DRF's PageNumberPagination with page numbers (not cursors)

- **Sorting defaults**:
  - Users: by name ascending
  - Teams: by name ascending  
  - Achievements: by creation date descending

- **Search is case-insensitive** - Uses Django's `icontains` lookup

## Customization Options

To modify sorting/filter options in the future:

1. **Add a new sort option** - Update `SORT_OPTIONS` in the viewset
2. **Add a new filter** - Add logic in `get_queryset()` method
3. **Change pagination size** - Modify `page_size` in `SearchResultsSetPagination`
4. **Require authentication** - Add `permission_classes = [IsAuthenticated]` to viewset

See the docstrings in each ViewSet for detailed implementation examples.

## Notes for Frontend Developer

The `filters_and_sorting/` endpoints allow you to dynamically build your search UI without hardcoding options. This makes it easy to add new filters/sorts in the backend without changing the frontend!

Example response structure you can rely on:
```json
{
  "sort_options": ["field1", "field2", ...],
  "filter_options": ["filter1", "filter2", ...]
}
```

Use these to populate dropdowns and enable/disable filter controls based on what the backend supports.

