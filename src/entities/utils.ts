import type { ValueTransformer } from "typeorm";

export class FloatValueTransformer implements ValueTransformer {
  from(value: string) {
    return parseFloat(value);
  }

  to() {
    throw new Error('Not implemented.');
  }
}

export class IntValueTransformer implements ValueTransformer {
  from(value: string) {
    return parseInt(value);
  }

  to() {
    throw new Error('Not implemented.');
  }
}
