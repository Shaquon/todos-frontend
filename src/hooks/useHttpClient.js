import { useCallback, useState, useRef, useEffect } from 'react';

export const useHttpClient = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();

    const activeHttpRequests = useRef([]);

    const sendRequest = useCallback(
        async (url, httpAbortCtrl, method = "GET", body = null, headers = {}) => {
            setIsLoading(true);
            activeHttpRequests.current.push(httpAbortCtrl);
            try {
                const response = await fetch(url, {
                    method,
                    body,
                    headers,
                    signal: httpAbortCtrl.signal
                });

                const responseData = await response.json();

                activeHttpRequests.current = activeHttpRequests.current.filter(reqCtrl => reqCtrl !== httpAbortCtrl)

                if (!response.ok) {
                    throw new Error(responseData.message);
                }

                setIsLoading(false);
                return responseData;
            } catch (err) {
                if (!httpAbortCtrl.signal.aborted) {
                    setError(err.message)
                    setIsLoading(false)
                    throw err
                }
                setError(err.message || 'Something went wrong, please try again.')
                setIsLoading(false);
                throw err;
            }

        }, []);

    const clearError = () => {
        setError(null);
    };

    useEffect(() => {
        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            console.log('aborting!!!')
            activeHttpRequests.current.forEach(abortCtrl => abortCtrl.abort());

        }
    }, []);

    return {
        isLoading,
        error,
        sendRequest,
        clearError
    };
}