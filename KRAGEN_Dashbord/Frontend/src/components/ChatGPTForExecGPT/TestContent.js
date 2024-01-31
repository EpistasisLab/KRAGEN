import React,{useContext} from 'react';

import { ThemeContext } from './context/ThemeContext';

const TestContent = () => {

    const {isDark, setIsDark, currentModel,setCurrentModel} = useContext(ThemeContext);
    console.log("TestContent-isDark: ",isDark);

    return (
        <div>
            <h1>Test Content</h1>
        </div>
    )
}


export default TestContent;