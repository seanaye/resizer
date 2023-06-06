mod download;
mod error;
mod format;
use std::{
  io::{BufWriter, Cursor},
  panic,
};

use download::DownloadClient;
use error::Error;
use gloo_net::http::Response;
use log::{info, Level};
use wasm_bindgen::prelude::*;

use crate::format::Format;

#[wasm_bindgen]
pub struct App {
  download_client: download::DownloadClient,
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
    Self {
      download_client: DownloadClient::new(
        endpoint,
        host_rewrite,
        name,
        region,
        key,
        secret,
      ),
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

  async fn handler_inner(
    &self,
    object: String,
    width: u32,
    height: u32,
  ) -> Result<js_sys::Uint8Array, Error> {
    let performance = web_sys::window().unwrap().performance().unwrap();
    let download_start = performance.now();
    let (bytes, format) = self.download_client.get_image(&object).await?;
    let download_done = performance.now();
    info!("downloaded in {}ms", download_done - download_start);

    let start = performance.now();
    // let reader = Reader::with_format(buffer, image::ImageFormat::Jpeg);
    let image =
      image::load_from_memory_with_format(bytes.as_ref(), (&format).into())
        .map_err(Error::Image)?;
    let decoded = performance.now();

    info!(
      "original_width: {}, original_height: {}, decoded in: {}ms",
      image.width(),
      image.height(),
      decoded - start
    );
    let resized = image.thumbnail(width, height);
    let done_resize = performance.now();
    let output_width = image.width();
    let output_height = image.height();
    info!(
        "target_width: {}, target_height: {}, output_width: {}, output_height: {}, done in {}ms",
        width,
        height,
        output_width,
        output_height,
        done_resize - decoded
    );

    let mut w = BufWriter::new(Cursor::new(Vec::new()));

    let format = Format::Jpeg;
    let img_format: image::ImageFormat = (&format).into();
    let header_format = format.to_string();
    resized.write_to(&mut w, img_format).unwrap();
    let mut vec = w
      .into_inner()
      .map_err(|_| Error::BufWriterFailed)?
      .into_inner();
    let done_write = performance.now();
    info!("done writing in {}ms", done_write - done_resize);

    let output = js_sys::Uint8Array::new_with_length(vec.len() as u32);
    output.copy_from(&vec);
    Ok(output)
  }
}
