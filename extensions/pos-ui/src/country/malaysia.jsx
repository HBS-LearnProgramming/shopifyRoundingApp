import { useCartSubscription,useExtensionApi} from '@shopify/retail-ui-extensions-react';
export const removeRoundingItem = async (api) => {
    const cart = useCartSubscription();
    const updatedItems = cart.lineItems.filter(item => item.title === 'Rounding');
    const api = useExtensionApi();
    if (updatedItems.length > 0) {
      await api.cart.removeLineItem(updatedItems[0].uuid);
      getDiscount(cart.grandTotal - updatedItems[0].price);
    }
  
    getDiscount(cart.grandTotal);
  };

  const getDiscount = (grandTotal) => {

    const priceToRound = parseFloat(grandTotal).toFixed(2);
    let roundedValue;
    
    if (!isNaN(priceToRound)) {
      // Round to the nearest 100 with 5 as the midpoint
      const roundedTo100 = priceToRound * 100;
      const lastDigit = Math.round(roundedTo100 % 10);
      
      if (lastDigit == 0 || lastDigit == 5) {
        roundedValue = 0;
      } else if (lastDigit > 0 && lastDigit < 3) {
        // If the last digit is greater than 5, round up to the next hundred
        roundedValue = lastDigit % 2 === 0 ? 2 / -100 : 1 / -100;
      } else if (lastDigit > 2 && lastDigit < 5) {
        roundedValue = lastDigit % 2 === 0 ? 1 / 100 : 2 / 100;
      } else if (lastDigit > 5 && lastDigit < 8) {
        roundedValue = lastDigit % 2 === 0 ? 1 / -100 : 2 / -100;
      } else if (lastDigit > 7 && lastDigit < 10) {
        roundedValue = lastDigit % 2 === 0 ? 2 / 100 : 1 / 100;
      } else {
        roundedValue = 0;
      }

      // Update the state with the rounded price
      applyDiscount(roundedValue);
    }
  };
  const applyDiscount = async (discount) => {
    const api = useExtensionApi();
    try {
        Object.customSale ={
          quantity: 1,
          title: "Rounding",
          price: discount.toString(),
          taxable: false
        }
        await api.cart.addCustomSale(Object.customSale);
        
    } catch (error) {
      // Show the error message in the modal
      setErrorGive(error.message || 'An error occurred.');
    }
  };

