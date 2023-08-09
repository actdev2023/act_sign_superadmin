import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { config } from "../configs/config";
import Cookies from "js-cookie";

const { API_URL } = config;

const withAuth = (WrappedComponent: React.FC) => {
    const WrapperComponent: React.FC = (props: any) => {
        
        const router = useRouter();

        useEffect(() => {
            const checkAuth = async () => {
                const token = Cookies.get("jwt_token");
                if (!token) {
                    router.push("/login");
                    return;
                }

                try {
                    const response = await fetch(`${API_URL}/api/users/check-token`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ token }),
                    });

                    if (!response.ok) {
                        Cookies.remove("jwt_token");
                        router.push("/login");
                    }
                } catch (error) {
                    console.error("Error checking token validity:", error);
                }
            };

            checkAuth();
        }, [router]);

        return <WrappedComponent {...props} />;
    };

    return WrapperComponent;
};

export default withAuth;