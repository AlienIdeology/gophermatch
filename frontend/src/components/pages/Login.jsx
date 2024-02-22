import { Link, useNavigate } from 'react-router-dom';
import React from 'react';
import backend from "../../backend.js";
import currentUser from "../../currentUser.js";

export default function Login() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loginErr, setLoginErr] = React.useState('');
    const [emailError, setEmailError] = React.useState('');
    const [passwordError, setPasswordError] = React.useState('');

    // Get the page path that redirected to this page
    const params = new URLSearchParams(location.search);
    const from = params.get("from") || "/";
    const navigate = useNavigate();  // used to navigate away to another page

    async function enterKeyPress(event) {
        if (event.key !== `Enter` && event.keyCode  !== 13) return;
        if (email && password) onLoginAttempt();
    }

    async function onLoginAttempt() {
        if (!email) {
            setEmailError("Email missing");
            return;
        } else if (!email.endsWith("@umn.edu")) {
            setEmailError("Email must be an umn email");
            return;
        }

        if (!password) {
            setPasswordError("Password missing");
            return;
        }

        try {
            const res = await backend.put("/login", {
                email,
                password
            });
            // data is the request body, put it INSIDE the config object in the second argument
            // For Get requests:
            // use routing parameters at the end of url (i.e. ?key1=val1&key2=val2) for get requests
            // put the routing parameters as an object inside the second argument, the config obj goes in the third argument
            // dont send data on get requests (it won't be sent)
            const user_id = res.data.user_id;
            await currentUser.login(user_id, email) ;  // no need to store password
            navigate(from);      // redirect to where we redirected from
        } catch(err) {
            console.error(err);

            if (err.serverResponds) {
                setLoginErr(err.response.data.error_message);
            } else if (err.requestSent) {
                setLoginErr("Server timed out...");
            } else {
                setLoginErr("Error occurred");
            }
        }
    }

    return (
        <div>
        <div className="bg-maroon h-[3.75rem] space-x-4 mt-auto">
            <div className="flex justify-start items-start w-full">
                <p className="text-doc font-lora text-3xl ml-2 mt-2">GopherMatch</p>
            </div>
        </div>
        <div className="bg-doc w-screen h-screen flex flex-col font-lora">
            <div className="flex flex-col justify-center items-center w-screen text-maroon">
                <h1 className="text-maroon font-lora mt-20">Login</h1>
                <div className="flex flex-col items-center justify-center mt-10 relative">
                    <input 
                        type="text" 
                        value={email} 
                        onChange={(event) => setEmail(event.target.value)} 
                        placeholder="Email"
                        className="pl-2 w-[12.75rem]" 
                        autoFocus 
                        onKeyUp={enterKeyPress}
                    />
                </div>
                <div className="flex items-center justify-center mt-5">
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(event) => setPassword(event.target.value)} 
                        placeholder="Password"
                        className="pl-2 w-[12.75rem]"
                        onKeyUp={enterKeyPress}
                    />
                </div>
                {(passwordError || emailError) && (
                        <p className="text-red-400">
                            {passwordError && `${passwordError} `}
                            {emailError && `${emailError}`}
                        </p>
                    )}
                <div className="flex items-center justify-center mt-5">
                    <button onClick={onLoginAttempt} className="bg-maroon hover:bg-yellow-700 text-doc font-bold py-2 px-20 rounded mt-4">Login</button>
                </div>
                <div>{loginErr}</div>
                <div className='flex items-center justify-center mt-10'>
                    <p className="text-maroon text-lg">Don't have an account?</p>
                    <Link to="/signup" className = "ml-3 hover:text-yellow-500 text-lg">Sign up</Link>
                </div>
            </div>
        </div>
        <div className="bg-maroon h-[3.75rem] justify-end space-x-4 mt-auto fixed bottom-0 left-0 w-full"></div>
    </div>
    
    
    );
}
