export interface IHttpClient<T> {
  listAll(): Promise<T>;
  find(id: number | string): Promise<T>;
  add(data: T): Promise<T>;
  update(id: number | string, data: T): Promise<T>;
  delete(id: number | string): Promise<void>;
}
