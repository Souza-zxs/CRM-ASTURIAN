export type ZyraRecord<TObjectUniversalIdentifier extends string = string> =
  string & { readonly __object?: TObjectUniversalIdentifier };
