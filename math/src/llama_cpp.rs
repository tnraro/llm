use anyhow::Result;
use regex::Regex;
use std::process::Command;

pub struct Llama {
  model: String,
  model_options: LlamaOptions,
}

impl Llama {
  pub fn new(model: &str, model_options: LlamaOptions) -> Self {
    Llama {
      model: model.to_string(),
      model_options,
    }
  }
  pub fn predict(&self, prompt: &str, options: &PredictOptions) -> Result<String> {
    let mut cmd = self.make_option(prompt, options);
    let output = cmd.output()?;
    let stdout = String::from_utf8(output.stdout)?;
    let re = Regex::new(r"### Response:\n\s*(?s:(?<response>.+?))$")?;
    let m = re.captures(&stdout).unwrap();
    Ok(m["response"].to_owned())
  }
  fn make_prompt(&self, prompt: &str) -> String {
    format!(
      "{}\n### Instruction:\n{}\n### Response:\n",
      &self.model_options.system, prompt
    )
  }
  fn make_option(&self, prompt: &str, options: &PredictOptions) -> Command {
    let mut cmd = Command::new("../llama.cpp/main");
    if let Some(b) = options.help {
      if b {
        cmd.arg("-h");
        return cmd;
      }
    }
    cmd.arg("-p").arg(self.make_prompt(prompt));
    cmd.arg("-m").arg(&self.model);

    if let Some(n) = options.ctx_size {
      cmd.arg("-c").arg(n.to_string());
    }
    if let Some(n) = options.n_gpu_layers {
      cmd.arg("-ngl").arg(n.to_string());
    }
    cmd
  }
}

pub struct LlamaOptions {
  pub system: String,
}

impl Default for LlamaOptions {
  fn default() -> Self {
    LlamaOptions { system: "".into() }
  }
}

pub struct PredictOptions {
  pub n_gpu_layers: Option<i32>,
  pub ctx_size: Option<i32>,
  pub help: Option<bool>,
}
impl Default for PredictOptions {
  fn default() -> Self {
    PredictOptions {
      n_gpu_layers: None,
      ctx_size: None,
      help: None,
    }
  }
}
