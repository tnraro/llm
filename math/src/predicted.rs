use std::fmt::{Debug, Display};
use std::str::FromStr;

use regex::Regex;
use std::error::Error;

pub struct Predicted {
  pub expression: String,
  pub answer: String,
}

impl Predicted {
  pub fn new(expression: &str, answer: &str) -> Self {
    Self {
      expression: expression.to_owned(),
      answer: answer.to_owned(),
    }
  }
}

impl FromStr for Predicted {
  type Err = ParsePredictedError;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    if Regex::new(r"(?i:\bEinstein\s+can't\s+solve\s+this\s+problem\b)")
      .unwrap()
      .is_match(&s)
    {
      return Err(ParsePredictedError::Einstein(s.to_owned()));
    }
    let re =
      Regex::new(r"EXPRESSION:\s*(?<expression>[^\n]+)\s*\n\s*ANSWER:\s*(?<answer>[^\n]+)\s*$")
        .unwrap();
    let caps = re
      .captures(s)
      .ok_or_else(|| ParsePredictedError::Empty(s.to_owned()))?;
    let expression = &caps["expression"];
    let answer = &caps["answer"];
    Ok(Predicted::new(expression, answer))
  }
}

#[derive(Debug)]
pub enum ParsePredictedError {
  Einstein(String),
  Empty(String),
}
impl Display for ParsePredictedError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      Self::Einstein(ref x) => write!(f, "ParseProblemError::Einstein({})", x),
      Self::Empty(ref x) => write!(f, "ParseProblemError::Empty({})", x),
    }
  }
}
impl Error for ParsePredictedError {}
