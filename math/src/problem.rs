use std::fmt::{Debug, Display};
use std::str::FromStr;

use regex::Regex;
use std::error::Error;

pub struct Problem {
  pub expression: String,
  pub answer: String,
}

impl Problem {
  pub fn new(expression: &str, answer: &str) -> Self {
    Self {
      expression: expression.to_owned(),
      answer: answer.to_owned(),
    }
  }
}

impl FromStr for Problem {
  type Err = ParseProblemError;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    if Regex::new(r"(?i:\bEinstein\s+can't\s+solve\s+this\s+problem\b)")
      .unwrap()
      .is_match(&s)
    {
      return Err(ParseProblemError::Einstein(s.to_owned()));
    }
    let re =
      Regex::new(r"EXPRESSION:\s*(?<expression>[^\n]+)\s*\n\s*ANSWER:\s*(?<answer>[^\n]+)\s*$")
        .unwrap();
    let caps = re
      .captures(s)
      .ok_or_else(|| ParseProblemError::Empty(s.to_owned()))?;
    let expression = &caps["expression"];
    let answer = &caps["answer"];
    Ok(Problem::new(expression, answer))
  }
}

#[derive(Debug)]
pub enum ParseProblemError {
  Einstein(String),
  Empty(String),
}
impl Display for ParseProblemError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      Self::Einstein(ref x) => write!(f, "ParseProblemError::Einstein({})", x),
      Self::Empty(ref x) => write!(f, "ParseProblemError::Empty({})", x),
    }
  }
}
impl Error for ParseProblemError {}
