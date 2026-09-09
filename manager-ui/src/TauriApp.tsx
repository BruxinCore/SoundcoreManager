import React, { useEffect } from 'react';
import './App.css';
import { useTauriManagerStore } from '@stores/tauri/useTauriManagerStore';
import { BluetoothSearchLayout } from './layouts/bluetoothSearch';
import { useAsyncBridgeEvent, useAsyncBridgeRequest } from '@hooks/useAsyncBridge';
import { useShallow } from 'zustand/react/shallow';
import { DeviceStateLayout } from './layouts/deviceState';

export const TauriApp: React.FC = () => {
  const [isFirstRender, setFirstRender] = React.useState(true);
  const [handleAsyncBridgeEvent, connectedAddresses] = useTauriManagerStore(
    useShallow((state) => [state.handleAsyncBridgeEvent, state.connectedAddresses])
  );

  const currentState = useTauriManagerStore((state) => state.currentViewedDeviceState());

  // Add the event listener to the bridge, which listener is
  // provided by the store.
  useAsyncBridgeEvent((event) => {
    handleAsyncBridgeEvent(event);
  });

  // Disconnect all devices on hard refresh
  useEffect(() => {
    if (isFirstRender) {
      useAsyncBridgeRequest({ command: 'disconnectAll' });
    }
    setFirstRender(false);
  }, []);

  return (
    <div className="flex flex-col w-full h-full bg-black text-white">
      <div className="flex justify-between items-center p-6 pb-2">
        <h1 className="text-2xl font-bold">Os meus dispositivos</h1>
        <div className="flex gap-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {connectedAddresses.size !== 0 && currentState ? (
          <DeviceStateLayout state={currentState} />
        ) : (
          <BluetoothSearchLayout />
        )}
      </div>
    </div>
  );
};

export default TauriApp;
