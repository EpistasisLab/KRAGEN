import { createContext } from 'react';

export const chatLogContext = createContext();

export function chatLogProvider({children}){
    
    <chatLogContext.Provider>
        {children}
    </chatLogContext.Provider>
    

}