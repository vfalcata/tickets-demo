import axios from "axios";

//will handle wheter request is from browser or server side, and route appropriate base domain
const buildClient = ({req})=>{
    //window ONLY exists inside the browser, so with this we can determine if we are in the browser or server before requesting
    if (typeof window === 'undefined'){
        //we are inside the server, we need base domain to ingress-nginx
        //we can use External Name service to remap the domain, here we just type the whole thing for simplicity

        //create axios instance we can attach information to before we make a request
        return axios.create({
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers
        });
    }else{
        //we are on the browser, so we do not need a base domain, and cookie is included since it is from the browser
        return axios.create({
            baseURL: '/',
        });
    }
}

export default buildClient;