
#[derive(Debug)]
pub enum Error {
  Reqwest(reqwest::Error),
  StatusCode(u16),
  Image(image::ImageError),
  ParseError,
  BufWriterFailed,
}

pub type CrateResult<T> = Result<T, Error>;
