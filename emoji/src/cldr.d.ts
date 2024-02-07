interface CldrAnnotation {
  default: string[];
  tts: string[];
}
interface CldrAnnotationMap {
  [K: string]: CldrAnnotation;
}

interface CldrAnnotationIdentity {
  version: {
    _cldrVersion: string;
  };
  language: string;
}
declare module "cldr-annotations-derived-modern/annotationsDerived/ko/annotations.json" {
  interface CldrAnnotationDrivedJson {
    annotationsDerived: {
      identity: CldrAnnotationIdentity;
      annotations: CldrAnnotationMap;
    };
  }
  const json: CldrAnnotationDrivedJson;
  export default json;
}
declare module "cldr-annotations-modern/annotations/ko/annotations.json" {
  interface CldrAnnotationJson {
    annotations: {
      identity: CldrAnnotationIdentity;
      annotations: CldrAnnotationMap;
    };
  }
  const json: CldrAnnotationJson;
  export default json;
}
