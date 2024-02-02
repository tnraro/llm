# ONNX 변환기

xenova/transformers.js의 [변환 스크립트](https://github.com/xenova/transformers.js/blob/main/scripts/convert.py)를 일부 수정

```sh
poetry install
poetry shell
python -m scripts.convert --quantize --model_id <model_name_or_path> --optimize O1
```