import { BluetoothAdrr, EQProfile, SoundcoreDeviceState } from '@generated-types/soundcore-lib';
import React, { useRef, useState } from 'react';
import { useUpdateCustomEqualizer, useUpdatePresetEqualizer } from '@hooks/useDeviceCommand';
import { useTauriManagerStore } from '@stores/tauri/useTauriManagerStore';
import { BLEDevice } from '../../ble/bleDevice';
import { useWebManagerStore } from '@stores/web/useWebManagerStore';
import { Button, Card, CardBody, CardFooter, Select, SelectItem, Switch } from '@nextui-org/react';
import { Equalizer, EqualizerRef } from '@components/EqualizerCard/equalizer';
import { getPresetEqValue } from '@wasm/manager_wasm';

export interface EqualizerCardProps {
  state: SoundcoreDeviceState;
}

export const EqualizerCard: React.FC<EqualizerCardProps> = ({ state }) => {
  const deviceAddrOrDevice: BluetoothAdrr | BLEDevice | null = window.isTauri
    ? useTauriManagerStore((state) => state.currentViewedDevice)
    : useWebManagerStore((state) => state.device);

  if (!deviceAddrOrDevice) {
    return <></>;
  }

  const isOnCustom = state.eqConfiguration.value.profile === EQProfile.Custom;
  const hasBassUp = state.featureSet.equalizerFeatures?.has_bass_up ?? false;

  const [presetEqValues, setPresetEqValues] = useState<number[]>([]);
  const eqRef = useRef<EqualizerRef>(null);

  const onCustomEqualizerChange = (output: number[]) => {
    if (isOnCustom) {
      const new_eq = output.map((v) => v * 10);
      useUpdateCustomEqualizer(deviceAddrOrDevice, new_eq);
    }
  };

  const eqProfileChange = (profile: EQProfile) => {
    setPresetEqValues(
      mapRangeArray(Array.from(getPresetEqValue(profile.toString(), 8)), 0, 240, -6, 6).map(
        (v) => v * 2
      )
    );
    useUpdatePresetEqualizer(deviceAddrOrDevice, profile);
  };

  const mapRange = (
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ): number => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  };

  const mapRangeArray = (
    input: number[],
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ): number[] => {
    return input.map((value) => mapRange(value, inMin, inMax, outMin, outMax));
  };

  const getMappedCustomEqValues = (): number[] => {
    let valueArr;
    if (state.eqConfiguration.value.eq && 'left' in state.eqConfiguration.value.eq) {
      valueArr = state.eqConfiguration.value.eq.left.values;
    } else {
      valueArr = state.eqConfiguration.value.eq.values;
    }
    return mapRangeArray(valueArr, 0, 240, -6, 6).map((v) => v * 2);
  };

  const eqProfiles = Object.keys(EQProfile).filter((item) => {
    return isNaN(Number(item)) && item !== 'Custom' && (!hasBassUp || item !== 'BassBooster');
  });

  const onCardPress = (v: string) => {
    const newProfile = v == 'Custom' ? EQProfile.Custom : EQProfile.SoundcoreSignature;
    if (!isOnCustom && newProfile !== 'Custom') {
      return;
    }
    useUpdatePresetEqualizer(deviceAddrOrDevice, newProfile);
  };

  const onBassUpChange = (v: boolean) => {
    useUpdatePresetEqualizer(
      deviceAddrOrDevice,
      v ? EQProfile.BassBooster : EQProfile.SoundcoreSignature
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-2 p-4">
      <h3 className="text-white font-semibold text-lg mb-2">Efeitos sonoros</h3>
      {state.featureSet.equalizerFeatures && (
        <div className="flex flex-col gap-3">
          <EQModeCard
            title={'Predefinição'}
            subTitle={'Assinatura soundcore'}
            isSelected={!isOnCustom}
            hasBassUp={hasBassUp}
            profiles={eqProfiles}
            currentEqProfile={state.eqConfiguration.value.profile}
            bassUpValue={state.eqConfiguration.value.profile === EQProfile.BassBooster}
            onPress={onCardPress}
            onPresetChange={eqProfileChange}
            onBassUpChange={onBassUpChange}
          />
          <EQModeCard
            showResetEq
            title={'EQ personalizado'}
            subTitle={'Custom'}
            isSelected={isOnCustom}
            onPress={onCardPress}
            onResetEq={eqRef.current?.onReset}
          />
          
          {isOnCustom && (
            <div className="mt-4 soundcore-card p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold">EQ personalizado</span>
                <Button isIconOnly size="sm" variant="light" onPress={eqRef.current?.onReset}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                </Button>
              </div>
              <Equalizer
                bands={state.featureSet.equalizerFeatures.bands}
                input={[...getMappedCustomEqValues()]}
                onEqualizerChange={onCustomEqualizerChange}
                ref={eqRef}
                disabled={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface EQModeCardProps {
  title: string;
  subTitle?: string;
  isSelected: boolean;
  hasBassUp?: boolean;
  currentEqProfile?: EQProfile;
  profiles?: Array<string>;
  bassUpValue?: boolean;
  onBassUpChange?: (v: boolean) => void;
  onPress?: (e: string) => void;
  showResetEq?: boolean;
  onResetEq?: () => void;
  onPresetChange?: (preset: EQProfile) => void;
}

const EQModeCard: React.FC<EQModeCardProps> = ({
  title,
  subTitle,
  isSelected,
  hasBassUp,
  currentEqProfile,
  profiles,
  bassUpValue,
  onBassUpChange,
  onPress,
  showResetEq,
  onResetEq,
  onPresetChange
}) => {
  const visibleEqProfile = !bassUpValue && currentEqProfile
    ? (currentEqProfile as string)
    : EQProfile.SoundcoreSignature;

  const actualTitleId = title === 'Predefinição' ? 'Preset' : 'Custom';

  return (
    <div 
      className={`w-full flex flex-col p-4 cursor-pointer transition-all ${isSelected ? 'soundcore-card-active' : 'soundcore-card'} hover:scale-[1.01]`}
      onClick={() => onPress && onPress(actualTitleId)}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className={`text-base font-bold ${isSelected ? 'text-black' : 'text-gray-200'}`}>{title}</span>
            <span className={`text-sm ${isSelected ? 'text-gray-800' : 'text-gray-500'}`}>{subTitle}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isSelected ? (
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-gray-500"></div>
          )}
        </div>
      </div>

      {isSelected && profiles && profiles.length > 0 && (
        <div className="w-full mt-4" onClick={(e) => e.stopPropagation()}>
          <Select
            label={!profiles.includes(visibleEqProfile) ? 'Selecione um perfil' : ''}
            className="w-full"
            size="md"
            onSelectionChange={(e) => {
              onPresetChange && onPresetChange([...e][0] as EQProfile);
            }}
            selectedKeys={[visibleEqProfile]}>
            {profiles.map((p) => (
              <SelectItem key={p} className="text-black">{p}</SelectItem>
            ))}
          </Select>
        </div>
      )}
    </div>
  );
};
