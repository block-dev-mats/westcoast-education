import { settings } from '../config/env.js';
import { IHttpClient } from '../interfaces/IHttpClient.js';

export default class HttpClient<T> implements IHttpClient<T> {
  private _url: string;

  constructor(resource: string) {
    this._url = `${settings.BASE_URL}/${resource}`;
  }

  async listAll(): Promise<T> {
    return await this.getData(this._url);
  }

  async find(id: number | string): Promise<T> {
    return await this.getData(`${this._url}/${id}`);
  }

  async add(data: T): Promise<T> {
    const response = await fetch(this._url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return await response.json() as T;
  }

  async update(id: number | string, data: T): Promise<T> {
    const response = await fetch(`${this._url}/${id}`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return await response.json() as T;
  }

  async delete(id: number | string): Promise<void> {
    const response = await fetch(`${this._url}/${id}`, {
      method: 'DELETE',
      headers: {
        'content-type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }
  }

  private async getData(url: string): Promise<T> {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'content-type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return await response.json() as T;
  }
}
