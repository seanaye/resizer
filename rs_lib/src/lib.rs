mod cache;
mod error;
mod format;
mod s3;
mod write;
use std::{
  io::{BufReader, Cursor},
  panic,
};

use cache::{Cache, CachePayload};
use error::Error;
use gloo_net::http::Response;
use image::{io::Reader, DynamicImage};
use log::{info, Level};
use s3::DownloadClient;
use wasm_bindgen::prelude::*;

use crate::{
  format::{Format, RawImage},
  write::WritePayload,
};

#[wasm_bindgen]
pub struct App {
  download_client: DownloadClient,
  cache: Cache,
}

#[wasm_bindgen]
impl App {
  pub fn new(
    endpoint: &str,
    host_rewrite: String,
    name: String,
    region: String,
    key: &str,
    secret: &str,
  ) -> Self {
    panic::set_hook(Box::new(console_error_panic_hook::hook));
    console_log::init_with_level(Level::Debug).unwrap();
    info!("start");
    let download_client =
      DownloadClient::new(endpoint, host_rewrite, name, region, key, secret);

    let cache = Cache {
      prefix: Some("cache".to_owned()),
    };

    Self {
      download_client,
      cache,
    }
  }

  pub async fn handler(
    &self,
    url: String,
    width: u32,
    height: u32,
  ) -> Result<js_sys::Uint8Array, web_sys::Response> {
    self.handler_inner(url, width, height).await.map_err(|e| {
      Response::builder()
        .status(500)
        .header("Content-Type", "application/json")
        .body(Some(format!(r#"message": "{:?}"#, e).as_str()))
        .unwrap()
        .into()
    })
  }

  pub async fn list(&self) -> js_sys::Array {
    let vec = self.download_client.list_files().await.unwrap();
    vec
      .into_iter()
      .map(JsValue::from)
      .collect::<js_sys::Array>()
  }

  fn get_output_image(
    &self,
    image: DynamicImage,
    width: u32,
    height: u32,
  ) -> DynamicImage {
    if width == 0 || height == 0 {
      return image;
    }
    image.thumbnail(width, height)
  }

  async fn handler_inner(
    &self,
    object: String,
    width: u32,
    height: u32,
  ) -> Result<js_sys::Uint8Array, Error> {
    let performance = web_sys::window().unwrap().performance().unwrap();
    let download_start = performance.now();

    let to_search =
      CachePayload::new(&object, None, Some(height), Format::Jpeg);

    let res = self.cache.get(to_search, &self.download_client).await;

    if let Some(payload) = res {
      info!("cache hit");
      let vec: Vec<u8> = payload.bytes.into();
      let u8array = js_sys::Uint8Array::from(vec.as_slice());
      return Ok(u8array);
    }

    let RawImage { bytes, format } =
      self.download_client.get_image(&object).await?;
    let download_done = performance.now();
    info!("downloaded in {}ms", download_done - download_start);

    let start = performance.now();
    let image = Reader::with_format(
      BufReader::new(Cursor::new(bytes.as_ref())),
      (&format).into(),
    )
    .decode()
    .map_err(Error::Image)?;
    let decoded = performance.now();

    info!(
      "original_width: {}, original_height: {}, decoded in: {}ms",
      image.width(),
      image.height(),
      decoded - start
    );
    let resized = self.get_output_image(image, width, height);
    let done_resize = performance.now();
    let output_width = resized.width();
    let output_height = resized.height();
    info!(
        "target_width: {}, target_height: {}, output_width: {}, output_height: {}, done in {}ms",
        width,
        height,
        output_width,
        output_height,
        done_resize - decoded
    );

    let format = Format::Jpeg;
    let WritePayload {
      vec,
      height,
      filename_ext,
      format,
      ..
    } = write::write(resized, format, &object)?;

    let output = js_sys::Uint8Array::new_with_length(vec.len() as u32);
    output.copy_from(&vec);

    self
      .cache
      .put(
        CachePayload::new(&filename_ext, None, Some(height), format),
        vec,
        &self.download_client,
      )
      .await?;

    let done_write = performance.now();
    info!("done writing in {}ms", done_write - done_resize);

    Ok(output)
  }
}
