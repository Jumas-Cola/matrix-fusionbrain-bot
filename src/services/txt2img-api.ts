import axios from 'axios';
import * as FormData from 'form-data';
import { LogService } from 'matrix-bot-sdk';

class Text2ImageAPI {
  private URL: string;
  private AUTH_HEADERS: { 'X-Key': string; 'X-Secret': string };

  constructor(apiKey: string | undefined, secretKey: string | undefined) {
    this.URL = 'https://api-key.fusionbrain.ai/';
    this.AUTH_HEADERS = {
      'X-Key': `Key ${apiKey}`,
      'X-Secret': `Secret ${secretKey}`,
    };
  }

  async getModel(): Promise<string | undefined> {
    try {
      const response = await axios.get(`${this.URL}key/api/v1/models`, {
        headers: this.AUTH_HEADERS,
      });
      const data = response.data;
      return data[0].id;
    } catch (error) {
      LogService.error('services/txt2img-api', `Error getting model: ${error}`);
    }
  }

  async generate(
    prompt: string,
    model: string,
    images: number = 1,
    width: number = 1024,
    height: number = 1024,
  ): Promise<string | undefined> {
    const params = {
      type: 'GENERATE',
      numImages: images,
      width: width,
      height: height,
      generateParams: {
        query: `${prompt}`,
      },
    };

    const form = new FormData();
    form.append('model_id', model);
    form.append('params', JSON.stringify(params), {
      contentType: 'application/json',
    });

    try {
      const response = await axios.post(
        `${this.URL}key/api/v1/text2image/run`,
        form,
        {
          headers: {
            ...this.AUTH_HEADERS,
            ...form.getHeaders(),
          },
        },
      );
      return response.data.uuid;
    } catch (error) {
      LogService.error(
        'services/txt2img-api',
        `Error generating image:: ${error}`,
      );
    }
  }

  async checkGeneration(requestId: string): Promise<string[] | undefined> {
    try {
      const response = await axios.get(
        `${this.URL}key/api/v1/text2image/status/${requestId}`,
        { headers: this.AUTH_HEADERS },
      );
      const data = response.data;

      return data;
    } catch (error) {
      LogService.error(
        'services/txt2img-api',
        `Error checking generation status: ${error}`,
      );
    }
  }
}

export default Text2ImageAPI;
