# User Authentication Refactoring Plan

## Overview
This document outlines the comprehensive refactoring needed to add Supabase user authentication to the productivity planner app, enabling multi-user support with proper data isolation.

## Current State Analysis

### ✅ What's Already Good
- Using `@supabase/ssr` package
- Separate client/server Supabase clients
- Server Actions architecture in place
- Next.js 15 with App Router

### ❌ Critical Issues
1. **Server client uses SERVICE_ROLE_KEY** - bypasses RLS, no user context
2. **No user_id columns** - all tables lack user ownership
3. **No Row Level Security (RLS)** - data accessible to all users
4. **No authentication UI** - no login/signup/logout pages
5. **No middleware** - no session refresh mechanism
6. **All queries are global** - fetch all users' data
7. **No user context** - can't determine current user

## Refactoring Tasks

### Phase 1: Database Schema Updates

#### 1.1 Add `user_id` columns to all tables
```sql
-- Migration: Add user_id to habits table
ALTER TABLE habits 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Migration: Add user_id to tasks table  
ALTER TABLE tasks 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Migration: Add user_id to habit_completion table
ALTER TABLE habit_completion 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
```

#### 1.2 Create database migrations
- Create `supabase/migrations/` folder
- Write migration files for schema changes
- Handle existing data (assign to a default user or delete)

#### 1.3 Add indexes for performance
```sql
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_habit_completion_user_id ON habit_completion(user_id);
```

### Phase 2: Row Level Security (RLS) Policies

#### 2.1 Enable RLS on all tables
```sql
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completion ENABLE ROW LEVEL SECURITY;
```

#### 2.2 Create RLS policies
```sql
-- Habits: Users can only see their own habits
CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for tasks and habit_completion tables
```

### Phase 3: Supabase Client Refactoring

#### 3.1 Fix server client to use user session
**File: `src/lib/supabase/server.js`**
- Change from SERVICE_ROLE_KEY to ANON_KEY
- Use cookies to get user session
- This allows RLS policies to work correctly

```javascript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, // Changed from SERVICE_ROLE_KEY
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore in Server Components
          }
        },
      },
    }
  )
}
```

#### 3.2 Create helper to get current user
**File: `src/lib/supabase/auth.js`**
```javascript
import { createClient } from './server'

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}
```

### Phase 4: Update All Server Actions

#### 4.1 Update todos.js actions
**Every query needs:**
- Filter by `user_id` in WHERE clauses
- Include `user_id` in INSERT statements
- Get current user at start of each function

**Example: `getTodos()`**
```javascript
export async function getTodos() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return []
    }
    
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id) // Add user filter
      .is('completed_at', null)
      .order('created_at', { ascending: false })
    
    // ... rest of function
  }
}
```

**Example: `addTodo()`**
```javascript
export async function addTodo(title, habitId = null, description = null) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return null
    }
    
    const todoData = { 
      title, 
      habit_id: habitId,
      user_id: user.id // Add user_id
    }
    
    // ... rest of function
  }
}
```

#### 4.2 Update habits.js actions
- Same pattern: get user, filter by user_id, include user_id in inserts
- Update: `getHabits()`, `getHabitsWithCounts()`, `addHabit()`, `updateHabit()`, `deleteHabit()`
- Update: `addHabitCompletion()`, `removeHabitCompletion()`

#### 4.3 Files to modify:
- `src/actions/todos.js` - All functions
- `src/actions/habits.js` - All functions

### Phase 5: Authentication UI

#### 5.1 Create auth pages
**File: `src/app/auth/login/page.js`**
- Login form with email/password
- Link to signup page
- Error handling

**File: `src/app/auth/signup/page.js`**
- Signup form
- Link to login page
- Email verification handling

**File: `src/app/auth/logout/route.js`**
- Server action to sign out user
- Redirect to login

#### 5.2 Create auth components
**File: `src/components/auth/login-form.jsx`**
- Email/password inputs
- Submit handler
- Loading states

**File: `src/components/auth/signup-form.jsx`**
- Signup form with validation
- Password confirmation

#### 5.3 Create auth actions
**File: `src/actions/auth.js`**
```javascript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(email, password) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  
  if (error) {
    return { error: error.message }
  }
  
  redirect('/')
}

export async function signUp(email, password) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })
  
  if (error) {
    return { error: error.message }
  }
  
  // Redirect to email verification page or login
  redirect('/auth/verify-email')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
```

### Phase 6: Middleware for Session Management

#### 6.1 Create middleware
**File: `src/middleware.js`**
```javascript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Phase 7: Protected Routes & Layout Updates

#### 7.1 Update root layout
**File: `src/app/layout.js`**
- Add auth check
- Redirect unauthenticated users to login
- Show user info in header

#### 7.2 Create protected route wrapper
**File: `src/components/auth/protected-route.jsx`**
- Check authentication
- Redirect to login if not authenticated
- Show loading state

#### 7.3 Update header component
**File: `src/components/header.js`**
- Add user menu
- Add logout button
- Show user email/name

### Phase 8: Page Component Updates

#### 8.1 Update all page components
- Add auth checks
- Handle unauthenticated state
- Pass user context to client components

**Example: `src/app/todo/page.js`**
```javascript
import { getCurrentUser } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import { getTodos } from '@/actions/todos'
import TodoClient from './todo-client'

export default async function Todo() {
  const { user } = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  const initialTodos = await getTodos()
  
  return (
    <div className="flex justify-center">
      <div className="border-2 m-1 bg-white-300 h-full flex-1 border-neutral-400 max-w-6xl w-full">
        <TodoClient initialTodos={initialTodos} />
      </div>
    </div>
  )
}
```

### Phase 9: Data Migration Strategy

#### 9.1 Handle existing data
**Option A: Assign to default user**
- Create a migration script
- Assign all existing data to a specific user_id
- Users can share this account or migrate later

**Option B: Delete existing data**
- Clean slate for new users
- Add migration script to clear tables

**Option C: Export/Import**
- Export existing data
- Allow users to import after signup

### Phase 10: Testing & Validation

#### 10.1 Test checklist
- [ ] User can sign up
- [ ] User can log in
- [ ] User can log out
- [ ] User only sees their own data
- [ ] User cannot access other users' data
- [ ] Session persists across page refreshes
- [ ] Session expires correctly
- [ ] RLS policies work correctly
- [ ] All CRUD operations work with user context
- [ ] Protected routes redirect correctly

## Implementation Order

### Week 1: Foundation
1. Database schema updates (Phase 1)
2. RLS policies (Phase 2)
3. Fix Supabase client (Phase 3)

### Week 2: Backend
4. Update all server actions (Phase 4)
5. Create auth actions (Phase 5.3)
6. Create middleware (Phase 6)

### Week 3: Frontend
7. Create auth UI (Phase 5.1-5.2)
8. Update layouts and routes (Phase 7)
9. Update page components (Phase 8)

### Week 4: Polish
10. Data migration (Phase 9)
11. Testing (Phase 10)
12. Bug fixes and refinements

## Breaking Changes

### For Users
- **Existing data**: Will need to be migrated or lost
- **No anonymous access**: Must create account to use app
- **Session required**: Must be logged in to access any feature

### For Developers
- **All queries changed**: Must include user_id filtering
- **All inserts changed**: Must include user_id
- **Server client changed**: Now uses anon key, not service role
- **New dependencies**: None (already have @supabase/ssr)

## Estimated Effort

- **Database changes**: 4-6 hours
- **RLS policies**: 2-3 hours  
- **Server actions refactor**: 8-12 hours
- **Auth UI**: 6-8 hours
- **Middleware & routing**: 3-4 hours
- **Testing & fixes**: 8-10 hours

**Total**: ~35-45 hours of development work

## Risk Mitigation

1. **Data loss**: Backup database before migrations
2. **Breaking changes**: Use feature flags for gradual rollout
3. **RLS issues**: Test thoroughly in development first
4. **Session management**: Use Supabase's built-in session handling
5. **Migration complexity**: Consider starting fresh for new users

## Next Steps

1. Review and approve this plan
2. Set up development branch
3. Create database backup
4. Begin Phase 1 implementation

