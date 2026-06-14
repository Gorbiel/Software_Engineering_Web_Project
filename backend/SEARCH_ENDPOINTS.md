# Search Endpoints Documentation

This document describes the search endpoints implemented for the GlazedIn backend.

## Overview

The search functionality has been added to three apps:
- **Users**: Search for users by name, email, job title, or bio
- **Teams**: Search for teams by name
- **Achievements (Posts)**: Search for achievements by title, body, or user name

All search endpoints support:
- **Pagination** with configurable page size (20 items per page by default, max 100)
- **Sorting** with multiple sort options per endpoint
- **Filtering** with endpoint-specific filters
- **Metadata endpoint** to expose available sorting and filtering options

## User Search

**Endpoint**: `GET /api/users/search/`

### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `q` | string | Search query (required) | `john` |
| `sort_by` | string | Sort field: `name`, `creation_date`, `email` | `name` |
| `order` | string | Sort order: `asc` or `desc` | `asc` |
| `page_size` | integer | Results per page (default: 20, max: 100) | `20` |
| `active` | string | Filter by status: `true` or `false` | `true` |

### Searchable Fields

- User name (case-insensitive)
- Email address (case-insensitive)
- Job title (case-insensitive)
- Bio text (case-insensitive)

### Examples

```bash
# Search for active users named "John"
GET /api/users/search/?q=john&active=true&sort_by=name&order=asc

# Search for users by email, sorted by creation date
GET /api/users/search/?q=smith@example.com&sort_by=creation_date&order=desc

# Paginate results
GET /api/users/search/?q=test&page=2&page_size=50
```

### Available Filters and Sorting

Get available options via:
```bash
GET /api/users/search/filters_and_sorting/
```

Response:
```json
{
  "sort_options": ["name", "creation_date", "email"],
  "filter_options": ["active"]
}
```

## Team Search

**Endpoint**: `GET /api/teams/search/`

### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `q` | string | Search query (required) | `engineering` |
| `sort_by` | string | Sort field: `name`, `creation_date` | `name` |
| `order` | string | Sort order: `asc` or `desc` | `asc` |
| `page_size` | integer | Results per page (default: 20, max: 100) | `20` |

### Searchable Fields

- Team name (case-insensitive)

### Examples

```bash
# Search for teams containing "engineering"
GET /api/teams/search/?q=engineering&sort_by=name&order=asc

# Search teams sorted by creation date (newest first)
GET /api/teams/search/?q=team&sort_by=creation_date&order=desc

# Paginate results
GET /api/teams/search/?q=backend&page=2&page_size=25
```

### Available Filters and Sorting

Get available options via:
```bash
GET /api/teams/search/filters_and_sorting/
```

Response:
```json
{
  "sort_options": ["name", "creation_date"],
  "filter_options": []
}
```

## Achievement Search

**Endpoint**: `GET /api/achievements/search/`

### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `q` | string | Search query (required) | `deployed` |
| `sort_by` | string | Sort field: `creation_date`, `title` | `creation_date` |
| `order` | string | Sort order: `asc` or `desc` | `desc` |
| `page_size` | integer | Results per page (default: 20, max: 100) | `20` |
| `confirmed` | string | Filter: `true` (confirmed only) or `false` (unconfirmed only) | `true` |
| `min_confirmations` | integer | Minimum number of confirmations | `5` |

### Searchable Fields

- Achievement title (case-insensitive)
- Achievement body/description (case-insensitive)
- Creator's name (case-insensitive)

### Examples

```bash
# Search for achievements about "deployment", only confirmed ones
GET /api/achievements/search/?q=deployment&confirmed=true&sort_by=creation_date&order=desc

# Find unconfirmed achievements with at least 3 confirmations (edge case - will return empty)
GET /api/achievements/search/?q=test&confirmed=false&min_confirmations=3

# Search achievements by creator name
GET /api/achievements/search/?q=John&sort_by=title&order=asc

# Find highly confirmed achievements
GET /api/achievements/search/?q=completed&min_confirmations=10
```

### Available Filters and Sorting

Get available options via:
```bash
GET /api/achievements/search/filters_and_sorting/
```

Response:
```json
{
  "sort_options": ["creation_date", "title"],
  "filter_options": ["confirmed", "min_confirmations"]
}
```

## Response Format

All search endpoints return paginated results with the following structure:

```json
{
  "count": 150,
  "next": "http://api.example.com/api/users/search/?q=john&page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "job_title": "Software Engineer",
      "bio_text": "Passionate about clean code",
      "profile_picture": "https://...",
      "creation_date": "2024-01-15T10:30:00Z",
      "active": true
    },
    ...
  ]
}
```

### User Search Result Fields

- `id`: User ID
- `name`: User's full name
- `email`: User's email address
- `job_title`: Job title (nullable)
- `bio_text`: Biography text (nullable)
- `profile_picture`: URL to profile picture (nullable)
- `creation_date`: Account creation timestamp
- `active`: Whether the user is active

### Team Search Result Fields

- `id`: Team ID
- `name`: Team name
- `creation_date`: Team creation timestamp

### Achievement Search Result Fields

- `id`: Achievement ID
- `user`: Object with `id`, `name`, and `profile_picture` (minimal user info)
- `title`: Achievement title
- `body`: Achievement description
- `creation_date`: Achievement creation timestamp
- `confirmation_count`: Number of confirmations received

## Error Handling

- **No search query**: Returns empty results (`count: 0, results: []`)
- **Invalid sort_by**: Defaults to the primary sort field
- **Invalid order**: Defaults to ascending or descending based on endpoint default
- **Invalid page_size**: Capped at 100 or defaults to 20
- **Invalid filters**: Invalid filters are silently ignored

## Access Control

Search endpoints are **publicly accessible** - they do not require authentication or authorization. All users, including unauthenticated users, can search for users, teams, and achievements.

If you want to add authentication requirements in the future, add permission classes to the `UserSearchViewSet`, `TeamSearchViewSet`, or `AchievementSearchViewSet` classes.

## Implementation Details

### Files Modified/Created

1. **common/pagination.py** - Added pagination classes
2. **apps/users/serializers.py** - Added `UserSearchSerializer`
3. **apps/users/views.py** - Added `UserSearchViewSet`
4. **apps/users/urls.py** - Registered search route
5. **apps/teams/serializers.py** - Added `TeamSerializer`
6. **apps/teams/views.py** - Added `TeamSearchViewSet`
7. **apps/teams/urls.py** - Registered search route with router
8. **apps/achievements/serializers.py** - Added `AchievementSearchSerializer`
9. **apps/achievements/views.py** - Added `AchievementSearchViewSet`
10. **apps/achievements/urls.py** - Registered search route

### Database Queries

The search endpoints use Django ORM's `Q` objects for flexible querying and support full-text search capabilities through case-insensitive lookups.

## Future Enhancements

Possible improvements for future iterations:

1. **Full-text search**: Implement PostgreSQL full-text search for better search accuracy
2. **Elasticsearch integration**: For large-scale search across all entities
3. **Search analytics**: Track popular search queries
4. **Advanced filters**: Additional filtering options per endpoint
5. **Search history**: Store user search history for personalization
6. **Faceted search**: Group results by categories
7. **Autocomplete**: Implement suggestion endpoints
8. **Search ranking**: Implement relevance scoring

