import api,{getBaseURL} from '../config/axios';

export const useRazorpayWallet = () => {
  const startWalletDeposit = async (amount, onSuccess, onError) => {
    try {
      // 1. Create order on backend
      const res = await api.post(`${getBaseURL()}/api/finance/wallet/create-order/`, { amount });
      const { order_id, amount: orderAmount, currency, razorpay_key } = res.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: razorpay_key,
        amount: orderAmount,
        currency,
        order_id,
        name: "Talintz Wallet",
        description: "Add funds to your wallet",
        handler: async function (response) {
          // 3. Verify payment on backend
          try {
            await api.post(`${getBaseURL()}/api/finance/wallet/verify-payment/`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: orderAmount / 100
            });
            onSuccess && onSuccess();
          } catch (err) {
            onError && onError("Payment verification failed.");
          }
        },
        prefill: {},
        theme: { color: "#3399cc" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      onError && onError("Failed to initiate payment.");
    }
  };

  return { startWalletDeposit };
};
