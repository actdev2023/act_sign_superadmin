import { useEffect } from "react";
import { useRouter } from "next/router";
import { config } from "../../configs/config";
import Cookies from "js-cookie";
import { loginUser } from "src/lib/api";

const { API_URL } = config;


const LogoutPage: React.FC = () => {

    const router = useRouter();

    useEffect(() => {
        const logoutUser = async () => {
            try {
                await fetch(`${API_URL}/api/users/logout`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                Cookies.remove("jwt_token");
                router.push("/login");
            } catch (error) {
                console.error("Error during logout:", error);
            }
        };

        logoutUser();
    }, [router]);

    return <div>Logging out...</div>;
}

export default LogoutPage;