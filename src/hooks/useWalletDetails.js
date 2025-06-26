import { useState, useEffect } from 'react';
import api from '../config/axios';

export const useWalletDetails = () => {
    const [walletData, setWalletData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWalletDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/finance/wallet/details/');
            console.log(response.data)
            setWalletData(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch wallet details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletDetails();
    }, []);

    return {
        walletData,
        loading,
        error,
        refreshWallet: fetchWalletDetails
    };
};
