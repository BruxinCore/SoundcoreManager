import {
  BluetoothAdrr,
  CurrentSoundMode,
  SoundcoreDeviceState,
  SoundMode
} from '@generated-types/soundcore-lib';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, Slider, Tab, Tabs } from '@nextui-org/react';
import { BLEDevice } from '../../ble/bleDevice';
import { useTauriManagerStore } from '@stores/tauri/useTauriManagerStore';
import { useWebManagerStore } from '@stores/web/useWebManagerStore';
import ANCIcon from '@assets/ambient_icon_anc.png';
import TransIcon from '@assets/ambient_icon_trans.png';
import NormalIcon from '@assets/ambient_icon_off.png';
import { useUpdateDeviceSoundMode } from '@hooks/useDeviceCommand';

export interface SoundModeTabsProps {
  state: SoundcoreDeviceState;
}

export const SoundModeTabs: React.FC<SoundModeTabsProps> = ({ state }: SoundModeTabsProps) => {
  const {
    soundMode: soundModeState,
    featureSet: {
      soundModeFeatures: {
        allowedAncModes: ancFeatures,
        allowedTransparencyModes: transparencyFeatures,
        hasNormal: hasNormalMode,
        maxCustomAnc: maxCustomAncValue,
        maxCustomTransparency: maxCustomTransValue
      } = {}
    }
  } = state;

  const deviceAddrOrDevice: BluetoothAdrr | BLEDevice | null = window.isTauri
    ? useTauriManagerStore((state) => state.currentViewedDevice)
    : useWebManagerStore((state) => state.device);

  if (
    !soundModeState ||
    !deviceAddrOrDevice ||
    !ancFeatures ||
    !transparencyFeatures ||
    !hasNormalMode
  ) {
    return <></>;
  }

  const mapModeToCurrentSoundModeKey = useCallback((mode: CurrentSoundMode) => {
    const lowerCaseMode = mode.toLowerCase();
    if (lowerCaseMode === CurrentSoundMode.ANC.toLowerCase()) {
      return 'ancMode';
    } else if (lowerCaseMode === CurrentSoundMode.Transparency.toLowerCase()) {
      return 'transMode';
    }
    return null;
  }, []);

  const mapModeToFeatures = useCallback((mode: CurrentSoundMode) => {
    const lowerCaseMode = mode.toLowerCase();
    if (lowerCaseMode === CurrentSoundMode.ANC.toLowerCase()) {
      return ancFeatures;
    } else if (lowerCaseMode === CurrentSoundMode.Transparency.toLowerCase()) {
      return transparencyFeatures;
    }
    return [];
  }, []);

  const [selectedSoundMode, setSelectedSoundMode] = useState<SoundMode>(soundModeState);

  // Synchronize external changes originating from the device
  useEffect(() => {
    setSelectedSoundMode(soundModeState);
  }, [soundModeState]);

  const modeButtons = mapModeToFeatures(selectedSoundMode.current)
    .map((mode) => {
      return { title: mode.value, value: mode.value };
    })
    .sort((a, b) => {
      if (a && a.title && b && b.title) {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  const handleCurrentSoundModeChange = (soundMode: CurrentSoundMode) => {
    useUpdateDeviceSoundMode(deviceAddrOrDevice, {
      ...selectedSoundMode,
      current: soundMode
    });
  };

  const handleCustomValueChange = (value: number | number[]) => {
    if (Array.isArray(value)) return;
    if (selectedSoundMode.current === CurrentSoundMode.ANC) {
      useUpdateDeviceSoundMode(deviceAddrOrDevice, {
        ...selectedSoundMode,
        customAnc: value
      });
    } else if (selectedSoundMode.current === CurrentSoundMode.Transparency) {
      useUpdateDeviceSoundMode(deviceAddrOrDevice, {
        ...selectedSoundMode,
        customTrans: value
      });
    }
  };

  const currentNonNormalSoundModeKey = mapModeToCurrentSoundModeKey(selectedSoundMode.current);
  let currentSubValue = '';
  let currentCustomAncOrTransValue = 0;
  let maxCustomSliderValue = 0;
  let isCustomSoundModeSelected: boolean = false;

  if (currentNonNormalSoundModeKey) {
    currentSubValue = selectedSoundMode[currentNonNormalSoundModeKey].value as string;
    isCustomSoundModeSelected =
      selectedSoundMode[currentNonNormalSoundModeKey].value.toLowerCase() === 'custom';
    if (currentNonNormalSoundModeKey === 'ancMode') {
      currentCustomAncOrTransValue = selectedSoundMode.customAnc;
      maxCustomSliderValue = maxCustomAncValue || 5;
    } else if (currentNonNormalSoundModeKey === 'transMode') {
      currentCustomAncOrTransValue = selectedSoundMode.customTrans || 0;
      maxCustomSliderValue = maxCustomTransValue || 5;
    }
  }

  const handleSubSoundModeChange = (subMode: string) => {
    if (selectedSoundMode.current === CurrentSoundMode.Normal) return;

    const soundModeKey =
      selectedSoundMode.current === CurrentSoundMode.ANC ? 'ancMode' : 'transMode';
    useUpdateDeviceSoundMode(deviceAddrOrDevice, {
      ...selectedSoundMode,
      [soundModeKey]: {
        type: selectedSoundMode[soundModeKey].type,
        value: subMode
      }
    });
  };

  return (
    <div className={'soundcore-card w-full flex flex-col p-4 mb-4 max-w-xl mx-auto'}>
      <h3 className="text-white font-semibold mb-2">Som ambiente</h3>
      <div className={'flex flex-col w-full justify-center items-center gap-2'}>
        <CurrentSoundModeTabs
          selectedSoundMode={selectedSoundMode}
          onChange={handleCurrentSoundModeChange}
        />
        {selectedSoundMode.current !== CurrentSoundMode.Normal && modeButtons.length > 0 && (
          <SubSoundModeTabs
            buttons={modeButtons}
            selectedValue={currentSubValue}
            onClick={handleSubSoundModeChange}
          />
        )}
        <Slider
          className={`${isCustomSoundModeSelected ? 'visible transition-all ease-in-out' : 'invisible'} transition-opacity ease-in-out px-4`}
          size={'sm'}
          step={1}
          minValue={0}
          showSteps={true}
          value={currentCustomAncOrTransValue}
          onChange={handleCustomValueChange}
          maxValue={maxCustomSliderValue}
          classNames={{
            track: "bg-[#2a2a2a]",
            filler: "bg-[#00e5ff]",
            thumb: "bg-[#00e5ff]"
          }}
        />
      </div>
    </div>
  );
};

interface CurrentSoundModeTabsProps {
  selectedSoundMode: SoundMode;
  onChange: (currentMode: CurrentSoundMode) => void;
}

const CurrentSoundModeTabs: React.FC<CurrentSoundModeTabsProps> = ({
  selectedSoundMode,
  onChange
}) => {
  return (
    <div className="flex w-full justify-around items-start py-4 px-2">
      <div className="flex flex-col items-center gap-3 cursor-pointer" onClick={() => onChange(CurrentSoundMode.ANC)}>
        <div className={selectedSoundMode.current === CurrentSoundMode.ANC ? 'soundcore-circle-btn-active' : 'soundcore-circle-btn'}>
           <Image src={ANCIcon} className="w-8 h-8 object-contain brightness-0 invert" disableSkeleton />
        </div>
        <span className={`text-xs text-center ${selectedSoundMode.current === CurrentSoundMode.ANC ? 'text-white' : 'text-gray-400'}`}>Cancelamento<br/>de ruído</span>
      </div>

      <div className="flex flex-col items-center gap-3 cursor-pointer" onClick={() => onChange(CurrentSoundMode.Normal)}>
        <div className={selectedSoundMode.current === CurrentSoundMode.Normal ? 'soundcore-circle-btn-active' : 'soundcore-circle-btn'}>
           <Image src={NormalIcon} className="w-8 h-8 object-contain brightness-0 invert" disableSkeleton />
        </div>
        <span className={`text-xs text-center ${selectedSoundMode.current === CurrentSoundMode.Normal ? 'text-white' : 'text-gray-400'}`}>Normal</span>
      </div>

      <div className="flex flex-col items-center gap-3 cursor-pointer" onClick={() => onChange(CurrentSoundMode.Transparency)}>
        <div className={selectedSoundMode.current === CurrentSoundMode.Transparency ? 'soundcore-circle-btn-active' : 'soundcore-circle-btn'}>
           <Image src={TransIcon} className="w-8 h-8 object-contain brightness-0 invert" disableSkeleton />
        </div>
        <span className={`text-xs text-center ${selectedSoundMode.current === CurrentSoundMode.Transparency ? 'text-white' : 'text-gray-400'}`}>Modos de<br/>transparência</span>
      </div>
    </div>
  );
};

interface SubSoundModeTabsProps {
  buttons: Array<{ title: string; value: string }>;
  selectedValue: string;
  onClick: (value: string) => void;
}

const SubSoundModeTabs: React.FC<SubSoundModeTabsProps> = ({ buttons, selectedValue, onClick }) => {
  return (
    <div className="flex gap-2 flex-wrap justify-center mb-4 mt-2">
      {buttons.map((b) => (
        <button
          key={b.value}
          onClick={() => onClick(b.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedValue === b.value
              ? 'bg-[#00e5ff] text-black shadow-[0_0_10px_rgba(0,229,255,0.3)]'
              : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
          }`}
        >
          {b.title}
        </button>
      ))}
    </div>
  );
};
