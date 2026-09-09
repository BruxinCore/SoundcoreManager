use crate::{models::SoundMode, packets::Packet};

pub struct A3947SoundModeUpdateCommand {
    sound_mode: SoundMode,
}

impl A3947SoundModeUpdateCommand {
    pub fn new(sound_mode: SoundMode) -> Self {
        Self { sound_mode }
    }
}

impl Packet for A3947SoundModeUpdateCommand {
    fn command(&self) -> [u8; 7] {
        [0x08, 0xEE, 0x00, 0x00, 0x00, 0x06, 0x81]
    }

    fn payload(&self) -> Vec<u8> {
        let mut p = vec![0x11, 0x00];
        p.extend_from_slice(&self.sound_mode.to_bytes_with_custom_transparency());
        p
    }
}
