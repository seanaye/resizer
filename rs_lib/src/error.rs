
#[derive(Debug)]
pub enum Error {
  Reqwest(reqwest::Error),
  Image(image::ImageError),
  ParseError,
  BufWriterFailed,
}
