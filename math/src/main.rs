use anyhow::Result;
use llama_cpp::{Llama, LlamaOptions, PredictOptions};
use regex::Regex;

mod llama_cpp;
fn main() -> Result<()> {
  let system = "# IDENTITY and PURPOSE

You extract mathematical expression, explanation from the text content.

# STEPS

1. Write a mathematical expression into a section called EXPRESSION:
2. Write a answer of the expression into a section called ANSWER:

# OUTPUT INSTRUCTIONS

- Only output plain text.
- Only output \"Einstein can't solve this problem.\" if no mathematical expression exists in given text.
- Do not explain anything in expression and answer sections.
- Comment begins with double slash (//).
- Do not give warnings or notes; only output the requested sections.
- Do not use unnecessary '\\', '{', '}'.
- Do not repeat steps, expression, or answer.
- Do not start items with the same opening words.
- Ensure you follow ALL these instructions when creating your output.";
  let model_options = LlamaOptions {
    system: system.into(),
    ..LlamaOptions::default()
  };
  let llama = Llama::new(
    "../llama.cpp/models/truthful_dpo_tomgrc_fusionnet_7bx2_moe_13b.Q4_K_M.gguf",
    model_options,
  );
  let predict_options = PredictOptions {
    n_gpu_layers: Some(24),
    ctx_size: Some(512),
    ..PredictOptions::default()
  };
  let question = "철수는 사과를 5개 바나나를 2개 가지고 있다. 영희가 철수에게 사과를 3개 더 줬을때, 철수가 가지고 있는 사과의 갯수는?";
  let output = llama.predict(question, predict_options)?;
  println!("{}", question);
  let re_no_mathematical_expression_exists = Regex::new(r"(?i:\bEinstein\b)")?;
  if re_no_mathematical_expression_exists.is_match(&output) {
    println!("Error: {}", output);
  } else {
    let re_response =
      Regex::new(r"EXPRESSION:\s*(?<expression>[^\n]+)|ANSWER:\s*(?<answer>[^\n]+)")?;
    for caps in re_response.captures_iter(&output) {
      if let Some(x) = caps.get(1) {
        println!("식: {}", x.as_str());
      }
      if let Some(x) = caps.get(2) {
        println!("답: {}", x.as_str());
      }
    }
  }

  Ok(())
}
