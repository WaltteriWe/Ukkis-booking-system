import { useState } from "react";

export function useError() {
    const [error, setError] = useState<string>("");

    const clearError = () => {
        setError("");
    };


    const showError = (message: string) => {
        setError(message);

        setTimeout(() => {
            clearError();
        }, 5000);
    }

    return { error, setError, clearError, showError };
    }