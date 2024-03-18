//COPY PASTED FORM SIGNIN, this course is not about react so this is fine
import {useState} from "react"; //useState hooks from react to keep track of state of user inputs
import useRequest from "../../hooks/use-request";
import Router from 'next/router';

const Signin= () => {
    const [email, setEmail] = useState(''); //empty initial state
    const [password, setPassword] = useState('');
    const { doRequest, errors } = useRequest({
        url: '/api/users/signin',
        method: 'post',
        body:{
            email, password
        },
        onSuccess: ()=> Router.push('/') //callback invoked everytime we make request successfully
    })
    const onSubmit = async (event) => {
        event.preventDefault();
        await doRequest();
    }

    return (
        <form onSubmit={onSubmit}>
        <h1>Sign In</h1>
            <div className="form-group">
                <label>Email Address</label>
                <input className="form-control" value={email} onChange={e => setEmail(e.target.value)}/>
            </div>
            <div className="form-group">
                <label>Password</label>
                <input type="password" className="form-control" value={password} onChange={e =>setPassword(e.target.value)}/>
            </div>
            {errors}
            <button className="btn btn-primary">Sign In</button>
        </form>
    );
}

export default Signin;