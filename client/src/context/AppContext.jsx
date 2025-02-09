import { createContext, useEffect, useState } from "react";
import PropTypes from 'prop-types'; // Optional: for prop type validation
import axios from "axios";
import { toast } from "react-toastify";



// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

export const AppContextProvider = (props) => {
     axios.defaults.withCredentials= true;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedin, setIsLoggedin] = useState(true);
    const [userData, setUserData] = useState(false); // Consider using null or an empty object
    

    const getUserData= async()=>{
        
            try{
                const {data}= await axios.get(backendUrl+"/api/user/data")
                data.success ? setUserData(data.userData) : toast.error(data.message)

            }
            catch(error){
                toast.error(error.message)
            }
        
        
    }
    const getAuthstate= async()=>{
        try{
            const {data}= await axios.get(backendUrl+"/api/auth/is-auth")
         if(data.success){
            setIsLoggedin(true)
            getUserData()
         }
        }
        catch(error){
            toast.error(error.message

            )
        }
    }
    useEffect(()=>{
        getAuthstate();
    },[])
    const value = {
        backendUrl, 
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,
        getUserData,
        getAuthstate
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

// Optional: PropTypes validation
AppContextProvider.propTypes = {
    children: PropTypes.node.isRequired
}