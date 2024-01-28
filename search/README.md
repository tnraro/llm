# search

구글 검색 상위 3개 페이지를 긁어와서 각각 한 줄로 요약해주는 프로그램

```
$ bun install
$ bun run index.ts [검색어]
```

결과물은 `result.md`에 만들어집니다.

## 예시

```
$ bun run index.ts llama.cpp
```

```md
# llama.cpp

ggerganov의 'llama.cpp' 리포지토리는 Facebook LLaMA 모델을 C/C++로 포팅한 프로젝트로, MIT 라이선스 하에서 개방적인 사용을 허용하며 활발한 커뮤니티와 다양한 프로젝트들과 연계되어 있습니다.[[1](https://github.com/ggerganov/llama.cpp)]
Llama.cpp에 기반한 llama-cpp-python은 Hugging Face 등의 LLM 모델들을 인FERENCE하는 Python 바인딩입니다, 이를 LangChain 안에서 사용할 수 있게 해주는 노트북 글도 제공. CPU, GPU 및 Metal 플랫폼을 지원하며 GGUF 모델 파일을 사용하는 변경으로 인한 브레이크링크에 대응하기 위해 GGML 모델들 간의 변환도 제공.[[2](https://python.langchain.com/docs/integrations/llms/llamacpp)]
abetlen/llama-cpp-python은 llama.cpp 라이브러리를 간단하게 Python과 연동할 수 있는 5.3만 개의 스타가 있는 오픈 소스 프로젝트입니다. 그것은 LLM(머신 학습 기반 언어 모델)과 관련된 단순한 사용자 API, 고급 인터페이스를 제공하며 오픈AI와 유사한 구조로 설계되었습니다.[[3](https://github.com/abetlen/llama-cpp-python)]
```