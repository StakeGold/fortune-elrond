import React from 'react';
import { Create, View } from './components';

export const Escrow = () => {
  return (
    <div className='escrow-container'>
      <div className='escrow-container-item right-border'>
        <Create />
      </div>
      <div className='escrow-container-item'>
        <View />
      </div>
    </div>
  );
};
