import { test, expect } from "bun:test";
import { unmd } from "./md";

test("unmd", () => {
  const md = `Sure, here's a summary of the main themes from the text:
  **Time and Perception**
  * Time is relative and \`subjective\`.
  * Different perspectives can _lead_ to different perceptions of time.
  * Light and vision play a significant role in shaping the perception of time.
  **Nature of Reality**
  * The passage raises questions about the nature of reality and the role of perception in shaping our understanding of the world.
  * The text emphasizes the importance of perspective in shaping our perception of time.
  **Human Connection and Relationships**
  * The passage explores the complex dynamics of family and the challenges of navigating relationships over time.
  * It highlights the importance of communication and understanding in maintaining healthy relationships.
  **Science and Technology**
  * The passage discusses the challenges of studying and observing life.
  * It raises questions about the potential for life to exist outside of Earth, including the possibility of life existing in other planets.
  **Light and Vision**
  * Light has transformative power and can shape perceptions of time.
  * The passage highlights the importance of light and vision in understanding the world.
  
  Sure, here is the final summary of the main themes from the text:
  1. The study and observation of life are challenging due to the complex and dynamic nature of microorganisms.
  2. The origin and life cycle of new organisms are mysteries that remain largely unknown.
  3. The existence of life outside of Earth is a topic of ongoing scientific inquiry, with challenges related to detecting and verifying life in the universe.
  4. Advances in microbiology have revealed the incredible diversity and resilience of microorganisms, with implications for human health, medicine, and environmental science.
  5. The microbiome plays a vital role in maintaining human health, protecting against disease, and shaping our metabolism.
  6. The microbiome's balance and integrity are essential for overall health, with disruptions leading to various health conditions.
  
  Sure, here is a final, consolidated summary of the main themes from the text:
  * Time is not a linear sequence of events but a four-dimensional continuum.
  * Spacetime curvature is the bending of space-time caused by mass and energy.
  * Relative and absolute time are two distinct concepts, with relative time relative to an observer's motion and absolute time independent of any observer.
  * The nature of time is philosophically and scientifically complex, with questions about its realness, beginning, and finitude.
  * Space and time play crucial roles in physics, influencing the motion of objects and allowing us to perceive the world around us.
  
  Sure, here's the summary you requested:
  **Main Themes:**
  * **Quantifying Order and Disorder:**
      * Entropy and information
      * Probability of rare events
      * Increasing complexity of life due to natural selection
  * **Evolution and Origin:**
      * Stellar evolution
      * Chemical composition
      * Origin of elements
      * Astrophysics
  **Specific Points:**
  * Entropy is a key concept in understanding disorder and uncertainty.
  * The probability of rare events is crucial for understanding the distribution of possibilities.
  * Natural selection drives the diversification of life.
  * Quantum mechanics challenges our intuitive understanding of reality.
  * Observation and analysis are essential for scientific progress.`
  const unmded = `Sure, here's a summary of the main themes from the text:
  Time and Perception
  Time is relative and subjective.
  Different perspectives can lead to different perceptions of time.
  Light and vision play a significant role in shaping the perception of time.
  Nature of Reality
  The passage raises questions about the nature of reality and the role of perception in shaping our understanding of the world.
  The text emphasizes the importance of perspective in shaping our perception of time.
  Human Connection and Relationships
  The passage explores the complex dynamics of family and the challenges of navigating relationships over time.
  It highlights the importance of communication and understanding in maintaining healthy relationships.
  Science and Technology
  The passage discusses the challenges of studying and observing life.
  It raises questions about the potential for life to exist outside of Earth, including the possibility of life existing in other planets.
  Light and Vision
  Light has transformative power and can shape perceptions of time.
  The passage highlights the importance of light and vision in understanding the world.
  
  Sure, here is the final summary of the main themes from the text:
  The study and observation of life are challenging due to the complex and dynamic nature of microorganisms.
  The origin and life cycle of new organisms are mysteries that remain largely unknown.
  The existence of life outside of Earth is a topic of ongoing scientific inquiry, with challenges related to detecting and verifying life in the universe.
  Advances in microbiology have revealed the incredible diversity and resilience of microorganisms, with implications for human health, medicine, and environmental science.
  The microbiome plays a vital role in maintaining human health, protecting against disease, and shaping our metabolism.
  The microbiome's balance and integrity are essential for overall health, with disruptions leading to various health conditions.
  
  Sure, here is a final, consolidated summary of the main themes from the text:
  Time is not a linear sequence of events but a four-dimensional continuum.
  Spacetime curvature is the bending of space-time caused by mass and energy.
  Relative and absolute time are two distinct concepts, with relative time relative to an observer's motion and absolute time independent of any observer.
  The nature of time is philosophically and scientifically complex, with questions about its realness, beginning, and finitude.
  Space and time play crucial roles in physics, influencing the motion of objects and allowing us to perceive the world around us.
  
  Sure, here's the summary you requested:
  Main Themes:
  Quantifying Order and Disorder:
      Entropy and information
      Probability of rare events
      Increasing complexity of life due to natural selection
  Evolution and Origin:
      Stellar evolution
      Chemical composition
      Origin of elements
      Astrophysics
  Specific Points:
  Entropy is a key concept in understanding disorder and uncertainty.
  The probability of rare events is crucial for understanding the distribution of possibilities.
  Natural selection drives the diversification of life.
  Quantum mechanics challenges our intuitive understanding of reality.
  Observation and analysis are essential for scientific progress.`;
  expect(unmd(md)).toBe(unmded);

})