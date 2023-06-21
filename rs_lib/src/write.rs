use std::io::{BufWriter, Cursor};

use image::DynamicImage;

use crate::{
  error::{CrateResult, Error},
  format::{FileExtension, Format},
};

pub struct WritePayload {
  pub vec: Vec<u8>,
  pub width: u32,
  pub height: u32,
  pub filename_ext: String,
  pub format: Format,
}

pub fn write(
  image: DynamicImage,
  format: Format,
  filename: &str,
) -> CrateResult<WritePayload> {
  let size = image.as_bytes().len();
  let mut w = BufWriter::new(Cursor::new(Vec::with_capacity(size)));

  let img_format: image::ImageFormat = (&format).into();
  image.write_to(&mut w, img_format).unwrap();
  let vec = w
    .into_inner()
    .map_err(|_| Error::BufWriterFailed)?
    .into_inner();

  Ok(WritePayload {
    vec,
    width: image.width(),
    height: image.height(),
    format,
    filename_ext: format!("{}{}", filename, FileExtension::from(format)),
  })
}
