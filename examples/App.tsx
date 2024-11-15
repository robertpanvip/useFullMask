import {useState} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.scss'
import useFullMask from "../src";

function App() {
    const [count, setCount] = useState(0);
    const [ele, update] = useFullMask<{ id: number }>((state, props) => {
        console.log('state', state, props);
        return <div>123</div>
    })
    return (
        <>
            {ele}
            <button
                onClick={() => {
                    update({open: true, id: 789})
                }}
            >
                打开弹窗
            </button>
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo"/>
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo"/>
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}

export default App