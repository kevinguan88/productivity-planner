import TodoList from "../../components/TodoList"

export default function Todo() {
    return (
        <div className="flex justify-center ">
            <div className="border-2 m-1 bg-white-300 h-full flex-1 border-neutral-400 max-w-6xl w-full">
               <TodoList />
            </div>
        </div>
    )
}