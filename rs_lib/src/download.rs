use bytes::Bytes;
use log::info;
use reqwest::{Client, Url};
use rusty_s3::{Bucket, Credentials, S3Action, UrlStyle};

use crate::error::Error;
use crate::format::Format;
use std::{time::Duration, str::FromStr};

pub struct DownloadClient {
  bucket: Bucket,
  credentials: Credentials,
  host_rewrite: String,
  client: reqwest::Client,
}

impl DownloadClient {
  pub fn new(
    endpoint: &str,
    host_rewrite: String,
    name: String,
    region: String,
    key: &str,
    secret: &str,
  ) -> Self {
    let endpoint = endpoint.parse().expect("Invalid URL for endpoint");
    let bucket = Bucket::new(endpoint, UrlStyle::VirtualHost, name, region)
      .expect("Url has a valid scheme and host");
    let credentials = Credentials::new(key, secret);
    Self {
      bucket,
      credentials,
      client: Client::new(),
      host_rewrite,
    }
  }

  fn use_cdn_url(&self, mut u: Url) -> Result<Url, Error> {
    let host_str = self.host_rewrite.as_str();
    info!("host_str: {}", host_str);
    u.set_host(Some(host_str)).map_err(|_| Error::ParseError)?;
    Ok(u)
  }

  pub async fn get_image(
    &self,
    object: &str,
  ) -> Result<(Bytes, Format), Error> {
    // TODO investigate streaming response body into bufreader
    let get_object = self.bucket.get_object(Some(&self.credentials), object);
    info!("get object");
    let url = get_object.sign(Duration::from_secs(60));
    let new_url = self.use_cdn_url(url)?;
    info!("{new_url}");
    let res = self
      .client
      .get(new_url)
      .send()
      .await
      .map_err(Error::Reqwest)?;
    let status = res.status();
    let headers = res
      .headers()
      .get(reqwest::header::CONTENT_TYPE)
      .ok_or_else(|| Error::ParseError)?;
    let content_type = headers.to_str().map_err(|_| Error::ParseError)?;
    let format = Format::from_str(content_type)?;
    info!("response code from cdn: {}", status);
    let bytes = res.bytes().await.map_err(Error::Reqwest)?;
    Ok((bytes, format.into()))
  }
}

