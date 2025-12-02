# MCP Server Tests

## Overview

Minimal test suite for the MCP server's async wrapper functions around Django ORM operations.

## Test Coverage

### `test_mcp_server.py` - 9 Tests

Tests the async wrapper functions that enable MCP server to interact with Django:

1. **test_get_all_tasks_returns_tasks** - Verify list_tasks returns all tasks
2. **test_get_all_tasks_filtered_by_status** - Verify status filtering works
3. **test_create_task_sync_creates_task** - Verify create_task creates tasks with all fields
4. **test_create_task_with_defaults** - Verify default values (empty description, TODO status)
5. **test_get_task_by_id_returns_task** - Verify task retrieval by ID
6. **test_save_task_updates_task** - Verify update_task modifies tasks
7. **test_delete_task_sync_removes_task** - Verify delete_task removes tasks
8. **test_task_to_dict_converts_correctly** - Verify Task model to dict serialization
9. **test_get_task_by_id_raises_for_missing_task** - Verify error handling for missing tasks

## Running Tests

### Local Development (with virtual environment)

```bash
cd backend
source venv/bin/activate
python manage.py test tests.test_mcp_server
```

### Docker Environment

```bash
# From project root
docker-compose exec backend python manage.py test tests.test_mcp_server
```

### Run All Backend Tests

```bash
# Local
python manage.py test

# Docker
docker-compose exec backend python manage.py test
```

## Test Strategy

**MINIMAL but COMPREHENSIVE approach:**
- Focus on async wrapper functions (the MCP server's core responsibility)
- Test each CRUD operation once
- Verify error handling for critical failure cases
- Use Django's TestCase for DB setup/teardown
- Use `async_to_sync` to test async functions in synchronous test context

## Key Testing Patterns

1. **setUp/tearDown**: Create test tasks in setUp, clean up in tearDown
2. **async_to_sync**: Convert async functions to sync for testing
3. **Verification**: Check both return values AND database state
4. **Error Testing**: Verify DoesNotExist raises for missing tasks

## Notes

- Tests use `async_to_sync` from `asgiref.sync` to test async functions
- Tests follow the same patterns as existing tests in `kanban/tests/`
- Test data uses 'MCP Test' prefix for easy identification
- All tests pass in both local and Docker environments
