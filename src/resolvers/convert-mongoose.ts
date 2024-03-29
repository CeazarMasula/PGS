export type BinaryQueryOperatorInput = {
    eq?: Buffer;
    ne?: Buffer;
    in?: [Buffer];
    nin?: [Buffer];
}
  export type StringQueryOperatorInput = {
    eq?: String;
    ne?: String;
    in?: [String];
    nin?: [String];
    startsWith?: String;
    contains?: String;
  }