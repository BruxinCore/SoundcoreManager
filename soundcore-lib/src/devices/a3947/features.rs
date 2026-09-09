use std::sync::Arc;

use crate::api::{DeviceFeatureSet, EqualizerFeatures, FeatureFlags, SoundModeFeatures};

pub fn a3947_features() -> DeviceFeatureSet {
    DeviceFeatureSet {
        sound_mode_features: Some(
            SoundModeFeatures::adaptive_customizable_anc_customizable_transparency(),
        ),
        equalizer_features: Some(EqualizerFeatures {
            bands: 10,
            channels: 2,
            has_bass_up: false, // Reusing A3040 eq command which supports custom profiles directly
        }),
        flags: Arc::new([
            FeatureFlags::TOUCH_TONES,
            FeatureFlags::WEAR_DETECTION,
            FeatureFlags::HEARING_PROTECTION,
            FeatureFlags::IN_EAR_BEEP,
            FeatureFlags::AUTO_POWER_OFF_ON,
        ]),
    }
}
