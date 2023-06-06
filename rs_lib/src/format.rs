use std::{
  fmt::{Display, Formatter},
  str::FromStr,
};

use crate::error::Error;

pub enum Format {
  Jpeg,
  Png,
  Webp,
  Avif,
}

impl FromStr for Format {
  type Err = Error;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    match s {
      "image/jpeg" => Ok(Self::Jpeg),
      "image/png" => Ok(Self::Png),
      _ => Err(Error::ParseError),
    }
  }
}

impl From<&Format> for image::ImageFormat {
  fn from(value: &Format) -> Self {
    match value {
      Format::Jpeg => Self::Jpeg,
      Format::Png => Self::Png,
      Format::Webp => Self::WebP,
      Format::Avif => Self::Avif,
    }
  }
}

impl Display for Format {
  fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
    match self {
      Self::Jpeg => write!(f, "image/jpeg"),
      Self::Png => write!(f, "image/png"),
      Self::Webp => write!(f, "image/webp"),
      Self::Avif => write!(f, "image/avif"),
    }
  }
}
