export type DynamicObject<
  Value = any,
  Key extends string | number = string,
  AllKeysRequired = false,
> = AllKeysRequired extends true
  ? { [K in Key]: Value }
  : { [K in Key]?: Value }

export type AllKeysRequired = true