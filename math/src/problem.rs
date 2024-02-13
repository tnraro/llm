use anyhow::Result;

use crate::{
  llama_cpp::{Llama, LlamaOptions, PredictOptions},
  predicted::Predicted,
};

pub struct Problem {
  predict_options: PredictOptions,
  llama: Llama,
}

impl Problem {
  pub fn new(model: &str, predict_options: PredictOptions) -> Self {
    let llama_options = LlamaOptions {
      system: "# IDENTITY and PURPOSE

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
- Ensure you follow ALL these instructions when creating your output.".into(),
      ..Default::default()
    };
    let llama = Llama::new(model, llama_options);
    Self {
      llama,
      predict_options,
    }
  }
  pub fn solve(&self, problem: &str) -> Result<ProblemResult> {
    let output = self.llama.predict(problem, &self.predict_options)?;
    let predicted = output.parse::<Predicted>()?;
    Ok(ProblemResult {
      problem: problem.to_owned(),
      predicted_expression: predicted.expression,
      predicted_answer: predicted.answer,
    })
  }
}

#[derive(Debug)]
pub struct ProblemResult {
  pub problem: String,
  pub predicted_expression: String,
  pub predicted_answer: String,
}
