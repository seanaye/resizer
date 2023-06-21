use rustc_hash::FxHasher;
use std::default::Default;
use std::hash::{Hash, Hasher};

use crate::error::CrateResult;
use crate::format::{FileExtension, Format, RawImage};
use crate::s3::DownloadClient;

#[derive(Debug)]
pub struct CachePayload<'a> {
  object: &'a str,
  width: Option<u32>,
  height: Option<u32>,
  format: Format,
}

impl<'a> CachePayload<'a> {
  pub fn new(object: &'a str, width: Option<u32>, height: Option<u32>, format: Format) -> Self {
    let o = object.split('.').next().unwrap();

    Self {
      object: o,
      width,
      height,
      format,
    }
  }
}

impl<'a> Hash for CachePayload<'a> {
  fn hash<H: Hasher>(&self, state: &mut H) {
    self.object.hash(state);
    self.width.hash(state);
    self.height.hash(state);
  }
}

pub trait ToHashStr {
  fn to_hash_str(&self) -> String;
}

impl<'a> ToHashStr for &CachePayload<'a> {
  fn to_hash_str(&self) -> String {
    let mut hasher = FxHasher::default();
    self.hash(&mut hasher);
    let out = hasher.finish();
    format!("{:X}", out)
  }
}

pub struct Cache {
  pub prefix: Option<String>,
}

impl Cache {
  fn full_title(&self, key: CachePayload) -> String {
    let hash_str = (&key).to_hash_str();
    let full_object = match self.prefix.as_ref() {
      Some(x) => format!("{x}/{hash_str}{}", FileExtension::from(key.format)),
      None => hash_str,
    };
    full_object
  }

  pub async fn get<'a>(
    &self,
    key: CachePayload<'a>,
    client: &DownloadClient,
  ) -> Option<RawImage> {
    let full_object = self.full_title(key);
    client.get_image(full_object.as_str()).await.ok()
  }

  pub async fn put(
    &self,
    key: CachePayload<'_>,
    bytes: Vec<u8>,
    client: &DownloadClient,
  ) -> CrateResult<()> {
    let format = key.format;
    let full_object = self.full_title(key);
    client.put_image(&full_object, bytes, format).await
  }
}
