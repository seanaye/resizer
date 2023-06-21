use std::convert::From;
use std::{
  fmt::{Display, Formatter},
  str::FromStr,
};

use log::info;

use crate::error::{CrateResult, Error};

#[derive(Debug, Clone, Copy)]
pub enum Format {
  Jpeg,
  Png,
  Webp,
  Avif,
}

pub struct FileExtension(Format);

impl Display for FileExtension {
  fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
    match self.0 {
      Format::Avif => write!(f, ".avif"),
      Format::Png => write!(f, ".png"),
      Format::Jpeg => write!(f, ".jpg"),
      Format::Webp => write!(f, ".webp"),
    }
  }
}

impl From<Format> for FileExtension {
  fn from(value: Format) -> Self {
    Self(value)
  }
}

impl From<FileExtension> for Format {
  fn from(value: FileExtension) -> Self {
    value.0
  }
}

pub struct Mime(Format);

impl From<Format> for Mime {
  fn from(value: Format) -> Self {
    Self(value)
  }
}

impl From<Mime> for Format {
  fn from(value: Mime) -> Self {
    value.0
  }
}

impl FromStr for Mime {
  type Err = Error;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    match s {
      "image/jpeg" => Ok(Mime(Format::Jpeg)),
      "image/png" => Ok(Mime(Format::Png)),
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

impl Display for Mime {
  fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
    match self.0 {
      Format::Jpeg => write!(f, "image/jpeg"),
      Format::Png => write!(f, "image/png"),
      Format::Webp => write!(f, "image/webp"),
      Format::Avif => write!(f, "image/avif"),
    }
  }
}

#[derive(Debug)]
pub struct RawImage {
  pub format: Format,
  pub bytes: bytes::Bytes,
}

impl RawImage {
  pub async fn from_request(res: reqwest::Response) -> CrateResult<Self> {
    let status = res.status();
    info!("response code from cdn: {}", status);
    if !status.is_success() {
      return Err(Error::StatusCode(status.as_u16()));
    }

    let headers = res
      .headers()
      .get(reqwest::header::CONTENT_TYPE)
      .ok_or_else(|| Error::ParseError)?;

    let content_type = headers.to_str().map_err(|_| Error::ParseError)?;
    let format: Format = Mime::from_str(content_type)?.into();

    let bytes = res.bytes().await.map_err(Error::Reqwest)?;
    Ok(RawImage { bytes, format })
  }
}
