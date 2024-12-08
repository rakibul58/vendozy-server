export type TCategoryPayload = {
  name: string;
  description?: string;
  image: string
};

export type TCategoryFilterRequest = {
  searchTerm?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
};