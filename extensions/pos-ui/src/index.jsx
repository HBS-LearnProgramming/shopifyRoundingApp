import React, { useState } from 'react';
import { Tile, Text, Screen, ScrollView, Navigator, render, useExtensionApi, Button, useLocaleSubscription, useCartSubscription } from '@shopify/retail-ui-extensions-react';
import { useEffect } from 'react';
import createApp from '@shopify/app-bridge';
import { Cart } from '@shopify/app-bridge/actions'


// Define SmartGridTile component
const SmartGridTile = () => {
  // useEffect(()=>{
  //   removeRounding();
  // },[])
  const cart = useCartSubscription();
  const api = useExtensionApi();
  const locale = useLocaleSubscription();
  const removeRounding = async () => {
    
    const updatedItems = cart.lineItems.filter(item => item.title === 'Rounding');
    if(updatedItems.length>0){
      getDiscount(cart.grandTotal-updatedItems[0].price);
      await api.cart.removeLineItem(updatedItems[0].uuid);
    
    }else{
      getDiscount(cart.grandTotal);
    }
   
    
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

      applyDiscount(roundedValue);
    }
  };

  const applyDiscount = async (discount) => {
    
    try {
      if (locale.toLowerCase() === 'en-my') {
        
        Object.customSale ={
          quantity: 1,
          title: "Rounding",
          price: discount.toString(),
          taxable: false
        }
        await api.cart.addCustomSale(Object.customSale);
      } else {
        
        api.smartGrid.presentModal();
      }
    } catch (error) {
      
      setErrorGive(error.message || 'An error occurred.');
    }
  };
  
  return (
    <Tile
      title="Rounding"
      subtitle="product"
      onPress={removeRounding}
      enabled
    />
  );
};

const SmartGridModal = ({ error }) => {
  const api = useExtensionApi();
  const [grandTotal, setGrandTotal] = useState(0);
  const [discount,setDiscount] = useState(0);
  const locale = useLocaleSubscription();
  const cart = useCartSubscription();
  const [lastdigit,setLastdigit] = useState();
  const [errorGive, setErrorGive] = useState(error || 'error');
  const [item,setItems] = useState('');

  useEffect(()=>{
    removeRounding();
  },[])
  const removeRounding = async () => {
   
    const updatedItems = cart.lineItems.filter(item => item.title === 'Rounding');
    if(updatedItems.length>0){
      setItems(updatedItems.uuid);
    await api.cart.removeLineItem(updatedItems[0].uuid);
    getDiscount(cart.grandTotal-updatedItems[0].price);
    }else{
      getDiscount(cart.grandTotal);
    }
   
    
  };

  const getDiscount = (grandTotal) => {
    setGrandTotal(grandTotal);

   
    const priceToRound = parseFloat(grandTotal).toFixed(2);
    let roundedValue;
    
    if (!isNaN(priceToRound)) {
      // Round to the nearest 100 with 5 as the midpoint
      const roundedTo100 = priceToRound * 100;
      const lastDigit = Math.round(roundedTo100 % 10);
      setLastdigit(lastDigit);
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
      setDiscount(roundedValue);
    }
  };

  const applyDiscount = async () => {
    try {
      if (locale.toLowerCase() === 'en-my') {
        

        Object.customSale ={
          quantity: 1,
          title: "Rounding",
          price: discount.toString(),
          taxable: false
        }
        await api.cart.addCustomSale(Object.customSale);
        
        setDiscount(0);
      } else {
        // Show the modal in case of an unsupported locale
        api.smartGrid.presentModal();
      }
    } catch (error) {
      // Show the error message in the modal
      setErrorGive(error.message || 'An error occurred.');
    }
  };
  
  
  
  // Render the SmartGridModal component
  return (
    <Navigator>
      <Screen name="ProductList" title="Product List">
        <ScrollView>
          {/* Display the input form */}
          {locale.toLowerCase() === "en-my" ? (
            <>
              <Text>{`Current Grand Total: ${parseFloat(grandTotal).toFixed(2)}`}</Text>
              <Text>offer discount:{discount.toString()}</Text>
              <Text>lastDigit:{lastdigit}</Text>
              <Text>lineItems: {JSON.stringify(item)}</Text>
              {/* Add your Button here */}
              <Button
                title="Get Discount"
                type="primary"
                onPress={applyDiscount}
              />
            </>
          ) : (
            <Text>Aplologic, this rounding function is only available for Malaysian</Text>
          )}
      
        </ScrollView>
      </Screen>
    </Navigator>
  );
};

// Render the SmartGridTile and SmartGridModal components
render('pos.home.tile.render', () => <SmartGridTile />);
render('pos.home.modal.render', () => <SmartGridModal />);

