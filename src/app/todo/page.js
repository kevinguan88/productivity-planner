import { getTodos } from '@/actions/todos'
import TodoClient from './todo-client'

export default async function Todo() {
    const initialTodos = await getTodos()
    
    return (
        <div className="flex-1 bg-white p-4 flex flex-col items-center space-y-4">
            <div className="w-[60%] bg-white rounded-lg shadow-lg p-6 flex flex-col space-y-4 min-w-[400px]">
                <h1 className="text-2xl font-bold text-gray-800">To-Do List</h1>
                <TodoClient initialTodos={initialTodos} />
            </div>
        </div>
    )
}