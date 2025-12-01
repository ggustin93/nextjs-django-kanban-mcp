# Testing Documentation

## Overview

This document describes the test suite for the Next.js + Django Kanban board application. Tests focus on **critical paths** and **recent bug fixes** (enum validation issues).

## Test Coverage

### Backend Tests (Django/Python)

**Location**: `/backend/kanban/tests/`

**Test Files**:
- `test_models.py` - Task model validation tests
- `test_schema.py` - GraphQL API integration tests

**Critical Areas**:
1. **Status Enum Validation** (addresses recent bug with invalid status values)
2. Task CRUD operations
3. GraphQL mutations and queries
4. Field validation

**Running Tests**:
```bash
cd backend
python3 manage.py test kanban.tests --verbosity=2
```

**Test Results** (20 tests):
```
✅ test_create_task_with_default_status
✅ test_create_task_with_invalid_status_fails (CRITICAL - addresses bug)
✅ test_create_task_with_status_strings
✅ test_create_task_with_valid_statuses
✅ test_status_choices_enum_values
✅ test_task_string_representation
✅ test_task_timestamps_auto_populate
✅ test_task_title_required
✅ test_task_with_description
✅ test_update_task_status
✅ test_all_tasks_query
✅ test_create_task_mutation_with_default_status
✅ test_create_task_mutation_with_invalid_status (CRITICAL - addresses bug)
✅ test_create_task_mutation_with_valid_statuses
✅ test_delete_task_mutation
✅ test_query_returns_correct_status_distribution
✅ test_task_fields_returned_correctly
✅ test_update_task_mutation
✅ test_update_task_partial_fields
✅ test_update_task_status_only (drag-and-drop scenario)
```

### Frontend Tests (React/TypeScript)

**Location**: `/frontend/src/__tests__/`

**Test Files**:
- `Board.test.tsx` - Board component integration tests

**Critical Areas**:
1. Component rendering and loading states
2. GraphQL query/mutation integration
3. Drag-and-drop logic
4. Dialog management
5. Status enum validation

**Running Tests**:
```bash
cd frontend
npm test                 # Run once
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

**Test Results** (12 tests):
```
✅ renders loading state initially
✅ renders all tasks in correct columns after loading
✅ renders error state when query fails
✅ opens create dialog when Add Task button is clicked
✅ creates new task with valid status enum
✅ updates task status via drag-and-drop
✅ updates task with all fields
✅ deletes task after confirmation
✅ validates task title is required
✅ displays correct task counts per column
✅ handles GraphQL mutation errors gracefully
✅ validates status enum values are correct (CRITICAL - addresses bug)
```

## Test Philosophy

**Pragmatic Quality Engineering**:
- Focus on **critical paths** and **high-risk areas**
- Test **recent bugs** to prevent regression
- Avoid 100% coverage for the sake of coverage
- Write tests that **provide value**

**What We Test**:
- ✅ Business logic and validation
- ✅ API integration and mutations
- ✅ Critical user workflows
- ✅ Recent bug fixes (enum validation)

**What We Don't Test** (low value):
- ❌ Simple getters/setters
- ❌ Third-party library code
- ❌ Generated migration files
- ❌ Static configuration files

## Recent Bug Context

**Issue**: Database contained invalid status values (task IDs instead of enum values like "TODO", "DOING", "DONE")

**Root Cause**: No validation at model or GraphQL layer prevented invalid status values from being stored

**Tests Added**:
1. `test_create_task_with_invalid_status_fails` (backend)
2. `test_create_task_mutation_with_invalid_status` (backend)
3. `validates status enum values are correct` (frontend)

**Prevention**: These tests now fail if invalid status values are accepted

## Test Setup

### Backend Setup

**Requirements**:
- Django 4.2.26
- Graphene Django 3.1.0+
- Python 3.8+

**Already Configured** - no additional setup needed. Tests use Django's built-in test infrastructure with in-memory SQLite database.

### Frontend Setup

**Requirements**:
- Next.js 15
- Jest 30+
- Testing Library (React, Jest-DOM, User-Event)

**Already Configured**:
- `jest.config.js` - Jest configuration for Next.js 15
- `jest.setup.js` - Global test setup and mocks
- `package.json` - Test scripts

**Test Scripts**:
```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

## Writing New Tests

### Backend (Django)

**Example - Model Test**:
```python
from django.test import TestCase
from kanban.models import Task

class TaskModelTests(TestCase):
    def test_feature_name(self):
        """Test description."""
        task = Task.objects.create(title="Test", status=Task.Status.TODO)
        self.assertEqual(task.status, Task.Status.TODO)
```

**Example - GraphQL Test**:
```python
from django.test import TestCase
from graphene.test import Client
from kanban.schema.queries import Query
from kanban.schema.mutations import Mutation
import graphene

class GraphQLTests(TestCase):
    def setUp(self):
        schema = graphene.Schema(query=Query, mutation=Mutation)
        self.client = Client(schema)

    def test_query(self):
        result = self.client.execute('query { allTasks { id } }')
        self.assertIsNone(result.get('errors'))
```

### Frontend (React)

**Example - Component Test**:
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockedProvider } from '@apollo/client/testing'

it('test description', async () => {
  const mocks = [
    {
      request: { query: GET_TASKS },
      result: {
        data: {
          allTasks: [
            { id: '1', title: 'Task', status: 'TODO', __typename: 'TaskType' }
          ]
        }
      },
    },
  ]

  render(
    <MockedProvider mocks={mocks}>
      <YourComponent />
    </MockedProvider>
  )

  await waitFor(() => {
    expect(screen.getByText('Task')).toBeInTheDocument()
  })
})
```

**Important**: Apollo Client v3.14+ requires `__typename` in all mocks.

## Continuous Integration

**Recommendation**: Add CI pipeline to run tests automatically:

```yaml
# .github/workflows/tests.yml
name: Tests

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: 3.11
      - run: pip install -r backend/requirements.txt
      - run: cd backend && python manage.py test kanban.tests

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 20
      - run: cd frontend && npm install
      - run: cd frontend && npm test
```

## Test Maintenance

**When to Update Tests**:
1. ✅ When fixing bugs (add regression test first)
2. ✅ When adding new features (test critical paths)
3. ✅ When tests fail unexpectedly (fix or update)
4. ❌ Don't update tests to match broken code

**Test Smells to Avoid**:
- ❌ Flaky tests (pass/fail randomly)
- ❌ Slow tests (>1s per test)
- ❌ Tests that test implementation details
- ❌ Tests with unclear purpose

## Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'kanban.tests'`
**Solution**: Ensure `__init__.py` exists in `backend/kanban/tests/`

**Problem**: Database errors during tests
**Solution**: Tests use in-memory database, check model migrations are applied

### Frontend Issues

**Problem**: `Cannot find module '@/components/Board'`
**Solution**: Check `jest.config.js` has correct `moduleNameMapper`

**Problem**: Apollo Client warnings about `addTypename`
**Solution**: Remove `addTypename={false}` prop, add `__typename` to mocks

**Problem**: Test timeout
**Solution**: Increase timeout in `jest.config.js` or use `waitFor` properly

## Additional Resources

- [Django Testing Documentation](https://docs.djangoproject.com/en/4.2/topics/testing/)
- [Graphene Django Testing](https://docs.graphene-python.org/en/latest/testing/)
- [Testing Library Best Practices](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Apollo Client Testing](https://www.apollographql.com/docs/react/development-testing/testing/)

## Summary

✅ **20 backend tests** covering models and GraphQL API
✅ **12 frontend tests** covering components and integration
✅ **Critical bug coverage** for enum validation issues
✅ **Fast execution** (<3 seconds total)
✅ **Easy to run** with simple commands
✅ **Pragmatic approach** focusing on value over coverage percentage
