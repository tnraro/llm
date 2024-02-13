use anyhow::Result;
use llama_cpp::PredictOptions;

use crate::problem::Problem;

mod llama_cpp;
mod predicted;
mod problem;
fn main() -> Result<()> {
  let problem = Problem::new(
    "../llama.cpp/models/truthful_dpo_tomgrc_fusionnet_7bx2_moe_13b.Q4_K_M.gguf",
    PredictOptions {
      n_gpu_layers: Some(24),
      ctx_size: Some(512),
      ..PredictOptions::default()
    },
  );
  let problem = problem.solve("철수는 사과를 5개 바나나를 2개 가지고 있다. 영희가 철수에게 사과를 3개 더 줬을때, 철수가 가지고 있는 사과의 갯수는?")?;

  println!("식: {}", problem.predicted_expression);
  println!("답: {}", problem.predicted_answer);

  Ok(())
}
