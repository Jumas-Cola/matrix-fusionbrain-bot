let error = true;

let res = [
  db.fusionbrainTasks.drop(),
  db.fusionbrainTasks.insertOne({
    uuid: '',
    roomId: 'test',
    sender: '@test:localhost',
  }),
  db.fusionbrainTasks.deleteOne({ roomId: 'test' }),
];

printjson(res);
