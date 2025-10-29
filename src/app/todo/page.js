import { getTodos } from '@/actions/todos'
import TodoList from "../../components/TodoList"

export default async function Todo() {
    const initialTodos = await getTodos()
    
    return (
        <div className="flex justify-center ">
            <div className="border-2 m-1 bg-white-300 h-full flex-1 border-neutral-400 max-w-6xl w-full">
               <TodoList initialTodos={initialTodos} />
            </div>
        </div>
    )
}