import {
  LogService,
  MentionPill,
  MatrixClient,
  MessageEvent,
  MessageEventContent,
} from 'matrix-bot-sdk';
import Text2ImageAPI from '../services/txt2img-api';
import { MongoClient } from 'mongodb';
import getCollection from '../db';

export async function runImagineCommand(
  roomId: string,
  event: MessageEvent<MessageEventContent>,
  args: string[],
  client: MatrixClient,
  dbClient: MongoClient,
  api: Text2ImageAPI,
) {
  let prompt = args.join(' ');

  LogService.info('commands/imagine', prompt);

  const modelId = await api.getModel();

  const mention = await MentionPill.forUser(event.sender, roomId, client);
  let text = `${mention.text}, ошибка при обработке запроса⛔`;
  let html = `${mention.html}, ошибка при обработке запроса⛔`;

  if (modelId) {
    const uuid = await api.generate(prompt, modelId);
    if (uuid) {
      const collection = await getCollection(dbClient);

      await collection.insertOne({
        roomId: roomId,
        uuid: uuid,
        sender: event.sender,
      });

      text = `${mention.text}, ваш запрос обрабатывается⏳`;
      html = `${mention.html}, ваш запрос обрабатывается⏳`;
    }
  }

  return await client.sendMessage(roomId, {
    body: text,
    msgtype: 'm.notice',
    format: 'org.matrix.custom.html',
    formatted_body: html,
  });
}
