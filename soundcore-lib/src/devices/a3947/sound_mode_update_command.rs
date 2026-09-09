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
        vec![
            self.sound_mode.current.as_u8(),
            (self.sound_mode.custom_anc.as_u8() << 4) | 0x00, 
            self.sound_mode.trans_mode.as_u8(),
            self.sound_mode.anc_mode.as_u8(),
            0x01, 
            self.sound_mode.custom_trans.unwrap_or_default().as_u8(), 
            0x00,
        ]
    }
}
