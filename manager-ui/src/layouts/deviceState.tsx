import React from 'react';
import { DeviceStateCard } from '@components/DeviceStateCard/deviceStateCard';
import { SoundcoreDeviceState } from '@generated-types/soundcore-lib';
import { EqualizerCard } from '@components/EqualizerCard/equalizerCard';
import { SoundModeTabs } from '@components/DeviceStateCard/soundModeTabs';

export const DeviceStateLayout: React.FC<{ state: SoundcoreDeviceState }> = ({ state }) => {
  return (
    <>
      <DeviceStateCard state={state} />
      <SoundModeTabs state={state} />
      <EqualizerCard state={state} />
    </>
  );
};
