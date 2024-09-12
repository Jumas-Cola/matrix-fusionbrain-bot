import { LogService, MatrixClient, MentionPill } from 'matrix-bot-sdk';
import { MongoClient } from 'mongodb';
import getCollection from '../db';
import Text2ImageAPI from '../services/txt2img-api';

export async function runCheckTxt2ImgTask(
  client: MatrixClient,
  dbClient: MongoClient,
  api: Text2ImageAPI,
) {
  const collection = await getCollection(dbClient);

  const tasks = await collection.find({}).toArray();

  for (const task of tasks) {
    const { uuid, roomId, sender } = task;

    const mention = await MentionPill.forUser(sender, roomId, client);
    let text = `${mention.text}, ошибка при обработке запроса⛔`;
    let html = `${mention.html}, ошибка при обработке запроса⛔`;

    try {
      const data = await api.checkGeneration(uuid);

      if (data['status'] === 'DONE') {
        const images = data['images'];

        if (images === undefined || images.length === 0) {
          client.sendMessage(roomId, {
            body: text,
            msgtype: 'm.notice',
            format: 'org.matrix.custom.html',
            formatted_body: html,
          });
          continue;
        }

        for (const image of images) {
          const buffer = Buffer.from(image, 'base64');

          const matrixUrl = await client.uploadContent(buffer, 'image/jpeg');

          client.sendMessage(roomId, {
            msgtype: 'm.image',
            body: mention.text,
            format: 'org.matrix.custom.html',
            formatted_body: mention.html,
            url: matrixUrl,
          });

          collection.deleteOne({ uuid: uuid });
        }
      }
    } catch (error) {
      collection.deleteOne({ uuid: uuid });

      client.sendMessage(roomId, {
        body: text,
        msgtype: 'm.notice',
        format: 'org.matrix.custom.html',
        formatted_body: html,
      });

      LogService.error('scheduler/txt2img', error);
    }
  }
}
