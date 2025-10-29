<!-- 1c68b674-7c77-473d-a88d-18c67035bc3e 5c3aa513-f332-4085-a6f5-67da0af8dc4c -->
# Next.js Architecture Refactor

## Critical Issues to Fix

### 1. Security & Supabase Configuration

**Current Problem**: Service role key exposed in browser via `src/lib/supabaseClient.js`

**Fix**:

- Create separate Supabase clients for server and client
- Move to `@supabase/ssr` package (already installed)
- Create `src/lib/supabase/server.js` - server-only client with service key
- Create `src/lib/supabase/client.js` - browser client with anon key
- Add `.env.local` with proper environment variables:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_key (server-only)
  ```


### 2. Service Layer Restructuring

**Current Problem**: Services run in browser with localStorage caching, making direct DB calls

**Fix**:

- Create `src/actions/` folder for Next.js Server Actions
- Move database logic from `src/services/` to server actions:
  - `src/actions/habits.js` - all habit CRUD operations
  - `src/actions/todos.js` - all todo CRUD operations
- Keep client-side services minimal (optimistic updates only)
- Remove localStorage caching (use React Server Components cache instead)

### 3. Page Component Architecture

**Current Problem**: All pages are client components, no SSR

**Fix**:

**Habit Tracker** (`src/app/habit_tracker/page.js`):

- Remove `'use client'` from page component
- Fetch initial habits data server-side
- Create child client component `habit-tracker-client.jsx` for interactivity
- Pass server-fetched data as props

**Todo Page** (`src/app/todo/page.js`):

- Remove `'use client'` (currently doesn't have it, good)
- Fetch todos server-side in page component
- Refactor `TodoList` component to accept server data as props
- Create `todo-list-client.jsx` for interactive features

**Calendar Page** (`src/app/calendar/page.js`):

- Remove `'use client'` from page component
- Fetch habits and completions server-side
- Create `calendar-client.jsx` for month navigation and interactivity

**Home Page** (`src/app/page.js`):

- Already server component (good)
- Fetch dashboard data server-side if needed

### 4. Component Organization

**Current Problem**: Mix of server and client components in same files

**Fix**:

- Server Components (default): `page.js` files fetch data
- Client Components: Interactive UI in separate files with `'use client'`
- Shared Components: Keep in `src/components/` but mark client-only ones explicitly

### 5. File Naming Consistency

**Current Problem**: Mix of `.js` and `.jsx` extensions

**Fix**:

- Use `.js` for all files (Next.js convention)
- Rename: `habit-card.jsx` → `habit-card.js`
- Rename: `add-habit-modal.jsx` → `add-habit-modal.js`
- Rename: `month-calendar.jsx` → `month-calendar.js`

### 6. Real-Time Data Updates

**Solution**: Hybrid approach for habit visualizations

**Implementation**:

- **Initial Load**: Server-side fetch (fast, SEO-friendly)
- **Client Updates**: Use server actions with React's `useTransition` and `useOptimistic`
- **Polling**: Optional background refresh for calendar view
- **Optimistic UI**: Immediate feedback before server confirmation

## Implementation Structure

### New File Structure

```
src/
├── actions/
│   ├── habits.js          (Server Actions for habits)
│   └── todos.js           (Server Actions for todos)
├── lib/
│   ├── supabase/
│   │   ├── server.js      (Server-only client)
│   │   └── client.js      (Browser client)
│   └── utils.js
├── app/
│   ├── habit_tracker/
│   │   ├── page.js        (Server Component - fetches data)
│   │   └── habit-tracker-client.js (Client Component)
│   ├── todo/
│   │   ├── page.js        (Server Component)
│   │   └── todo-list-client.js (Client Component)
│   ├── calendar/
│   │   ├── page.js        (Server Component)
│   │   └── calendar-client.js (Client Component)
│   └── ...
├── components/
│   ├── habit-card.js      (Client Component)
│   ├── todo-item.js       (Client Component)
│   └── ...
└── services/              (DEPRECATED - remove after migration)
```

### Server Actions Example Pattern

**File**: `src/actions/habits.js`

```javascript
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getHabitsWithCounts() {
  const supabase = await createServerClient()
  // ... fetch logic
  return habits
}

export async function addHabit(title, color) {
  const supabase = await createServerClient()
  // ... insert logic
  revalidatePath('/habit_tracker')
  return habit
}
```

### Server Component Pattern

**File**: `src/app/habit_tracker/page.js`

```javascript
import { getHabitsWithCounts } from '@/actions/habits'
import HabitTrackerClient from './habit-tracker-client'

export default async function HabitTrackerPage() {
  const habits = await getHabitsWithCounts()
  return <HabitTrackerClient initialHabits={habits} />
}
```

### Client Component Pattern

**File**: `src/app/habit_tracker/habit-tracker-client.js`

```javascript
'use client'

import { useState, useTransition } from 'react'
import { addHabit } from '@/actions/habits'

export default function HabitTrackerClient({ initialHabits }) {
  const [habits, setHabits] = useState(initialHabits)
  const [isPending, startTransition] = useTransition()
  
  const handleAdd = (newHabit) => {
    startTransition(async () => {
      const added = await addHabit(newHabit.title, newHabit.color)
      setHabits([...habits, added])
    })
  }
  // ... render logic
}
```

## Migration Order

1. **Setup Environment** - Create `.env.local`, new Supabase clients
2. **Create Server Actions** - Migrate habit and todo services
3. **Refactor Habit Tracker** - Split into server/client components
4. **Refactor Todo Page** - Apply same pattern
5. **Refactor Calendar Page** - Handle real-time updates
6. **Cleanup** - Remove old service files, fix imports, rename files
7. **Testing** - Verify all functionality works with new architecture

## Benefits After Refactor

- ✅ Proper SSR - faster initial page loads, better SEO
- ✅ Secure - service key never exposed to browser
- ✅ Type-safe - server actions provide better type inference
- ✅ Real-time - optimistic updates + server revalidation
- ✅ Auth-ready - structure supports adding auth later
- ✅ Modular - clear separation of server/client logic
- ✅ Cacheable - Next.js can cache server component renders

### To-dos

- [ ] Create .env.local and configure separate Supabase clients for server and browser
- [ ] Create src/actions/ folder with habits.js and todos.js server actions
- [ ] Split habit_tracker/page.js into server component and habit-tracker-client.js
- [ ] Refactor todo page to use server components with todo-list-client.js
- [ ] Refactor calendar page with server-side data fetching and calendar-client.js
- [ ] Remove old service files, rename .jsx to .js, fix all imports
- [ ] Test all pages and features to ensure functionality works with new architecture