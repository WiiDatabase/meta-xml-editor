export interface MetaXml {
  name: string;
  coder: string;
  version: string;
  releaseDate: string;
  shortDescription: string;
  longDescription: string;
  arguments: string[];
  ahbAccess: boolean;
  noIosReload: boolean;
}

export function emptyMeta(): MetaXml {
  return {
    name: '',
    coder: '',
    version: '',
    releaseDate: '',
    shortDescription: '',
    longDescription: '',
    arguments: [],
    ahbAccess: false,
    noIosReload: false,
  };
}
