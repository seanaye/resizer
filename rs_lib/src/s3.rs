use log::info;
use reqwest::{Body, Client, Url};
use roxmltree::Document;
use rusty_s3::{Bucket, Credentials, S3Action, UrlStyle};

use crate::{
  error::{CrateResult, Error},
  format::{FileExtension, Format, Mime, RawImage},
};
use std::time::Duration;

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
    bucket_name: String,
    region: String,
    key: &str,
    secret: &str,
  ) -> Self {
    let endpoint = endpoint.parse().expect("Invalid URL for endpoint");
    let bucket =
      Bucket::new(endpoint, UrlStyle::VirtualHost, bucket_name, region)
        .expect("Url has a valid scheme and host");
    let credentials = Credentials::new(key, secret);
    Self {
      bucket,
      credentials,
      client: Client::new(),
      host_rewrite,
    }
  }

  fn use_cdn_url(&self, mut u: Url) -> CrateResult<Url> {
    let host_str = self.host_rewrite.as_str();
    u.set_host(Some(host_str)).map_err(|_| Error::ParseError)?;
    Ok(u)
  }

  pub async fn get_image(&self, object_name: &str) -> CrateResult<RawImage> {
    // TODO investigate streaming response body into bufreader
    info!("get_object: {:?}", object_name);

    let get_object =
      self.bucket.get_object(Some(&self.credentials), object_name);

    let url = get_object.sign(Duration::from_secs(10));
    let new_url = self.use_cdn_url(url)?;

    let res = self
      .client
      .get(new_url)
      .send()
      .await
      .map_err(Error::Reqwest)?;

    RawImage::from_request(res).await
  }

  pub async fn put_image(
    &self,
    object_name: &str,
    image: impl Into<Body>,
    format: Format,
  ) -> CrateResult<()> {
    let put_object =
      self.bucket.put_object(Some(&self.credentials), object_name);
    let url = put_object.sign(Duration::from_secs(10));
    let new_url = self.use_cdn_url(url)?;

    let res = self
      .client
      .put(new_url)
      .header("Content-Type", Mime::from(format).to_string())
      .body(image)
      .send()
      .await
      .map_err(Error::Reqwest)?;

    if !res.status().is_success() {
      return Err(Error::StatusCode(res.status().as_u16()));
    }

    Ok(())
  }

  pub async fn list_files(&self) -> CrateResult<Vec<String>> {
    let unsigned = self.bucket.list_objects_v2(Some(&self.credentials));
    let url = unsigned.sign(Duration::from_secs(10));
    let new_url = self.use_cdn_url(url)?;

    let res = self
      .client
      .get(new_url)
      .send()
      .await
      .map_err(Error::Reqwest)?;
    if !res.status().is_success() {
      return Err(Error::StatusCode(res.status().as_u16()));
    }
    let text = res.text().await.map_err(Error::Reqwest)?;
    let doc = Document::parse(&text).map_err(|_| Error::ParseError)?;

    let out: Vec<String> = doc
      .descendants()
      .filter_map(|n| {
        match n.has_tag_name("Key")
          && n.text().is_some_and(|t| t.contains(".png"))
        {
          true => Some(n.text().unwrap().trim().to_owned()),
          false => None,
        }
      })
      .collect();

    Ok(out)
  }
}
