import { Battery, SoundcoreDeviceState } from '@generated-types/soundcore-lib';
import { getImageForModel } from '@utils/modelToImgMap';
import { BatteryIcon } from './batteryIcon';
import React from 'react';
import { Card, CardBody, Image } from '@nextui-org/react';
import { getDeviceName } from '@utils/getDeviceName';
import { SoundModeTabs } from '@components/DeviceStateCard/soundModeTabs';

export const DeviceStateCard: React.FC<{
  state: SoundcoreDeviceState | null;
}> = ({ state }) => {
  if (!state) {
    return <></>;
  }

  return (
    <Card
      className="soundcore-card m-5 p-2 w-full max-w-xl mx-auto flex flex-col items-center justify-center"
      shadow="none"
      radius="lg">
      <CardBody>
        <div className="flex flex-row items-center justify-between w-full">
          <div className="w-1/3 flex justify-center items-center">
            <ProductImage model={state?.serial?.model} />
          </div>
          
          <div className="w-2/3 flex flex-col justify-center px-4">
            <div className="flex w-full items-start justify-between gap-2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-wide leading-tight">
                {getDeviceName(state?.serial?.model)}
              </h1>
              <div className="flex shrink-0 mt-1">
                <BatteryRow battery={state?.battery} />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              <span className="text-gray-400 text-sm">Ligado</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const BatteryRow: React.FC<{
  battery: Battery | undefined;
}> = ({ battery }) => {
  if (!battery) {
    // TODO: Handle unknown battery state
    return <></>;
  }

  if (battery?.type == 'single') {
    return (
      <div className={'flex items-center gap-1 text-gray-300'}>
        <BatteryIcon battery={battery.value} />
      </div>
    );
  }

  if (battery?.type == 'dual') {
    return (
      <div className={'flex items-center gap-3 text-gray-300'}>
        <div className={'flex items-center gap-1'}>
          <span className="text-xs font-bold border border-gray-500 rounded-full w-4 h-4 flex items-center justify-center">L</span>
          <BatteryIcon battery={battery.value.left} />
        </div>
        <div className={'flex items-center gap-1'}>
          <span className="text-xs font-bold border border-gray-500 rounded-full w-4 h-4 flex items-center justify-center">R</span>
          <BatteryIcon battery={battery.value.right} />
        </div>
      </div>
    );
  }

  return <></>;
};

const ProductImage: React.FC<{ model: string | null | undefined }> = ({ model }) => {
  const imageResult = getImageForModel(model || '');

  if (!imageResult) {
    return <></>;
  }

  const imageProps: React.ComponentProps<typeof Image> = {
    className: 'object-contain max-h-32 drop-shadow-2xl hover:scale-105 transition-transform duration-500',
    disableSkeleton: true
  };

  return (
    <>
      {imageResult && imageResult.kind === 'single' ? (
        <Image src={imageResult.data.img} {...imageProps} />
      ) : (
        <div className="flex items-center justify-center">
          <Image src={imageResult.data.left.img} {...imageProps} />
          <Image src={imageResult.data.right.img} {...imageProps} className="-ml-6 mt-4" />
        </div>
      )}
    </>
  );
};
