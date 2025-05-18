import Graph from '../components/graph'

export default function Home() {
    return (
        <div className="bg-green-100 w-full h-full flex-1">
            <h1 className="text-green-500">Hello, user!</h1>

            <div className="flex bg-red-100">
                <div className="w-1/2 flex justify-center"><Graph/></div>
                <div className= "w-1/2 flex flex-col h-full justify-between ">
                    <div className="flex-[3] bg-green-500 text-white">Milestone</div>
                    <div className="flex-[1] bg-red-400 text-white">Start planning!</div>
                </div>
            </div>
        </div>
    )
} 