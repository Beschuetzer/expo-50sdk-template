import { displayAlert } from '@/utils/helpers';

class BffService {
  private readonly BACKEND_URL =
    'https://grocify-bff-ac27c2662495.herokuapp.com';

  constructor(
    private test: string,
    private test2: number,
  ) {
    console.log({ test, test2 });
  }

  print() {
    displayAlert({ test: this.test, test2: this.test2 });
  }

  setTest(value: string) {
    this.test = value;
  }

  async createMock() {
    try {
      const response = await fetch(`${this.BACKEND_URL}/mockCreation`);
      if (response.ok) {
        const result = await response.json();
        console.log({ result });
        return result;
      }
      displayAlert({ response });
    } catch (error) {
      displayAlert({
        error,
        message: 'Unable to hit BACKEND_URL/mockCreation',
      });
    }
    return null;
  }

  async password(username: string, password: string) {
    try {
      const body = JSON.stringify({ username, password });
      const response = await fetch(`${this.BACKEND_URL}/password`, {
        method: 'POST',
        body,
        headers: {
          'content-type': 'application/json',
        },
      });
      if (response.ok) {
        const result = await response.json();
        console.log({ result });
        return result;
      }
      displayAlert({ response });
    } catch (error) {
      displayAlert({ error, message: 'Unable to hit BACKEND_URL/password' });
    }
    return null;
  }
}

export const BACKEND_SERVICE = new BffService('test1', 100);
