import { config } from "../configs/config";
import Cookies from "js-cookie";

const { API_URL } = config;

export async function fetchSignature(id: string) {
    const response = await fetch(`${API_URL}/api/signature?id=${id}`);
    if(!response.ok) {
        throw new Error('Failed to fetch signature');
    }
    const data = await response.json();
    return data.signature;
}

export async function registerUser(username: string, email: string, password: string){
    const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register user');
    }

    return response.json();
}

export async function loginUser( email: string, password: string ) {
    console.info('cred', email, password);
    const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();

    console.log('token', data.token);

    Cookies.set("jwt_token", data.token, { expires: 1, secure: true });
}

