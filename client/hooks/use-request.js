import axios from "axios";
import {useState} from "react";

const useRequest = ({url, method, body, onSuccess})=>{
    const [errors, setErrors] = useState(null);

    const doRequest = async (props={})=>{
        //can receive additional properties, to merge in with body for the request
        //this will initially throw an error becuase ticketId uses doRequest as an event handler
        //when it is used this way the first argument provided is the event, so we are trying to merge
        //the event object with the body, which is why it throws an error
        try {
            setErrors(null); //cleans previous error on render
            const  response = await axios[method](url, {...body, ...props})
            //we dont know the request method

            if(onSuccess){ //was on Success call back provided, if it was call it with the response data
                onSuccess(response.data);
            }

            return response.data;
        }catch (err) {
            console.log(err)
            setErrors(
                <div className="alert alert-danger">
                    <h4>Ooops....</h4>
                    <ul className="my-0">
                        {err.response.data.errors.map(err => (
                            <li key={err.message}>{err.message}</li>
                        ))}
                    </ul>
                </div>
            );
        }
    };

    return {doRequest, errors}
}

export default useRequest;